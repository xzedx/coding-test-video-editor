import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";
import { useEffect, useRef, useState } from "react";

export function useFFmpeg() {
  const [loading, setLoading] = useState(true);
  const messageRef = useRef<HTMLParagraphElement | null>(null);
  const ffmpegRef = useRef(new FFmpeg());

  const loadffmpeg = async () => {
    // const baseURL = "https://unpkg.com/@ffmpeg/core-mt@0.12.9/dist/esm";
    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.9/dist/esm";
    const ffmpeg = ffmpegRef.current;
    ffmpeg.on("log", ({ message }) => {
      if (messageRef.current) messageRef.current.innerHTML = message;
    });
    // toBlobURL is used to bypass CORS issue, urls with the same
    // domain can be used directly.
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        "application/wasm"
      ),
      // workerURL: await toBlobURL(
      //   `${baseURL}/ffmpeg-core.worker.js`,
      //   "text/javascript"
      // ),
    });
    setLoading(false);
  };

  useEffect(() => {
    loadffmpeg();
  }, []);

  return {
    ffmpegRef,
    loading,
  };
}
