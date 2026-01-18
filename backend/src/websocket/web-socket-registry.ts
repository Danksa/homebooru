import { Express } from "express";
import { Server, ServerResponse } from "http";
import { WebSocketServer } from "ws";
import { websocketUrl } from "./websocket-url.js";
import { WebSocketRequest } from "./web-socket-request.js";

class WebSocketRegistry {
    private readonly wss: WebSocketServer;

    constructor() {
        this.wss = new WebSocketServer({ noServer: true });
    }

    attach(app: Express, server: Server): void {
        server.on("upgrade", (request, socket, head) => {
            if(request.url == null) {
                socket.destroy();
                return;
            }

            request.url = websocketUrl(request.url);

            this.wss.handleUpgrade(request, socket, head, (ws) => {
                const wsRequest = request as WebSocketRequest;
                wsRequest.ws = ws;

                const response = new ServerResponse(wsRequest);

                app.handle(wsRequest, response, () => {
                    if(!wsRequest.wsHandled) {
                        socket.destroy();
                        return;
                    } else {
                        this.wss.emit("connection", ws);
                    }
                });
            });
        });
    }
}

export const webSocketRegistry = new WebSocketRegistry();
