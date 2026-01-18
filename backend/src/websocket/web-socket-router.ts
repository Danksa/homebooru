import { NextFunction, RequestHandler, Router } from "express";
import { websocketUrl } from "./websocket-url.js";
import { WebSocket } from "ws";
import { IncomingMessage } from "http";
import { isWebSocketRequest } from "./web-socket-request.js";

export type WebSocketHandler = (ws: WebSocket, request: IncomingMessage, next: NextFunction) => void;

type WebSocketRouterProperties = {
    ws: (path: string, handler: WebSocketHandler) => void;
};

export type WebSocketRouter = Router & WebSocketRouterProperties;

export const WebSocketRouter = (): WebSocketRouter => {
    const router = Router();
    Object.assign(router, {
        ws: (path, handler) => {
            const wsRoute = websocketUrl(path);
            router.get(wsRoute, (req, res, next) => {
                if(!isWebSocketRequest(req)) {
                    next();
                    return;
                }

                req.wsHandled = true;
                try {
                    handler(req.ws, req, next);
                } catch (error) {
                    next(error);
                }
            });
        }
    } satisfies WebSocketRouterProperties);
    return router as WebSocketRouter;
};
