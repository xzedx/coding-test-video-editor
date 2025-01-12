import { pixelsPerSecond } from "@/config";
import { UniqueIdentifier } from "@dnd-kit/core";
import { produce } from "immer";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export type State = {
  videoFiles: {
    file: File;
    coverImage?: string;
  }[];
  draggingClipId: UniqueIdentifier | null;
  pixelsPerSecond: number;
  activeClipId: string | null;
  tracks: TrackState[];
  clips: ClipState[];
};

export type TrackState = {
  id: string;
};

export type ClipState = {
  id: string;
  trackId: string;
  duration: number;
  offsetTime: number;
  startClipTime: number;
  endClipTime: number;
};

type Actions = {
  addVideoFiles: (file: File[]) => void;
  setDraggingClipId: (id: UniqueIdentifier | null) => void;
  setActiveClipId: (id: string | null) => void;
  addTrack: (index: string) => string;
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
    clips: [],
    addVideoFiles: (files: File[]) => {
      set((state) => ({
        ...state,
        videoFiles: state.videoFiles.concat(files.map((file) => ({ file }))),
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
        id: Math.random().toString(36).slice(2, 10), //TODO
      };

      console.log("!", index);

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
