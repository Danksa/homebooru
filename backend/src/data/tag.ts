import { postTagsStorage } from "../processing/post-tags-storage.js";
import { TagSchema, TagSchemaCompile } from "./tag.schema.js";
import { config } from "../config.js";
import { Item } from "./item.js";

export class Tag extends Item((data) => TagSchemaCompile.Parse(data), config.tagDirectory, { name: "default", category: null }) {
    save(data: Partial<TagSchema>): Promise<void> {
        const { name } = data;
        if(name == null)
            return super.save(data);

        const sanitized = Tag.sanitizedName(name);
        if(sanitized.length === 0)
            throw new Error(`Empty tag name after sanitization ("${name}")`);

        return super.save({ ...data, name: sanitized });
    }

    async delete(): Promise<void> {
        await postTagsStorage.removeTag(this.id);
        await super.delete();
    }

    static async existing(id: number, filePath: string): Promise<Tag> {
        const tag = new Tag(id);
        await tag.updateCache(filePath);
        return tag;
    }

    static sanitizedName(name: string): string {
        let sanitized = name.trim();
        sanitized = sanitized.replaceAll(/\s/g, "_");
        sanitized = sanitized.replaceAll(/[^\w:./-]/g, "");
        sanitized = sanitized.startsWith("-") ? sanitized.slice(1) : sanitized;
        return sanitized;
    }
}