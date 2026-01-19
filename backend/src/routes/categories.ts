import { Router } from "express";
import { listCategories } from "../controllers/categories/categories-list-controller.js";

export const categoriesRouter = Router();

categoriesRouter.get("/", listCategories);
