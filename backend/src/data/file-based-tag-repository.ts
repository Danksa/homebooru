import { readdir } from "fs/promises";
import { join, parse } from "path";
import { TagRepository } from "./tag-repository.js";
import { Tag } from "./tag.js";

export class FileBasedTagRepository implements TagRepository {
    private readonly directory: string;
    private readonly cached: Map<number, Tag>;

    constructor(directory: string) {
        this.directory = directory;
        this.cached = new Map();
    }

    tag(id: number): Tag {
        const cachedPost = this.cached.get(id);
        if(cachedPost != null)
            return cachedPost;

        const tag = new Tag(id);
        this.cached.set(id, tag);
        return tag;
    }

    async create(name: string): Promise<Tag> {
        const id = await this.count();
        const cachedTag = this.cached.get(id);
        if(cachedTag != null) {
            const tagExists = await cachedTag.exists();
            if(tagExists)
                throw new Error(`Tag with ID ${id} already exists`);
        }

        const tag = new Tag(id);
        await tag.save(name);
        this.cached.set(id, tag);
        return tag;
    }

    async count(): Promise<number> {
        let count = 0;
        for await (const _ of this.tags()) {
            count += 1;
        }
        return count;
    }

    async delete(id: number): Promise<void> {
        const tag = this.tag(id);
        this.cached.delete(id);
        await tag.delete();
    }

    async *tags(): AsyncGenerator<Tag> {
        const files = await readdir(this.directory, { withFileTypes: true, encoding: "utf-8", recursive: false });
        for(const file of files) {
            if(!file.isFile())
                continue;

            const name = parse(file.name).name;
            const fileId = Number(name);
            if(!Number.isInteger(fileId))
                continue;

            const cachedTag = this.cached.get(fileId);
            if(cachedTag != null) {
                yield cachedTag;
                continue;
            }

            const filePath = join(file.parentPath, file.name);

            const tag = await Tag.existing(fileId, filePath);
            this.cached.set(fileId, tag);

            yield tag;
        }
    }
}
