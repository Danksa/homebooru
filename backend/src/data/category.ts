import { CategorySchema, CategorySchemaParser } from "./category.schema.js";
import { config } from "../config.js";
import { Item } from "./item.js";

const DefaultColor = "#ffffff";

export class Category extends Item((data) => CategorySchemaParser.Parse(data), config.categoryDirectory, { name: "default", color: DefaultColor }) {
    static DefaultColor: string = DefaultColor;

    save(data: Partial<CategorySchema>): Promise<void> {
        const { name } = data;
        if(name == null)
            return super.save(data);

        const sanitized = Category.sanitizedName(name);
        if(sanitized.length === 0)
            throw new Error(`Empty category name after sanitization ("${name}")`);

        return super.save({ ...data, name: sanitized });
    }

    static async existing(id: number, filePath: string): Promise<Category> {
        const category = new Category(id);
        await category.updateCache(filePath);
        return category;
    }

    static sanitizedName(name: string): string {
        let sanitized = name.trim();
        sanitized = sanitized.replaceAll(/\s/g, "_");
        sanitized = sanitized.replaceAll(/[^\w:]/g, "");
        return sanitized;
    }
}
