import { DndContext, DragEndEvent, DragMoveEvent } from "@dnd-kit/core";
import "./App.css";
import { VideoDropzone } from "./components/Dropzone";
import { Timeline } from "./components/Timeline";
import { useFFmpeg } from "./hooks/useFFmpeg";
import { getVideoThumbnails } from "./lib/utils";
import { useTimelineStore } from "./store/timeline";

function App() {
  const {
    pixelsPerSecond,
    clips,
    videoFiles,
    setDraggingClipId,
    addTrack,
    addClip,
    updateClip,
    cleanupTracks,
  } = useTimelineStore();

  const { ffmpegRef, loading: loadingFFmpeg } = useFFmpeg();

  if (loadingFFmpeg) return <div>Loading...</div>;

  const handleDragMove = (e: DragMoveEvent) => {
    const clipId = e.active.id.toString().split("-")[1];
    setDraggingClipId(clipId);
  };

  const handleDragEnd = async (e: DragEndEvent) => {
    console.log(e);
    /* Drop over Track Creator */
    if (e.over?.id.toString().includes("track-creator")) {
      const index = e.over.id.toString().split("-")[2];
      const newTrackId = addTrack(index);

      if (e.active.id.toString().includes("clip")) {
        const clipId = e.active.id.toString().split("-")[1];
        updateClip(clipId, {
          trackId: newTrackId,
        });
      }

      if (e.active.id.toString().includes("file")) {
        const fileId = e.active.id.toString().split("-")[1];
        const videoFile = videoFiles.find((f) => f.id === fileId);
        if (!videoFile) return;

        const clipId = addClip(newTrackId, fileId);

        const thumbnails = await getVideoThumbnails(
          ffmpegRef.current,
          videoFile.file,
          videoFile.duration,
          pixelsPerSecond
        );
        updateClip(clipId, {
          thumbnails,
          loadingThumbnails: false,
        });
      }

      cleanupTracks();
      return;
    }

    /* Drop over Track */
    if (e.over?.id.toString().includes("track")) {
      const trackId = e.over.id.toString().split("-")[1];
      if (e.active.id.toString().includes("clip")) {
        const clipId = e.active.id.toString().split("-")[1];
        const clip = clips.find((c) => c.id === clipId);

        if (!clip) return;

        const newOffsetTime = clip?.offsetTime + e.delta.x / pixelsPerSecond;

        updateClip(clipId, {
          trackId,
          offsetTime: newOffsetTime > 0 ? newOffsetTime : 0,
        });

        if (trackId !== clip.trackId) {
          cleanupTracks();
        }
      }

      if (e.active.id.toString().includes("file")) {
        const fileId = e.active.id.toString().split("-")[1];
        const videoFile = videoFiles.find((f) => f.id === fileId);
        if (!videoFile) return;

        const clipId = addClip(trackId, fileId);

        const thumbnails = await getVideoThumbnails(
          ffmpegRef.current,
          videoFile.file,
          videoFile.duration,
          pixelsPerSecond
        );
        updateClip(clipId, {
          thumbnails,
          loadingThumbnails: false,
        });
      }
    }

    setDraggingClipId(null);
  };

  return (
    <DndContext onDragMove={handleDragMove} onDragEnd={handleDragEnd}>
      <div className="w-screen h-screen flex flex-col">
        <div className="flex-1 flex flex-col">
          <h1 className="text-4xl font-bold">Coding Test Video Editor</h1>

          <div className="grid grid-cols-[3fr_7fr] gap-x-4 flex-1">
            <VideoDropzone />
          </div>
        </div>
        <div className="w-screen h-[500px]">
          <Timeline />
        </div>
      </div>
    </DndContext>
  );
}

export default App;
