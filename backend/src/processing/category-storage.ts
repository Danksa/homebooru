import { config } from "../config.js";
import { CategoryRepository } from "../data/category-repository.js";
import { Category } from "../data/category.js";
import { CategorySchema } from "../data/category.schema.js";
import { JsonFileBasedRepository } from "../data/json-file-based-repository.js";

class CategoryStorage {
    private readonly repo: CategoryRepository;

    constructor() {
        this.repo = new JsonFileBasedRepository(config.categoryDirectory, (id) => new Category(id), Category.existing);
    }

    create(name: string, color: string): Promise<Category> {
        return this.repo.create({ name, color });
    }

    category(id: number): Category {
        return this.repo.get(id);
    }

    categories(): AsyncGenerator<Category> {
        return this.repo.list();
    }

    exists(id: number): Promise<boolean> {
        const category = this.repo.get(id);
        return category.exists();
    }

    async update(id: number, newData: CategorySchema): Promise<void> {
        const category = this.repo.get(id);
        if(!(await category.exists()))
            return;

        const data = await category.data();
        const oldName = data.name;

        const newName = newData.name;
        if(newName !== oldName) {
            const nameExists = await this.nameExists(newName);
            if(nameExists)
                throw new Error(`Cannot rename category ${id} to "${newName}", another category with name "${newName}" already exists`);
        }

        await category.save(newData);
    }

    private async nameExists(name: string): Promise<boolean> {
        const names = await this.names();
        return names.includes(name);
    }

    async names(): Promise<ReadonlyArray<string>> {
        const names = new Array<string>();
        for await (const category of this.repo.list()) {
            const data = await category.data();
            names.push(data.name);
        }
        return names;
    }
}

export const categoryStorage = new CategoryStorage();
