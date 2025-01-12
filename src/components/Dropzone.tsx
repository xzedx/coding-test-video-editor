import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud } from "lucide-react";
import { useTimelineStore } from "@/store/timeline";
import { DraggableVideoItem } from "./DraggableVideoItem";
import { useFFmpeg } from "@/hooks/useFFmpeg";
import { getVideoCoverImage, getVideoDuration } from "@/lib/utils";

export function VideoDropzone() {
  const { videoFiles, addVideoFiles } = useTimelineStore();
  const { ffmpegRef } = useFFmpeg();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const filesData = await Promise.all(
      acceptedFiles.map(async (file) => {
        const duration = await getVideoDuration(ffmpegRef.current, file);
        const coverImage = await getVideoCoverImage(ffmpegRef.current, file);
        return {
          id: Math.random().toString(36).slice(2, 10),
          file,
          coverImage,
          duration,
        };
      })
    );
    addVideoFiles(filesData);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "video/mp4": [".mp4"],
      "video/webm": [".webm"],
      "video/ogg": [".ogv"],
    },
  });

  return (
    <div className="h-full border-r border-gray-300 bg-gray-50">
      <div {...getRootProps()} className="h-full">
        {videoFiles.length === 0 && (
          <label className="relative flex w-full h-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 py-6">
            <div className=" text-center">
              <div className=" mx-auto max-w-min rounded-md border p-2">
                <UploadCloud size={20} />
              </div>

              <p className="mt-2 text-sm text-gray-600">
                <span className="font-semibold">拖拽文件到此处</span>
              </p>
            </div>
          </label>
        )}
        <div className="grid grid-cols-2 gap-2 p-2">
          {videoFiles.map((file) => (
            <DraggableVideoItem key={file.file.name} file={file} />
          ))}
        </div>
      </div>

      <input
        {...getInputProps()}
        id="dropzone-file"
        type="file"
        className="hidden"
      />
    </div>
  );
}
