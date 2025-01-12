import { useState } from "react";

type Track = {
  id: string;
  clips: any[];
};

export const Timeline = () => {
  const [tracks, setTracks] = useState<Track[]>([
    {
      id: "1",
      clips: [
        {
          duration: 10,
        },
      ],
    },
  ]);

  return (
    <div className="w-full h-full border-t p-4 flex flex-col gap-y-4 justify-center">
      {tracks.map((track, index) => (
        <div id={track.id} className="flex">
          <div>id: {track.id}</div>
          <div className="w-full bg-muted h-12 rounded-lg">
            {track.clips.map((clip, index) => (
              <div
                key={index}
                className="w-full h-full bg-muted-foreground rounded-lg"
                style={{
                  width: `${clip.duration * 100}px`,
                }}
              ></div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
