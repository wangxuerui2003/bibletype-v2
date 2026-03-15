import { createId } from "../../lib/ids";
import type { RaceBroadcast } from "../../lib/race";

type LobbyPlayer = {
  userId: string;
  name: string;
  ready: boolean;
  connected: boolean;
  completedChars: number;
  placement?: number;
};

type Lobby = {
  id: string;
  code: string;
  hostUserId: string;
  mode: "quick" | "private";
  targetPlayers: number;
  status: "waiting" | "countdown" | "racing" | "finished";
  verseReference: string;
  raceText: string;
  totalChars: number;
  players: LobbyPlayer[];
};

const lobbies = new Map<string, Lobby>();
const quickMatchQueue: { userId: string; name: string; targetPlayers: number }[] = [];

function createSnapshot(lobby: Lobby): RaceBroadcast {
  return {
    type: "snapshot",
    lobbyId: lobby.id,
    status: lobby.status,
    verseReference: lobby.verseReference,
    raceText: lobby.raceText,
    totalChars: lobby.totalChars,
    players: lobby.players,
  };
}

export function listRaceLobbies() {
  return [...lobbies.values()].map((lobby) => createSnapshot(lobby));
}

export function resetRaceState() {
  lobbies.clear();
  quickMatchQueue.splice(0, quickMatchQueue.length);
}

export function getRaceLobby(lobbyId: string) {
  const lobby = lobbies.get(lobbyId);

  return lobby ? createSnapshot(lobby) : null;
}

export function createPrivateLobby({
  hostUserId,
  hostName,
  targetPlayers,
  verseReference,
  raceText,
  totalChars,
}: {
  hostUserId: string;
  hostName: string;
  targetPlayers: number;
  verseReference: string;
  raceText: string;
  totalChars: number;
}) {
  const lobby: Lobby = {
    id: createId("lobby"),
    code: Math.random().toString(36).slice(2, 8).toUpperCase(),
    hostUserId,
    mode: "private",
    targetPlayers,
    status: "waiting",
    verseReference,
    raceText,
    totalChars,
    players: [
      {
        userId: hostUserId,
        name: hostName,
        ready: false,
        connected: true,
        completedChars: 0,
      },
    ],
  };

  lobbies.set(lobby.id, lobby);

  return lobby;
}

export function enqueueQuickMatch({
  userId,
  name,
  targetPlayers,
  verseReference,
  raceText,
  totalChars,
}: {
  userId: string;
  name: string;
  targetPlayers: number;
  verseReference: string;
  raceText: string;
  totalChars: number;
}) {
  const existingQueue = quickMatchQueue.find((entry) => entry.userId === userId);

  if (!existingQueue) {
    quickMatchQueue.push({ userId, name, targetPlayers });
  }

  const compatiblePlayers = quickMatchQueue.filter((entry) => entry.targetPlayers === targetPlayers);

  if (compatiblePlayers.length >= targetPlayers) {
    const selected = compatiblePlayers.slice(0, targetPlayers);
    const selectedIds = new Set(selected.map((entry) => entry.userId));

    for (let index = quickMatchQueue.length - 1; index >= 0; index -= 1) {
      const candidate = quickMatchQueue[index];
      if (candidate && selectedIds.has(candidate.userId)) {
        quickMatchQueue.splice(index, 1);
      }
    }

    const host = selected[0];
    if (!host) {
      return {
        matched: false as const,
      };
    }
    const lobby: Lobby = {
      id: createId("lobby"),
      code: Math.random().toString(36).slice(2, 8).toUpperCase(),
      hostUserId: host.userId,
      mode: "quick",
      targetPlayers,
      status: "waiting",
      verseReference,
      raceText,
      totalChars,
      players: selected.map((entry, index) => ({
        userId: entry.userId,
        name: entry.name,
        ready: false,
        connected: true,
        completedChars: 0,
        placement: index === 0 ? undefined : undefined,
      })),
    };

    lobbies.set(lobby.id, lobby);

    return {
      matched: true as const,
      lobby,
    };
  }

  return {
    matched: false as const,
  };
}

export function setRaceReady(lobbyId: string, userId: string, ready: boolean) {
  const lobby = lobbies.get(lobbyId);

  if (!lobby) {
    return null;
  }

  const player = lobby.players.find((entry) => entry.userId === userId);

  if (!player) {
    return null;
  }

  player.ready = ready;

  if (
    lobby.players.length === lobby.targetPlayers &&
    lobby.players.every((entry) => entry.ready) &&
    lobby.status === "waiting"
  ) {
    lobby.status = "countdown";
  }

  return createSnapshot(lobby);
}

export function updateRaceProgress(lobbyId: string, userId: string, completedChars: number) {
  const lobby = lobbies.get(lobbyId);

  if (!lobby) {
    return null;
  }

  const player = lobby.players.find((entry) => entry.userId === userId);

  if (!player) {
    return null;
  }

  player.completedChars = completedChars;

  if (completedChars >= lobby.totalChars && player.placement == null) {
    player.placement = lobby.players.filter((entry) => entry.placement != null).length + 1;
  }

  if (lobby.players.every((entry) => entry.placement != null || entry.completedChars >= lobby.totalChars)) {
    lobby.status = "finished";
  } else if (lobby.status === "countdown") {
    lobby.status = "racing";
  }

  return createSnapshot(lobby);
}
