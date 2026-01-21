import { appendFile, rename, stat, unlink } from "fs/promises";
import { PostTagsRepository } from "./post-tags-repository.js";
import { createReadStream, createWriteStream } from "fs";
import { createInterface } from "readline";

type Cache = {
    accessTime: number;
    postTags: Map<number, Set<number>>;
    tagPosts: Map<number, Set<number>>;
};

export class FileBasedPostTagsRepository implements PostTagsRepository {
    private readonly filePath: string;
    private cached: Cache | null;

    constructor(filePath: string) {
        this.filePath = filePath;
        this.cached = null;
    }

    async add(postId: number, tagId: number): Promise<void> {
        const cacheValid = await this.cacheValid();

        await appendFile(this.filePath, `${postId} ${tagId}\n`, { encoding: "utf-8" });

        if(cacheValid && this.cached != null) {
            this.cached.accessTime = Date.now();

            const existingTags = this.cached.postTags.get(postId);
            if(existingTags != null)
                existingTags.add(tagId);
            else
                this.cached.postTags.set(postId, new Set([tagId]));

            const existingPosts = this.cached.tagPosts.get(tagId);
            if(existingPosts != null)
                existingPosts.add(postId);
            else
                this.cached.tagPosts.set(tagId, new Set([postId]));
        }
    }

    async remove(postId: number, tagId: number): Promise<void> {
        const cacheValid = await this.cacheValid();

        await this.rewriteFiltered((entryPostId, entryTagId) => entryPostId !== postId || entryTagId !== tagId);

        if(cacheValid && this.cached != null) {
            this.cached.accessTime = Date.now();

            const postTags = this.cached.postTags.get(postId);
            postTags?.delete(tagId);

            const tagPosts = this.cached.tagPosts.get(tagId);
            tagPosts?.delete(postId);
        }
    }

    async deletePost(postId: number): Promise<void> {
        const cacheValid = await this.cacheValid();

        await this.rewriteFiltered((entryPostId, _) => entryPostId !== postId);

        if(cacheValid && this.cached != null) {
            this.cached.accessTime = Date.now();

            this.cached.postTags.delete(postId);

            for(const postIds of this.cached.tagPosts.values())
                postIds.delete(postId);
        }
    }

    async deleteTag(tagId: number): Promise<void> {
        const cacheValid = await this.cacheValid();

        await this.rewriteFiltered((_, entryTagId) => entryTagId !== tagId);

        if(cacheValid && this.cached != null) {
            this.cached.accessTime = Date.now();

            this.cached.tagPosts.delete(tagId);

            for(const tagIds of this.cached.postTags.values())
                tagIds.delete(tagId);
        }
    }

    async postTags(postId: number): Promise<ReadonlySet<number>> {
        const cacheValid = await this.cacheValid();
        if(!cacheValid || this.cached == null) {
            await this.updateCache();
            return this.postTags(postId);
        }

        return this.cached.postTags.get(postId) ?? new Set();
    }

    async tagPosts(tagId: number): Promise<ReadonlySet<number>> {
        const cacheValid = await this.cacheValid();
        if(!cacheValid || this.cached == null) {
            await this.updateCache();
            return this.tagPosts(tagId);
        }

        return this.cached.tagPosts.get(tagId) ?? new Set();
    }

    private async cacheValid(): Promise<boolean> {
        if(this.cached == null)
            return false;

        const stats = await stat(this.filePath);
        return this.cached.accessTime >= Math.floor(stats.mtimeMs);
    }

    private async updateCache(): Promise<void> {
        console.log(`Fetching Post Tags: ${this.filePath}`);

        const stats = await stat(this.filePath);
        const postTags = new Map<number, Set<number>>();
        const tagPosts = new Map<number, Set<number>>();

        for await (const [postId, tagId] of this.fileEntries()) {
            const existingTags = postTags.get(postId);
            if(existingTags != null)
                existingTags.add(tagId);
            else
                postTags.set(postId, new Set([tagId]));

            const existingPosts = tagPosts.get(tagId);
            if(existingPosts != null)
                existingPosts.add(postId);
            else
                tagPosts.set(tagId, new Set([postId]));
        }

        this.cached = {
            accessTime: Math.floor(stats.mtimeMs),
            postTags,
            tagPosts
        };
    }

    private async rewriteFiltered(includeEntry: (postId: number, tagId: number) => boolean): Promise<void> {
        const tempFilePath = `${this.filePath}.new`;

        try {
            await unlink(tempFilePath);
        } catch {
            // No old temp file exists
        }

        const newPostTags = createWriteStream(tempFilePath, { encoding: "utf-8" });
        for await (const [postId, tagId] of this.fileEntries()) {
            if(includeEntry(postId, tagId))
                newPostTags.write(`${postId} ${tagId}\n`);
        }

        await new Promise<void>(r => newPostTags.end(r));

        await unlink(this.filePath);
        await rename(tempFilePath, this.filePath);
    }

    private async *fileEntries(): AsyncGenerator<readonly [postId: number, tagId: number]> {
        const stream = createReadStream(this.filePath, { encoding: "utf-8" });
        const lines = createInterface({
            input: stream,
            crlfDelay: Infinity
        });
        for await (const line of lines) {
            const split = line.trim().split(" ");
            if(split.length !== 2)
                continue;

            const [rawPostId, rawTagId] = split;
            const postId = Number(rawPostId);
            const tagId = Number(rawTagId);
            if(!Number.isInteger(postId) || !Number.isInteger(tagId)) {
                console.warn(`Invalid entry in "${this.filePath}": "${line}"`);
                continue;
            }

            yield [postId, tagId];
        }
    }
}