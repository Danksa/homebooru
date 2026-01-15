import { Tag } from "./tag.js";

export type TagRepository = {
    tag(id: number): Tag;
    create(name: string): Promise<Tag>;
    delete(id: number): Promise<void>;
    tags(): AsyncGenerator<Tag>;
    count(): Promise<number>;
};
