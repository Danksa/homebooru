import { readFile, stat, unlink, writeFile } from "fs/promises";
import { postTagsStorage } from "../processing/post-tags-storage.js";
import { TagSchema, TagSchemaCompile } from "./tag.schema.js";
import { config } from "../config.js";

type TagCache = {
    filePath: string;
    accessTime: number;
    name: string;
    category: number | null;
};

export class Tag {
    private cached: TagCache | null;

    readonly id: number;

    constructor(id: number) {
        this.id = id;
        this.cached = null;
    }

    async exists(): Promise<boolean> {
        await this.fetchCache();
        return this.cached != null;
    }

    async save(name: string, category: number | null): Promise<void> {
        const sanitized = Tag.sanitizedName(name);

        const tag = {
            name: sanitized,
            category
        } satisfies TagSchema;
        const encoded = JSON.stringify(tag, undefined, "\t");
        console.log("Saving tag", encoded);

        if(sanitized.length === 0) {
            throw new Error(`Empty tag name after sanitization ("${name}")`);
        }

        try {
            const path = await this.path();
    
            await writeFile(path, encoded);

            if(this.cached != null) {
                this.cached.accessTime = Date.now();
                this.cached.name = sanitized;
            }
        } catch {
            await writeFile(this.filePath(), encoded);
        }
    }

    async delete(): Promise<void> {
        try {
            const path = await this.path();
            await unlink(path);

            await postTagsStorage.removeTag(this.id);

            this.clearCache();
        } catch {
            // Tag already deleted
        }
    }

    async path(): Promise<string> {
        await this.fetchCache();
        if(this.cached == null)
            throw new Error(`Tag with ID ${this.id} does not exist`);
        return this.cached.filePath;
    }

    async name(): Promise<string> {
        await this.fetchCache();
        if(this.cached == null)
            throw new Error(`Tag with ID ${this.id} does not exist`);
        return this.cached.name;
    }

    async category(): Promise<number | null> {
        await this.fetchCache();
        if(this.cached == null)
            throw new Error(`Tag with ID ${this.id} does not exist`);
        return this.cached.category;
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
                if (stats.mtimeMs <= accessTime)
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
        console.log(`Fetching Tag ${this.id}: ${filePath}`);
        
        try {
            const stats = await stat(filePath);
            const content = await readFile(filePath, { encoding: "utf-8" });
            const json = TagSchemaCompile.Parse(JSON.parse(content));

            this.cached = {
                accessTime: stats.mtimeMs,
                filePath,
                name: json.name,
                category: json.category ?? null
            };
        } catch (error) {
            console.error(`Could not read tag ${this.id}:`, error);
        }
    }

    private filePath(): string {
        return `${config.tagDirectory}/${this.id.toFixed(0)}.json`;
    }

    static async existing(id: number, filePath: string): Promise<Tag> {
        const tag = new Tag(id);
        await tag.updateCache(filePath);
        return tag;
    }

    static sanitizedName(name: string): string {
        let sanitized = name.trim();
        sanitized = sanitized.replaceAll(/\s/g, "_");
        sanitized = sanitized.replaceAll(/[^\w:]/g, "");
        return sanitized;
    }
}