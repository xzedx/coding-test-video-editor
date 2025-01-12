import { VideoFileData } from "@/store/timeline";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

type Props = {
  file: VideoFileData;
};

export const DraggableVideoItem = ({ file }: Props) => {
  const { attributes, listeners, setNodeRef, isDragging, transform } =
    useDraggable({
      id: `file-${file.id}`,
    });

  return (
    <div
      ref={setNodeRef}
      className="aspect-video"
      onClick={(e) => {
        e.stopPropagation();
      }}
      {...attributes}
      {...listeners}
      style={{
        transform: isDragging ? CSS.Transform.toString(transform) : "",
      }}
    >
      <img className="w-full h-full object-cover" src={file.coverImage}></img>
    </div>
  );
};
