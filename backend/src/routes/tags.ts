import { Router, urlencoded } from "express";
import { createTag, deleteTag, fetchTag, listTags, suggestTags } from "../controllers/tag-controller.js";

export const tagsRouter = Router();

tagsRouter.get("/", listTags);
tagsRouter.post("/", urlencoded({ extended: true }), createTag);

tagsRouter.get("/suggestions", suggestTags);

tagsRouter.get("/:id", fetchTag);
tagsRouter.delete("/:id", deleteTag);
