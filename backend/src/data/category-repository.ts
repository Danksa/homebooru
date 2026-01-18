import { Category } from "./category.js";

export type CategoryRepository = {
    category(id: number): Category;
    create(name: string, color: string): Promise<Category>;
    delete(id: number): Promise<void>;
    categories(): AsyncGenerator<Category>;
    count(): Promise<number>;
};
