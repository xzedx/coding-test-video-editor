import { cn } from "@/lib/utils";
import { useDroppable } from "@dnd-kit/core";

type Props = {
  index: number;
};

export const DroppableTrackCreator = ({ index }: Props) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `track-creator-${index}`,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn("bg-red-100 w-full h-4 flex items-end", index === 0 && "flex-1")}
    >
      {isOver && <div className="bg-green-400 w-full h-2"></div>}
    </div>
  );
};
