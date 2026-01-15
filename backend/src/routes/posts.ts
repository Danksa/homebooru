import { json, Router } from "express";
import { addPostTags, deletePost, fetchPost, listPosts, listPostTagIds, postCount, removePostTag, runPostImport, uploadPosts } from "../controllers/post-controller.js";
import multer from "multer";
import { config } from "../config.js";

const upload = multer({ dest: config.uploadsDirectory });

export const postsRouter = Router();
postsRouter.get("/count", postCount);

postsRouter.post("/import", runPostImport);

postsRouter.post("/", upload.array("files"), uploadPosts);
postsRouter.get("/", listPosts);

postsRouter.get("/:id", fetchPost);
postsRouter.delete("/:id", deletePost);

postsRouter.get("/:id/tags", listPostTagIds);
postsRouter.post("/:id/tags", json(), addPostTags);
postsRouter.delete("/:id/tags/:tagId", removePostTag);
