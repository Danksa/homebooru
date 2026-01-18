import "express";
import { IncomingMessage, OutgoingMessage } from "http";

declare module "express" {
    interface Express {
        handle(request: IncomingMessage, response: OutgoingMessage, callback: () => void): void;
    }
}
