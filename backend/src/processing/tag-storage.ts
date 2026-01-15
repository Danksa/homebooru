import { config } from "../config.js";
import { TagRepository } from "../data/tag-repository.js";
import { FileBasedTagRepository } from "../data/file-based-tag-repository.js";
import { Tag } from "../data/tag.js";

class TagStorage {
    private readonly repo: TagRepository;

    constructor() {
        this.repo = new FileBasedTagRepository(config.tagDirectory);
    }

    tag(id: number): Tag {
        return this.repo.tag(id);
    }

    create(name: string): Promise<Tag> {
        return this.repo.create(name);
    }

    delete(id: number): Promise<void> {
        return this.repo.tag(id).delete();
    }

    async suggestions(search: string, maxResults: number = 10): Promise<ReadonlyArray<string>> {
        const matches = new Array<string>();
        for await (const tag of this.repo.tags()) {
            if(matches.length >= maxResults)
                break;

            const tagName = await tag.name();
            if(tagName.includes(search))
                matches.push(tagName);
        }
        return matches;
    }

    async names(): Promise<ReadonlyArray<string>> {
        const names = new Array<string>();
        for await (const tag of this.repo.tags()) {
            const tagName = await tag.name();
            names.push(tagName);
        }
        return names;
    }

    count(): Promise<number> {
        return this.repo.count();
    }

    async page(start: number, count: number): Promise<ReadonlyArray<Tag>> {
        const tags = new Array<Tag>();
        let skipped = 0;
        for await (const tag of this.repo.tags()) {
            if(tags.length >= count)
                break;

            if(skipped < start) {
                skipped += 1;
                continue;
            }

            tags.push(tag);
        }

        return tags;
    }

    async tagId(name: string): Promise<number> {
        for await (const tag of this.repo.tags()) {
            const tagName = await tag.name();
            if(tagName === name)
                return tag.id;
        }
        throw new Error(`Unknown tag "${name}"`);
    }
}

export const tagStorage = new TagStorage();
