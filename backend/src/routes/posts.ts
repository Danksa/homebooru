import { json } from "express";
import multer from "multer";
import { config } from "../config.js";
import { WebSocketRouter } from "../websocket/web-socket-router.js";
import { postCount } from "../controllers/posts/posts-count-controller.js";
import { uploadPosts } from "../controllers/posts/posts-upload-controller.js";
import { listPosts } from "../controllers/posts/posts-list-controller.js";
import { fetchPost } from "../controllers/posts/posts-fetch-controller.js";
import { listPostTagIds } from "../controllers/posts/posts-list-tag-ids-controller.js";
import { addPostTags } from "../controllers/posts/posts-add-controller.js";
import { removePostTag } from "../controllers/posts/posts-remove-tag-controller.js";
import { deletePost } from "../controllers/posts/posts-delete-controller.js";
import { runPostImport } from "../controllers/posts/posts-import-controller.js";

const upload = multer({ dest: config.uploadsDirectory });

export const postsRouter = WebSocketRouter();
postsRouter.get("/count", postCount);

postsRouter.post("/import", runPostImport);

postsRouter.post("/", upload.array("files"), uploadPosts);
postsRouter.get("/", listPosts);

postsRouter.get("/:id", fetchPost);
postsRouter.delete("/:id", deletePost);

postsRouter.get("/:id/tags", listPostTagIds);
postsRouter.post("/:id/tags", json(), addPostTags);
postsRouter.delete("/:id/tags/:tagId", removePostTag);

postsRouter.ws("/upload-status", (ws, req, next) => {
    console.log("Connection!", req.url);

    ws.send("Test");

    ws.on("close", () => {
        console.log("Websocket closed");
    });

    next();
});
