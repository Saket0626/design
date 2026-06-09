import assert from "node:assert/strict";
import test from "node:test";
import { getWorkshopLoadState } from "../src/pages/workshopLoadState.ts";
import type { WorkshopRoom } from "../src/types";

const savedRoom: WorkshopRoom = {
  id: "room-1",
  userId: "user-1",
  name: "Saved room",
  backgroundUrl: "https://example.com/room.jpg",
  placedProducts: [
    {
      id: "placed-1",
      productId: "chair-1",
      x: 10,
      y: 20,
      scale: 1,
      rotation: 0,
    },
  ],
  notes: "Keep these edits",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-02T00:00:00.000Z",
};

test("direct loading an existing room waits for workshop data and keeps the route id", () => {
  assert.deepEqual(
    getWorkshopLoadState({
      roomId: "room-1",
      newRoomId: "generated-room",
      workshops: [],
      loading: true,
    }),
    { status: "loading", roomDbId: "room-1" }
  );
});

test("loaded existing rooms are edited with their saved state and route id", () => {
  assert.deepEqual(
    getWorkshopLoadState({
      roomId: "room-1",
      newRoomId: "generated-room",
      workshops: [savedRoom],
      loading: false,
    }),
    {
      status: "ready",
      roomDbId: "room-1",
      isNewRoom: false,
      initialRoom: savedRoom,
    }
  );
});

test("missing existing rooms are not silently recreated under the requested id", () => {
  assert.deepEqual(
    getWorkshopLoadState({
      roomId: "missing-room",
      newRoomId: "generated-room",
      workshops: [savedRoom],
      loading: false,
    }),
    { status: "not-found", roomDbId: "missing-room" }
  );
});

test("new rooms use the generated id only when there is no route id", () => {
  assert.deepEqual(
    getWorkshopLoadState({
      newRoomId: "generated-room",
      workshops: [savedRoom],
      loading: false,
    }),
    {
      status: "ready",
      roomDbId: "generated-room",
      isNewRoom: true,
      initialRoom: undefined,
    }
  );
});
