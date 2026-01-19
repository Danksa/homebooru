import { json, Router } from "express";
import { listCategories } from "../controllers/categories/categories-list-controller.js";
import { createCategory } from "../controllers/categories/categories-create-controller.js";
import { fetchCategory } from "../controllers/categories/categories-fetch-controller.js";
import { updateCategory } from "../controllers/categories/categories-update-controller.js";
import { deleteCategory } from "../controllers/categories/categories-delete-controller.js";

export const categoriesRouter = Router();

categoriesRouter.get("/", listCategories);
categoriesRouter.post("/", json(), createCategory);

categoriesRouter.get("/:id", fetchCategory);
categoriesRouter.patch("/:id", json(), updateCategory);
categoriesRouter.delete("/:id", deleteCategory);
