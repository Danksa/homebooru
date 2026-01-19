import { readdir } from "fs/promises";
import { Repository } from "./repository.js";
import { join, parse } from "path";
import { Cachable } from "./cachable.js";
import { Dirent } from "fs";

export class JsonFileBasedRepository<T extends Cachable<Data>, Data> implements Repository<T, Data> {
    private readonly directory: string;
    private readonly cached: Map<number, T>;
    private readonly createEntry: (id: number) => T;
    private readonly existingEntry: (id: number, filePath: string) => Promise<T>;

    constructor(directory: string, createEntry: (id: number) => T, existingEntry: (id: number, filePath: string) => Promise<T>) {
        this.directory = directory;
        this.cached = new Map();
        this.createEntry = createEntry;
        this.existingEntry = existingEntry;
    }

    get(id: number): T {
        const cached = this.cached.get(id);
        if(cached != null)
            return cached;

        const t = this.createEntry(id);
        this.cached.set(id, t);
        return t;
    }

    async count(): Promise<number> {
        let count = 0;
        for await (const _ of this.list())
            count += 1;
        return count;
    }

    async create(data: Data): Promise<T> {
        const id = await this.count();
        const cached = this.cached.get(id);
        if(cached != null) {
            const exists = await cached.exists();
            if(exists)
                throw new Error(`Entry with ID ${id} already exists`);
        }

        const entry = this.createEntry(id);
        await entry.save(data);
        this.cached.set(id, entry);
        return entry;
    }

    async delete(id: number): Promise<void> {
        const entry = this.get(id);
        this.cached.delete(id);
        await entry.delete();
    }

    async *list(): AsyncGenerator<T> {
        const files = await readdir(this.directory, { withFileTypes: true, encoding: "utf-8", recursive: false });
        files.sort(JsonFileBasedRepository.byId);
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

            const t = await this.existingEntry(fileId, filePath);
            this.cached.set(fileId, t);

            yield t;
        }
    }

    static byId(a: Dirent<string>, b: Dirent<string>): number {
        return Number(parse(b.name).name) - Number(parse(a.name).name);
    }
}
