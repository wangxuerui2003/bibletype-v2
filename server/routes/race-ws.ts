import { updateRaceProgress } from "../services/race-state";

export default defineWebSocketHandler({
  open(peer) {
    peer.send(
      JSON.stringify({
        type: "connected",
      }),
    );
  },
  message(peer, message) {
    try {
      const payload = JSON.parse(message.text());

      if (payload.type === "progress") {
        const snapshot = updateRaceProgress(payload.lobbyId, payload.userId, payload.completedChars);

        if (snapshot) {
          peer.send(JSON.stringify(snapshot));
        }
      }
    } catch {
      peer.send(
        JSON.stringify({
          type: "error",
          message: "Invalid websocket payload",
        }),
      );
    }
  },
});
