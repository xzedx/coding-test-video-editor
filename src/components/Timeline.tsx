import { useTimelineStore } from "@/store/timeline";
import { DragOverlay } from "@dnd-kit/core";
import { Fragment } from "react/jsx-runtime";
import { Clip } from "./Clip";
import { DroppableTrackCreator } from "./DroppableTrackCreator";
import { Track } from "./Track";

export const Timeline = () => {
  const { draggingClipId, tracks, clips, setActiveClipId } = useTimelineStore();

  const draggingClip = clips.find((c) => c.id === draggingClipId?.toString());

  return (
    <div className="h-full">
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
    </div>
  );
};
