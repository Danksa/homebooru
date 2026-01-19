import { config } from "../config.js";
import { CategoryRepository } from "../data/category-repository.js";
import { Category } from "../data/category.js";
import { JsonFileBasedRepository } from "../data/json-file-based-repository.js";

class CategoryStorage {
    private readonly repo: CategoryRepository;

    constructor() {
        this.repo = new JsonFileBasedRepository(config.categoryDirectory, (id) => new Category(id), Category.existing);
    }

    category(id: number): Category {
        return this.repo.get(id);
    }

    categories(): AsyncGenerator<Category> {
        return this.repo.list();
    }
}

export const categoryStorage = new CategoryStorage();
