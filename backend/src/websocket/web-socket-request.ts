import { IncomingMessage } from "http";
import { WebSocket } from "ws";

export type WebSocketRequest = IncomingMessage & {
    ws: WebSocket;
    wsHandled: boolean;
};

export const isWebSocketRequest = (request: IncomingMessage | WebSocketRequest): request is WebSocketRequest => {
    return "ws" in request && request.ws != null;
};
