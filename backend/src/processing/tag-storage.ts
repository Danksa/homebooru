import { config } from "../config.js";
import { JsonFileBasedRepository } from "../data/json-file-based-repository.js";
import { TagRepository } from "../data/tag-repository.js";
import { Tag } from "../data/tag.js";
import { TagSchema } from "../data/tag.schema.js";
import { postTagsStorage } from "./post-tags-storage.js";

class TagStorage {
    private readonly repo: TagRepository;

    constructor() {
        this.repo = new JsonFileBasedRepository(config.tagDirectory, (id) => new Tag(id), Tag.existing);
    }

    tag(id: number): Tag {
        return this.repo.get(id);
    }
    
    async update(id: number, newData: TagSchema): Promise<void> {
        const tag = this.tag(id);
        if(!(await tag.exists()))
            return;

        const data = await tag.data();
        const oldName = data.name;

        const newName = newData.name;
        if(newName !== oldName) {
            const nameExists = await this.nameExists(newName);
            if(nameExists)
                throw new Error(`Cannot rename tag ${id} to "${newName}", another tag with name "${newName}" already exists`);
        }

        await tag.save(newData);
    }

    private async nameExists(name: string): Promise<boolean> {
        const names = await this.names();
        return names.includes(name);
    }

    create(name: string): Promise<Tag> {
        return this.repo.create({ name, category: null });
    }

    delete(id: number): Promise<void> {
        return this.repo.get(id).delete();
    }

    async suggestions(search: string, maxResults: number = 10): Promise<ReadonlyArray<string>> {
        const matches = new Array<readonly [name: string, count: number]>();
        for await (const tag of this.repo.list()) {
            const data = await tag.data();
            const tagName = data.name;
            if(tagName.includes(search)) {
                const postCount = await postTagsStorage.postCount(tag.id);
                matches.push([tagName, postCount]);
            }
        }

        matches.sort(([_a, countA], [_b, countB]) => countB - countA);

        return matches.slice(0, maxResults).map(([name]) => name);
    }

    async names(): Promise<ReadonlyArray<string>> {
        const names = new Array<string>();
        for await (const tag of this.repo.list()) {
            const data = await tag.data();
            const tagName = data.name;
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
        for await (const tag of this.repo.list()) {
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
        for await (const tag of this.repo.list()) {
            const data = await tag.data();
            const tagName = data.name;
            if(tagName === name)
                return tag.id;
        }
        throw new Error(`Unknown tag "${name}"`);
    }
}

export const tagStorage = new TagStorage();
