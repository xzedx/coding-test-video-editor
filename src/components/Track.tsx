import { TrackState, useTimelineStore } from "@/store/timeline";
import { useDndMonitor, useDroppable } from "@dnd-kit/core";
import { useShallow } from "zustand/react/shallow";
import { Clip, DraggableClip } from "./Clip";
import { useState } from "react";

type Props = {
  index: number;
  data: TrackState;
};

export const Track = ({ index, data }: Props) => {
  const [deltaX, setDeltaX] = useState<number>(0);
  const draggingClip = useTimelineStore(
    useShallow((state) =>
      state.clips.find((c) => c.id === state.draggingClipId)
    )
  );
  const clipsInTrack = useTimelineStore(
    useShallow((state) => state.clips.filter((c) => c.trackId === data.id))
  );

  useDndMonitor({
    onDragMove(event) {
      setDeltaX(event.delta.x);
    },
  });

  const { setNodeRef, isOver } = useDroppable({
    id: `track-${data.id}`,
  });

  return (
    <div ref={setNodeRef} className="flex items-center z-10">
      <div className="w-10 text-xs">Track: {index}</div>
      <div className="w-full bg-muted h-12 rounded-lg relative">
        {clipsInTrack.map((clip, index) => (
          <DraggableClip key={`${data.id}-${index}`} data={clip} />
        ))}
        {isOver && draggingClip && (
          <Clip
            isPlaceholder
            data={draggingClip}
            style={{
              transform: `translateX(${deltaX}px)`,
            }}
          />
        )}
      </div>
    </div>
  );
};
