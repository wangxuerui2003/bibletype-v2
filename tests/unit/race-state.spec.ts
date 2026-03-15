import { beforeEach, describe, expect, it } from "vitest";
import {
  createPrivateLobby,
  enqueueQuickMatch,
  getRaceLobby,
  resetRaceState,
  setRaceReady,
  updateRaceProgress,
} from "../../server/services/race-state";

describe("race state", () => {
  beforeEach(() => {
    resetRaceState();
  });

  it("creates a private lobby", () => {
    const lobby = createPrivateLobby({
      hostUserId: "u1",
      hostName: "Host",
      targetPlayers: 2,
      verseReference: "John 1:1",
      raceText: "In the beginning",
      totalChars: 16,
    });

    expect(getRaceLobby(lobby.id)).toMatchObject({
      type: "snapshot",
      lobbyId: lobby.id,
      players: [{ userId: "u1" }],
    });
  });

  it("matches quick queue when enough players join", () => {
    enqueueQuickMatch({
      userId: "u1",
      name: "A",
      targetPlayers: 2,
      verseReference: "John 1:1",
      raceText: "In the beginning",
      totalChars: 16,
    });

    const result = enqueueQuickMatch({
      userId: "u2",
      name: "B",
      targetPlayers: 2,
      verseReference: "John 1:1",
      raceText: "In the beginning",
      totalChars: 16,
    });

    expect(result.matched).toBe(true);
  });

  it("updates readiness and progress", () => {
    const lobby = createPrivateLobby({
      hostUserId: "u1",
      hostName: "Host",
      targetPlayers: 2,
      verseReference: "John 1:1",
      raceText: "In the beginning",
      totalChars: 16,
    });

    lobby.players.push({
      userId: "u2",
      name: "Guest",
      ready: false,
      connected: true,
      completedChars: 0,
    });

    const snapshot = setRaceReady(lobby.id, "u1", true);
    expect(snapshot?.type).toBe("snapshot");

    const progress = updateRaceProgress(lobby.id, "u1", 8);
    expect(progress?.type).toBe("snapshot");
  });
});
