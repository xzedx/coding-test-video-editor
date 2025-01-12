import "./App.css";
import { Timeline } from "./components/Timeline";

function App() {
  return (
    <div className="w-screen h-screen flex flex-col">
      <div className="flex-1">
        <h1 className="text-4xl font-bold">Coding Test Video Editor</h1>
      </div>
      <div className="w-screen h-[500px]">
        <Timeline />
      </div>
    </div>
  );
}

export default App;
