import { Router } from "express";
import { postsRouter } from "./posts.js";
import { allowCors } from "../middleware/cors.js";
import { tagsRouter } from "./tags.js";

export const rootRouter = Router();

rootRouter.get("/health", (_, res) => {
    res.contentType("text/raw");
    res.write("OK");
    res.end();
});

rootRouter.use("/posts", allowCors, postsRouter);
rootRouter.use("/tags", allowCors, tagsRouter);

rootRouter.get("/*path", (_, res) => {
    res.status(404);
    res.end();
});
