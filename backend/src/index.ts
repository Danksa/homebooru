import express from "express";
import { rootRouter } from "./routes/index.js";
import { initialize } from "./initialize.js";
import { createServer } from "http";
import { webSocketRegistry } from "./websocket/web-socket-registry.js";

const port = process.env.PORT != null ? Number(process.env.PORT) : 3000;

await initialize();

const app = express();
app.use("/", rootRouter);

const server = createServer(app);
webSocketRegistry.attach(app as express.Express, server);

server.listen(port, () => {
    console.log(`homebooru is running on port ${port}`);
});
