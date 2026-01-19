import { json } from "express";
import { WebSocketRouter } from "../websocket/web-socket-router.js";
import { postCount } from "../controllers/posts/posts-count-controller.js";
import { trackUploadStatus, uploadPosts } from "../controllers/posts/posts-upload-controller.js";
import { listPosts } from "../controllers/posts/posts-list-controller.js";
import { fetchPost } from "../controllers/posts/posts-fetch-controller.js";
import { listPostTags } from "../controllers/posts/posts-list-tags-controller.js";
import { addPostTags } from "../controllers/posts/posts-add-controller.js";
import { removePostTag } from "../controllers/posts/posts-remove-tag-controller.js";
import { deletePost } from "../controllers/posts/posts-delete-controller.js";
import { fetchImportPath, runPostImport, trackImportStatus } from "../controllers/posts/posts-import-controller.js";

export const postsRouter = WebSocketRouter();
postsRouter.get("/count", postCount);

postsRouter.get("/import/path", fetchImportPath);
postsRouter.post("/import", runPostImport);
postsRouter.ws("/import-status", trackImportStatus);

postsRouter.post("/", ...uploadPosts);
postsRouter.get("/", listPosts);

postsRouter.get("/:id", fetchPost);
postsRouter.delete("/:id", deletePost);

postsRouter.get("/:id/tags", listPostTags);
postsRouter.post("/:id/tags", json(), addPostTags);
postsRouter.delete("/:id/tags/:tagId", removePostTag);

postsRouter.ws("/upload-status", trackUploadStatus);
