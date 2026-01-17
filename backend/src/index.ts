import express from "express";
import { rootRouter } from "./routes/index.js";
import { initialize } from "./initialize.js";
import { WebSocketServer } from "ws";
import { createServer } from "http";

const port = process.env.PORT != null ? Number(process.env.PORT) : 3000;

await initialize();

const app = express();
app.use("/", rootRouter);

const server = createServer(app);

const wss = new WebSocketServer({ noServer: true });
wss.on("connection", (ws, req) => {
    console.log("Connection!");

    ws.send("Test");

    ws.on("close", () => {
        console.log("Websocket closed");
    });
});

server.on("upgrade", (req, socket, head) => {
    const path = req.url;
    console.log("Upgrade", path);

    if(path == null) {
        socket.destroy();
        return;
    }

    if(path === "/posts/upload-status") {
        wss.handleUpgrade(req, socket, head, (ws) => {
            wss.emit("connection", ws);
        });
    } else {
        socket.destroy();
    }
});

server.listen(port, () => {
    console.log(`homebooru is running on port ${port}`);
});
