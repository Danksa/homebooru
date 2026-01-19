import { json, Router } from "express";
import { listTags } from "../controllers/tags/tags-list-controller.js";
import { createTag } from "../controllers/tags/tags-create-controller.js";
import { suggestTags } from "../controllers/tags/tags-suggestion-controller.js";
import { fetchTag } from "../controllers/tags/tags-fetch-controller.js";
import { deleteTag } from "../controllers/tags/tags-delete-controller.js";
import { updateTag } from "../controllers/tags/tags-update-controller.js";

export const tagsRouter = Router();

tagsRouter.get("/", listTags);
tagsRouter.post("/", json(), createTag);

tagsRouter.get("/suggestions", suggestTags);

tagsRouter.get("/:id", fetchTag);
tagsRouter.patch("/:id", json(), updateTag);
tagsRouter.delete("/:id", deleteTag);
