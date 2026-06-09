import type { WorkshopRoom } from "../types";

type WorkshopLoadStateInput = {
  roomId?: string;
  newRoomId: string;
  workshops: WorkshopRoom[];
  loading: boolean;
};

export type WorkshopLoadState =
  | { status: "loading"; roomDbId: string }
  | { status: "not-found"; roomDbId: string }
  | {
      status: "ready";
      roomDbId: string;
      isNewRoom: boolean;
      initialRoom?: WorkshopRoom;
    };

export function getWorkshopLoadState({
  roomId,
  newRoomId,
  workshops,
  loading,
}: WorkshopLoadStateInput): WorkshopLoadState {
  const existing = roomId ? workshops.find((w) => w.id === roomId) : undefined;
  const roomDbId = roomId ?? newRoomId;

  if (roomId && loading && !existing) {
    return { status: "loading", roomDbId };
  }

  if (roomId && !loading && !existing) {
    return { status: "not-found", roomDbId };
  }

  return {
    status: "ready",
    roomDbId,
    isNewRoom: !roomId,
    initialRoom: existing,
  };
}
