import { Category } from "./category.js";
import { CategorySchema } from "./category.schema.js";
import { Repository } from "./repository.js";

export type CategoryRepository = Repository<Category, CategorySchema>;
