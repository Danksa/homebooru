import { readdir } from "fs/promises";
import { CategoryRepository } from "./category-repository.js";
import { Category } from "./category.js";
import { join, parse } from "path";

export class FileBasedCategoryRepository implements CategoryRepository {
    private readonly directory: string;
    private readonly cached: Map<number, Category>;

    constructor(directory: string) {
        this.directory = directory;
        this.cached = new Map();
    }

    category(id: number): Category {
        const cached = this.cached.get(id);
        if(cached != null)
            return cached;

        const category = new Category(id);
        this.cached.set(id, category);
        return category;
    }

    async create(name: string, color: string): Promise<Category> {
        const id = await this.count();
        const cached = this.cached.get(id);
        if(cached != null) {
            const exists = await cached.exists();
            if(exists)
                throw new Error(`Category with ID ${id} already exists`);
        }

        const category = new Category(id);
        await category.save(name, color);
        this.cached.set(id, category);
        return category;
    }

    async count(): Promise<number> {
        let count = 0;
        for await (const _ of this.categories()) {
            count += 1;
        }
        return count;
    }

    async delete(id: number): Promise<void> {
        const category = this.category(id);
        this.cached.delete(id);
        await category.delete();
    }

    async *categories(): AsyncGenerator<Category> {
        const files = await readdir(this.directory, { withFileTypes: true, encoding: "utf-8", recursive: false });
        for(const file of files) {
            if(!file.isFile())
                continue;

            const name = parse(file.name).name;
            const fileId = Number(name);
            if(!Number.isInteger(fileId))
                continue;

            const cached = this.cached.get(fileId);
            if(cached != null) {
                yield cached;
                continue;
            }

            const filePath = join(file.parentPath, file.name);

            const category = await Category.existing(fileId, filePath);
            this.cached.set(fileId, category);

            yield category;
        }
    }
}
