import { config } from "../config.js";
import { CategoryRepository } from "../data/category-repository.js";
import { Category } from "../data/category.js";
import { FileBasedCategoryRepository } from "../data/file-based-category-repository.js";

class CategoryStorage {
    private readonly repo: CategoryRepository;

    constructor() {
        this.repo = new FileBasedCategoryRepository(config.categoryDirectory);
    }

    category(id: number): Category {
        return this.repo.category(id);
    }
}

export const categoryStorage = new CategoryStorage();
