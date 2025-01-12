import { useTimelineStore } from "@/store/timeline";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import { Track } from "./Track";
import { DroppableTrackCreator } from "./DroppableTrackCreator";
import { Clip } from "./Clip";
import { Fragment } from "react/jsx-runtime";

export const Timeline = () => {
  const {
    draggingClipId,
    pixelsPerSecond,
    tracks,
    clips,
    setDraggingClipId,
    addTrack,
    updateClip,
    setActiveClipId,
    cleanupTracks,
  } = useTimelineStore();

  const draggingClip = clips.find((c) => c.id === draggingClipId?.toString());

  return (
    <DndContext
      onDragMove={(e) => {
        const clipId = e.active.id.toString().split("-")[1];
        setDraggingClipId(clipId);
      }}
      onDragEnd={(e) => {
        if (e.over?.id.toString().includes("track-creator")) {
          const index = e.over.id.toString().split("-")[2];
          const clipId = e.active.id.toString().split("-")[1];
          const newTrackId = addTrack(index);
          updateClip(clipId, {
            trackId: newTrackId,
          });
          cleanupTracks();
          return;
        }

        if (e.active.id.toString().includes("clip")) {
          let newTrackId = null;
          if (e.over?.id.toString().includes("track")) {
            newTrackId = e.over.id.toString().split("-")[1];
          }
          const clipId = e.active.id.toString().split("-")[1];
          const clip = clips.find((c) => c.id === clipId);

          if (!clip) return;
          const newOffsetTime = clip?.offsetTime + e.delta.x / pixelsPerSecond;

          updateClip(clipId, {
            ...clip,
            offsetTime: newOffsetTime > 0 ? newOffsetTime : 0,
            ...(newTrackId ? { trackId: newTrackId } : {}),
          });

          if (newTrackId) {
            cleanupTracks();
          }
        }
        setDraggingClipId(null);
      }}
    >
      <div
        className="w-full h-full border-t p-4 flex flex-col gap-y-2 justify-center relative"
        onMouseDown={() => {
          setActiveClipId(null);
        }}
      >
        {tracks.map((track, index) => (
          <Fragment key={`section-${index}`}>
            <DroppableTrackCreator key={`${track.id}-creator`} index={index} />
            <Track index={tracks.length - index} key={track.id} data={track} />
          </Fragment>
        ))}
        <div className="flex-1"></div>
      </div>

      <DragOverlay dropAnimation={null}>
        {draggingClipId && draggingClip && <Clip data={draggingClip} />}
      </DragOverlay>
    </DndContext>
  );
};
