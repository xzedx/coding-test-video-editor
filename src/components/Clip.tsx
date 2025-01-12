import { pixelsPerSecond } from "@/config";
import { cn } from "@/lib/utils";
import { ClipState, useTimelineStore } from "@/store/timeline";
import { DraggableAttributes, useDraggable } from "@dnd-kit/core";
import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { clamp } from "lodash";
import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";

type Props = {
  style?: React.CSSProperties;
  className?: string;
  data: ClipState;
  isPlaceholder?: boolean;
  isDragging?: boolean;
  listeners?: SyntheticListenerMap;
  attributes?: DraggableAttributes;
};

export const Clip = forwardRef<HTMLDivElement, Props>(
  (
    {
      data,
      isPlaceholder,
      isDragging,
      listeners: listener,
      attributes,
      className,
      style,
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [rect, setRect] = useState<DOMRect | null>(null);
    const [activeClipId, setActiveClipId] = useTimelineStore(
      useShallow((state) => [state.activeClipId, state.setActiveClipId])
    );
    const isActive = activeClipId === data.id;

    const { updateClip } = useTimelineStore();

    const [isResizing, setIsResizing] = useState<null | "start" | "end">(null);

    const handlePointerUp = () => {
      setIsResizing(null);
    };

    const handlePointerMove = (e: MouseEvent) => {
      e.preventDefault();
      if (!containerRef.current || !rect) return;

      if (isResizing === "start") {
        const deltaX = e.clientX - rect?.left;
        const startClipTime = data.startClipTime + deltaX / pixelsPerSecond;
        updateClip(data.id, {
          ...data,
          startClipTime: clamp(startClipTime, 0, data.endClipTime),
        });
      } else if (isResizing === "end") {
        const deltaX = e.clientX - rect.width - rect?.left;
        const endClipTime = data.endClipTime + deltaX / pixelsPerSecond;
        updateClip(data.id, {
          ...data,
          endClipTime: clamp(endClipTime, data.startClipTime, data.duration),
        });
      }
    };

    useEffect(() => {
      if (isResizing) {
        window.addEventListener("pointerup", handlePointerUp);
        window.addEventListener("pointermove", handlePointerMove);
      } else {
        window.removeEventListener("pointerup", handlePointerUp);
        window.removeEventListener("pointermove", handlePointerMove);
      }

      return () => {
        window.removeEventListener("pointerup", handlePointerUp);
        window.removeEventListener("pointermove", handlePointerMove);
      };
    }, [isResizing]);

    const left = useMemo(() => {
      if (isDragging) return 0;

      const offsetX = data?.offsetTime ? data.offsetTime * pixelsPerSecond : 0;
      const clipOffsetX = data.startClipTime * pixelsPerSecond;
      return offsetX + clipOffsetX;
    }, [data.offsetTime, data.startClipTime, isDragging]);

    const width = useMemo(() => {
      const actualDuration = data.endClipTime - data.startClipTime;
      return actualDuration * pixelsPerSecond;
    }, [data.endClipTime, data.startClipTime]);

    if (isPlaceholder) {
      return (
        <div
          className={cn(
            "border-2 border-green-200 h-full rounded-lg absolute",
            className
          )}
          style={{
            width,
            left,
            ...style,
          }}
        ></div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          "absolute h-full bg-muted-foreground rounded-lg",
          isActive && "border-4 border-red-300",
          isDragging && "opacity-0",
          className
        )}
        style={{
          width,
          left,
          ...style,
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
          setActiveClipId(data.id);
        }}
        {...attributes}
        {...listener}
      >
        <div className="w-full h-full" ref={containerRef}></div>
        {isActive && (
          <>
            <div className="pointer-events-none select-none text-xs">
              {JSON.stringify({ isResizing })}
            </div>
            <div
              className="w-2 h-1/2 bg-red-600 absolute top-1/2 -left-2 -translate-y-1/2 rounded cursor-col-resize"
              onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation();

                setIsResizing("start");
                if (containerRef.current) {
                  const rect = containerRef.current?.getBoundingClientRect();
                  setRect(rect);
                }
              }}
              onMouseUp={() => {
                setIsResizing(null);
              }}
            ></div>
            <div
              className="w-2 h-1/2 bg-red-600 absolute top-1/2 -right-2 -translate-y-1/2 rounded cursor-col-resize"
              onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation();

                setIsResizing("end");
                if (containerRef.current) {
                  const rect = containerRef.current?.getBoundingClientRect();
                  setRect(rect);
                }
              }}
              onMouseUp={() => {
                setIsResizing(null);
              }}
            ></div>
          </>
        )}
      </div>
    );
  }
);

export const DraggableClip = ({ data }: { data: ClipState }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `clip-${data.id}`,
  });

  return (
    <Clip
      isDragging={isDragging}
      ref={setNodeRef}
      data={data}
      listeners={listeners}
      attributes={attributes}
    />
  );
};
