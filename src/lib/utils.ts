import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}

export async function getVideoDuration(ffmpeg: FFmpeg, file: File) {
  await ffmpeg.writeFile(file.name, await fetchFile(file));
  await ffmpeg.ffprobe([
    "-v",
    "error",
    "-show_entries",
    "format=duration",
    "-of",
    "default=noprint_wrappers=1:nokey=1",
    file.name,
    "-o",
    "output.txt",
  ]);
  const duration = await ffmpeg.readFile("output.txt", "utf8");
  console.log(`${file.name} loaded, duration: ${duration}`);
  return +duration.toString();
}

export async function getVideoCoverImage(ffmpeg: FFmpeg, file: File) {
  await ffmpeg.writeFile(file.name, await fetchFile(file));

  await ffmpeg.exec([
    "-i",
    file.name,
    "-ss",
    "0",
    "-frames:v",
    "1",
    "-vf",
    "scale=64:-1",
    "-threads",
    "4",
    `thumb.jpg`,
  ]);

  const imageData = await ffmpeg.readFile(`thumb.jpg`);
  const blob = new Blob([imageData], { type: "image/jpeg" });
  const url = await blobToBase64(blob);
  console.log("thumb", url);
  return url;
}

export async function getVideoThumbnails(
  ffmpeg: FFmpeg,
  file: File,
  duration: number,
  pixelsPerSecond: number
) {
  await ffmpeg.writeFile(file.name, await fetchFile(file));

  const clipWidth = duration * pixelsPerSecond;
  const thumbnailWidth = (40 / 9) * 16;
  const thumbnailsCount = Math.ceil(clipWidth / thumbnailWidth);
  const interval = duration / thumbnailsCount;

  let thumbnails = [];
  for (let time = 0; time < +duration; time += interval) {
    thumbnails.push({ time, url: "" });
  }
  thumbnails = await Promise.all(
    thumbnails.map(async ({ time }) => {
      await ffmpeg.exec([
        "-i",
        file.name,
        "-ss",
        time.toString(),
        "-frames:v",
        "1",
        "-vf",
        "scale=64:-1",
        "-threads",
        "4",
        `thumb_${time}.jpg`,
      ]);

      const data = await ffmpeg.readFile(`thumb_${time}.jpg`);
      const blob = new Blob([data], { type: "image/jpeg" });
      const url = await blobToBase64(blob);
      console.log(`thumbnail ${time}s loaded`);
      return { time, url: url?.toString() ?? "" };
    })
  );
  return thumbnails;
}
