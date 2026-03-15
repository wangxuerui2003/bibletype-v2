export type RaceLobbyState = "waiting" | "countdown" | "racing" | "finished";

export type RaceBroadcast =
  | {
      type: "snapshot";
      lobbyId: string;
      status: RaceLobbyState;
      verseReference: string;
      raceText: string;
      totalChars: number;
      players: {
        userId: string;
        name: string;
        ready: boolean;
        connected: boolean;
        completedChars: number;
        placement?: number;
      }[];
    }
  | {
      type: "countdown";
      secondsRemaining: number;
    }
  | {
      type: "started";
      startedAt: string;
    }
  | {
      type: "finished";
      results: {
        userId: string;
        placement: number;
        wpm: number;
        accuracy: number;
      }[];
    };
