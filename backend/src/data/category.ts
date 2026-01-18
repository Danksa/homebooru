import { readFile, stat, unlink, writeFile } from "fs/promises";
import { CategorySchema, CategorySchemaParser } from "./category.schema.js";
import { config } from "../config.js";

type CategoryCache = {
    filePath: string;
    accessTime: number;
    name: string;
    color: string;
};

export class Category {
    private cached: CategoryCache | null;

    readonly id: number;

    constructor(id: number) {
        this.id = id;
        this.cached = null;
    }

    async exists(): Promise<boolean> {
        await this.fetchCache();
        return this.cached != null;
    }

    async save(name: string, color: string): Promise<void> {
        const sanitized = Category.sanitizedName(name);

        const category = {
            name: sanitized,
            color
        } satisfies CategorySchema;

        const encoded = JSON.stringify(category, undefined, "\t");
        console.log("Saving category", encoded);

        if(sanitized.length === 0) {
            throw new Error(`Empty category name after sanitization ("${name}")`);
        }

        try {
            const path = await this.path();

            await writeFile(path, encoded);

            if(this.cached != null) {
                this.cached.accessTime = Date.now();
                this.cached.name = sanitized;
                this.cached.color = color;
            }
        } catch {
            await writeFile(this.filePath(), encoded);
        }
    }

    async delete(): Promise<void> {
        try {
            const path = await this.path();
            await unlink(path);

            this.clearCache();
        } catch {
            // Category already deleted
        }
    }

    async path(): Promise<string> {
        await this.fetchCache();
        if(this.cached == null)
            throw new Error(`Category with ID ${this.id} does not exist`);
        return this.cached.filePath;
    }

    private async fetchCache(): Promise<void> {
        if(this.cached == null) {
            const filePath = this.filePath();
            if(filePath == null)
                return;
        
            await this.updateCache(filePath);
        } else {
            const { filePath: cachedFilePath, accessTime } = this.cached;
            try {
                const stats = await stat(cachedFilePath);
                if(stats.mtimeMs <= accessTime)
                    return;

                await this.updateCache(cachedFilePath);
            } catch {
                this.clearCache();
                await this.fetchCache();
            }
        }
    }

    private clearCache(): void {
        this.cached = null;
    }

    private async updateCache(filePath: string): Promise<void> {
        console.log(`Fetching Category ${this.id}: ${filePath}`);

        try {
            const stats = await stat(filePath);
            const content = await readFile(filePath, { encoding: "utf-8" });
            const json = CategorySchemaParser.Parse(JSON.parse(content));

            this.cached = {
                accessTime: stats.mtimeMs,
                filePath,
                name: json.name,
                color: json.color
            };
        } catch (error) {
            console.error(`Could not read category ${this.id}`, error);
        }
    }

    private filePath(): string {
        return `${config.categoryDirectory}/${this.id.toFixed(0)}.json`;
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
