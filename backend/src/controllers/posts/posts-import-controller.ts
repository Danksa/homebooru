import { RequestHandler } from "express";
import { config } from "../../config.js";
import { resolve } from "path";
import { WebSocketHandler } from "../../websocket/web-socket-router.js";
import { importProcessor, ImportProgressListener } from "../../processing/import-processor.js";

export const runPostImport: RequestHandler = (_, res) => {
    if(importProcessor.running) {
        res.status(400);
        res.end("Already running");
        return;
    }

    void importProcessor.processImports();

    res.status(202);
    res.end();
};

export const fetchImportPath: RequestHandler = (_, res) => {
    const importPath = resolve(config.importDirectory);

    res.contentType("application/json");
    res.status(200);
    res.end(JSON.stringify(importPath));
};

export const trackImportStatus: WebSocketHandler = (ws, _, next) => {
    const listener: ImportProgressListener = (progress) => {
        switch(progress.type) {
            case "start":
                ws.send(`start:${progress.files}`);
                break;
            case "file":
                ws.send(`file:${progress.filesProcessed},${progress.currentFile}`);
                break;
            case "done":
                ws.send(`done`);
                break;
        }
    };

    importProcessor.addListener(listener);

    ws.on("close", () => {
        importProcessor.removeListener(listener);
    });

    next();
};
