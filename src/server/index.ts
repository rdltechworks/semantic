
import type { PartyKitServer, PartyKitConnection } from "partykit/server";

export default {
  async onConnect(conn: PartyKitConnection, room: PartyKitRoom) {
    // When a new user connects, we send them the list of existing users.
    const players = Array.from(room.getConnections()).map((c) => c.state);
    conn.send(JSON.stringify({ type: "sync", players }));

    // Also, let others know that a new player has joined.
    room.broadcast(JSON.stringify({ type: "join", id: conn.id }), [conn.id]);
  },

  async onMessage(message: string, sender: PartyKitConnection, room: PartyKitRoom) {
    const msg = JSON.parse(message);

    if (msg.type === "identify") {
      // When a user identifies themselves, we store their username.
      sender.setState({ username: msg.username, id: sender.id });
    }

    if (msg.type === "move") {
      // When a user moves, we update their state and broadcast it.
      sender.setState({ ...sender.state, position: msg.position });
      room.broadcast(
        JSON.stringify({ type: "move", id: sender.id, position: msg.position }),
        [sender.id]
      );
    }
  },

  async onClose(conn: PartyKitConnection, room: PartyKitRoom) {
    // When a user disconnects, we let others know.
    room.broadcast(JSON.stringify({ type: "leave", id: conn.id }));
  },
} satisfies PartyKitServer;
