import express from "express";
import { rootRouter } from "./routes/index.js";
import { initialize } from "./initialize.js";

const port = process.env.PORT != null ? Number(process.env.PORT) : 3000;

await initialize();

const app = express();
app.use("/", rootRouter);
app.listen(port, () => {
    console.log(`homebooru is running on port ${port}`);
});
