import "./App.css";
import { VideoDropzone } from "./components/Dropzone";
import { Timeline } from "./components/Timeline";
import { useTimelineStore } from "./store/timeline";

function App() {
  const { pixelsPerSecond, tracks, clips, videoFiles } = useTimelineStore();
  return (
    <div className="w-screen h-screen flex flex-col">
      <div className="flex-1 flex flex-col">
        <h1 className="text-4xl font-bold">Coding Test Video Editor</h1>
        <div>
          {JSON.stringify({
            videoFiles,
            pixelsPerSecond,
            tracks,
            clips,
          })}
        </div>
        <div className="grid grid-cols-[3fr_7fr] gap-x-4 flex-1">
          <VideoDropzone />
        </div>
      </div>
      <div className="w-screen h-[500px]">
        <Timeline />
      </div>
    </div>
  );
}

export default App;
