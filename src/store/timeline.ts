import { pixelsPerSecond } from "@/config";
import { UniqueIdentifier } from "@dnd-kit/core";
import { produce } from "immer";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export type State = {
  videoFiles: VideoFileData[];
  draggingClipId: UniqueIdentifier | null;
  pixelsPerSecond: number;
  activeClipId: string | null;
  tracks: TrackState[];
  clips: ClipState[];
};

export type VideoFileData = {
  id: string;
  file: File;
  coverImage: string;
  duration: number;
};

export type TrackState = {
  id: string;
};

export type ClipState = {
  id: string;
  loadingThumbnails?: boolean;
  trackId: string;
  duration: number;
  offsetTime: number;
  startClipTime: number;
  endClipTime: number;
  thumbnails?: Thumbnail[];
};

export type Thumbnail = {
  time: number;
  url: string;
};

type Actions = {
  addVideoFiles: (file: VideoFileData[]) => void;
  setDraggingClipId: (id: UniqueIdentifier | null) => void;
  setActiveClipId: (id: string | null) => void;
  addTrack: (index: string) => string;
  addClip: (
    trackId: string,
    fileId: string,
    thumbnails?: Thumbnail[]
  ) => string;
  updateClip: (id: string, clip: Partial<ClipState>) => void;
  cleanupTracks: () => void;
};

export const useTimelineStore = create<State & Actions>()(
  immer((set) => ({
    videoFiles: [],
    draggingClipTransform: { x: 0, y: 0 },
    draggingClipId: null,
    pixelsPerSecond: pixelsPerSecond,
    activeClipId: null,
    tracks: [
      {
        id: "0",
      },
    ],
    clips: [
      {
        id: "0",
        trackId: "0",
        duration: 10,
        offsetTime: 0,
        startClipTime: 0,
        endClipTime: 10,
      },
    ],
    addClip: (trackId, fileId, thumbnails?: Thumbnail[]) => {
      let newClip: ClipState;
      const clipId = Math.random().toString(36).slice(2, 10);
      set((state) => {
        const videoFile = state.videoFiles.find((f) => f.id === fileId);
        if (!videoFile) return state;

        newClip = {
          id: clipId,
          trackId,
          duration: videoFile.duration,
          offsetTime: 0,
          startClipTime: 0,
          endClipTime: videoFile.duration,
          thumbnails,
          loadingThumbnails: true,
        };

        return {
          ...state,
          clips: state.clips.concat(newClip),
        };
      });
      return clipId;
    },
    addVideoFiles: async (files: VideoFileData[]) => {
      set((state) => ({
        ...state,
        videoFiles: state.videoFiles.concat(files),
      }));
    },
    setDraggingClipId: (id: UniqueIdentifier | null) => {
      set((state) => ({
        ...state,
        draggingClipId: id,
      }));
    },
    setActiveClipId: (id: string | null) => {
      set((state) => ({
        ...state,
        activeClipId: id,
      }));
    },

    addTrack: (index) => {
      const newTrack = {
        id: Math.random().toString(36).slice(2, 10),
      };

      set((state) => ({
        ...state,
        tracks: produce(state.tracks, (draftTracks) => {
          draftTracks.splice(+index, 0, newTrack);
        }),
      }));
      return newTrack.id;
    },
    updateClip: (id: string, updateClipData: Partial<ClipState>) => {
      set((state) => ({
        ...state,
        clips: state.clips.map((c) => {
          if (c.id === id) {
            return {
              ...c,
              ...updateClipData,
            };
          }
          return c;
        }),
      }));
    },
    cleanupTracks: () => {
      set((state) => ({
        ...state,
        tracks: produce(state.tracks, (draftTracks) => {
          return draftTracks.filter((track) => {
            return (
              state.clips.some((clip) => clip.trackId === track.id) ||
              track.id === "0"
            );
          });
        }),
      }));
    },
  }))
);
