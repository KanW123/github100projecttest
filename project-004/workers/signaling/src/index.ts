// P2P Signaling Server using Cloudflare Workers + Durable Objects

export interface Env {
  ROOMS: DurableObjectNamespace;
}

// Main Worker - routes requests to Durable Objects
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // Health check
    if (path === "/" || path === "/health") {
      return new Response(JSON.stringify({ status: "ok", service: "p2p-signaling" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create room: POST /room
    if (path === "/room" && request.method === "POST") {
      const roomId = generateRoomId();
      return new Response(JSON.stringify({ roomId }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Join room via WebSocket: GET /room/:roomId
    const roomMatch = path.match(/^\/room\/([a-zA-Z0-9]+)$/);
    if (roomMatch) {
      const roomId = roomMatch[1];
      const roomObjectId = env.ROOMS.idFromName(roomId);
      const roomObject = env.ROOMS.get(roomObjectId);
      return roomObject.fetch(request);
    }

    return new Response("Not Found", { status: 404, headers: corsHeaders });
  },
};

// Generate 6-character room ID
function generateRoomId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Durable Object for managing a game room
export class GameRoom {
  private sessions: Map<WebSocket, PlayerSession> = new Map();
  private state: DurableObjectState;
  private playerCount = 0;

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // WebSocket upgrade
    if (request.headers.get("Upgrade") === "websocket") {
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);

      this.handleWebSocket(server);

      return new Response(null, {
        status: 101,
        webSocket: client,
      });
    }

    // Room info
    return new Response(JSON.stringify({
      players: this.sessions.size,
      maxPlayers: 2,
    }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  private handleWebSocket(ws: WebSocket) {
    ws.accept();

    const playerId = ++this.playerCount;
    const session: PlayerSession = {
      id: playerId,
      ws,
      ready: false,
    };
    this.sessions.set(ws, session);

    // Notify player of their ID and current room state
    this.send(ws, {
      type: "joined",
      playerId,
      playerCount: this.sessions.size,
    });

    // Notify others
    this.broadcast({
      type: "player_joined",
      playerId,
      playerCount: this.sessions.size,
    }, ws);

    ws.addEventListener("message", (event) => {
      try {
        const data = JSON.parse(event.data as string);
        this.handleMessage(ws, session, data);
      } catch (e) {
        console.error("Invalid message:", e);
      }
    });

    ws.addEventListener("close", () => {
      this.sessions.delete(ws);
      this.broadcast({
        type: "player_left",
        playerId: session.id,
        playerCount: this.sessions.size,
      });
    });

    ws.addEventListener("error", () => {
      this.sessions.delete(ws);
    });
  }

  private handleMessage(ws: WebSocket, session: PlayerSession, data: SignalingMessage) {
    switch (data.type) {
      // WebRTC signaling
      case "offer":
      case "answer":
      case "ice-candidate":
        // Forward to the other player
        this.broadcast(data, ws);
        break;

      // Game ready state
      case "ready":
        session.ready = true;
        this.broadcast({
          type: "player_ready",
          playerId: session.id,
        }, ws);

        // Check if all players ready
        const allReady = Array.from(this.sessions.values()).every(s => s.ready);
        if (allReady && this.sessions.size === 2) {
          this.broadcast({ type: "game_start" });
        }
        break;

      // Game state sync (fallback if P2P fails)
      case "game_state":
        this.broadcast({
          ...data,
          playerId: session.id,
        }, ws);
        break;

      default:
        // Forward unknown messages (for extensibility)
        this.broadcast({
          ...data,
          playerId: session.id,
        }, ws);
    }
  }

  private send(ws: WebSocket, data: object) {
    try {
      ws.send(JSON.stringify(data));
    } catch (e) {
      // Socket might be closed
    }
  }

  private broadcast(data: object, exclude?: WebSocket) {
    const message = JSON.stringify(data);
    for (const [ws] of this.sessions) {
      if (ws !== exclude) {
        try {
          ws.send(message);
        } catch (e) {
          // Socket might be closed
        }
      }
    }
  }
}

interface PlayerSession {
  id: number;
  ws: WebSocket;
  ready: boolean;
}

interface SignalingMessage {
  type: string;
  [key: string]: any;
}
