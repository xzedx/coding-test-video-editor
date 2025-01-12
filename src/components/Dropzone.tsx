import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud } from "lucide-react";
import { useTimelineStore } from "@/store/timeline";

export function VideoDropzone() {
  const { videoFiles, addVideoFiles } = useTimelineStore();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    addVideoFiles(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/mp4": [".mp4"],
      "video/webm": [".webm"],
      "video/ogg": [".ogv"],
    },
  });

  return (
    <div className="h-full border-r-2 border-gray-300 bg-gray-50">
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
            <div key={file.name}></div>
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
