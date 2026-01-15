import { createReadStream, createWriteStream } from "fs";
import { config } from "../config.js";
import { createInterface } from "readline";
import { appendFile, rename, stat, unlink } from "fs/promises";
import { postStorage } from "./post-storage.js";

type PostTagsCache = {
    tagsForPost: Map<number, Set<number>>;
    postsForTag: Map<number, Set<number>>;
    timestamp: number;
};

class PostTagsStorage {
    private cached: PostTagsCache | null;

    constructor() {
        this.cached = null;
    }

    async tagIds(postId: number): Promise<ReadonlySet<number>> {
        const stats = await stat(config.postTagsFilePath);
        const timestamp = stats.mtimeMs;

        if(this.cached != null && timestamp <= this.cached.timestamp) {
            return this.cached.tagsForPost.get(postId) ?? new Set();
        }

        await this.updateCache(timestamp);

        return this.tagIds(postId);
    }

    async addTag(postId: number, tagId: number): Promise<void> {
        const postExists = await postStorage.post(postId).exists();
        if(!postExists)
            return;

        const existingTagIds = await this.tagIds(postId);
        if(existingTagIds.has(tagId))
            return;

        await appendFile(config.postTagsFilePath, `${postId} ${tagId}\n`, { encoding: "utf-8" });

        if(this.cached == null) {
            const stats = await stat(config.postTagsFilePath);
            await this.updateCache(stats.mtimeMs);
        } else {
            const cachedTags = this.cached.tagsForPost.get(postId);
            if(cachedTags != null)
                cachedTags.add(tagId);
            else
                this.cached.tagsForPost.set(postId, new Set([tagId]));
        }
    }

    async removePost(postId: number): Promise<void> {
        if(this.cached != null) {
            this.cached.tagsForPost.delete(postId);

            for(const postIds of this.cached.postsForTag.values()) {
                postIds.delete(postId);
            }
        }

        const tempFileName = `${config.postTagsFilePath}.new`;
        const newPostTags = createWriteStream(tempFileName, { encoding: "utf-8" });

        const stream = createReadStream(config.postTagsFilePath, { encoding: "utf-8" });
        const lines = createInterface({
            input: stream,
            crlfDelay: Infinity
        });

        for await (const line of lines) {
            const split = line.trim().split(" ");
            if(split.length !== 2)
                continue;

            const [rawPostId, rawTagId] = split;
            const entryPostId = Number(rawPostId);
            const entryTagId = Number(rawTagId);
            if(!Number.isInteger(entryPostId) || !Number.isInteger(entryTagId)) {
                console.warn(`Invalid entry in "${config.postTagsFilePath}": "${line}"`);
                continue;
            }

            if(entryPostId !== postId)
                newPostTags.write(`${line}\n`);
        }

        newPostTags.close();

        await unlink(config.postTagsFilePath);
        await rename(tempFileName, config.postTagsFilePath);
    }

    async removeTag(tagId: number): Promise<void> {
        if(this.cached != null) {
            this.cached.postsForTag.delete(tagId);

            for(const tagIds of this.cached.tagsForPost.values()) {
                tagIds.delete(tagId);
            }
        }

        const tempFileName = `${config.postTagsFilePath}.new`;
        const newPostTags = createWriteStream(tempFileName, { encoding: "utf-8" });

        const stream = createReadStream(config.postTagsFilePath, { encoding: "utf-8" });
        const lines = createInterface({
            input: stream,
            crlfDelay: Infinity
        });

        for await (const line of lines) {
            const split = line.trim().split(" ");
            if(split.length !== 2)
                continue;

            const [rawPostId, rawTagId] = split;
            const entryPostId = Number(rawPostId);
            const entryTagId = Number(rawTagId);
            if(!Number.isInteger(entryPostId) || !Number.isInteger(entryTagId)) {
                console.warn(`Invalid entry in "${config.postTagsFilePath}": "${line}"`);
                continue;
            }

            if(entryTagId !== tagId)
                newPostTags.write(`${line}\n`);
        }

        newPostTags.close();

        await unlink(config.postTagsFilePath);
        await rename(tempFileName, config.postTagsFilePath);
    }

    async removeTagFromPost(postId: number, tagId: number): Promise<void> {
        if(this.cached != null) {
            const posts = this.cached.postsForTag.get(tagId);
            if(posts != null)
                posts.delete(postId);

            const tags = this.cached.tagsForPost.get(postId);
            if(tags != null)
                tags.delete(tagId);
        }

        const tempFileName = `${config.postTagsFilePath}.new`;
        const newPostTags = createWriteStream(tempFileName, { encoding: "utf-8" });

        const stream = createReadStream(config.postTagsFilePath, { encoding: "utf-8" });
        const lines = createInterface({
            input: stream,
            crlfDelay: Infinity
        });

        for await (const line of lines) {
            const split = line.trim().split(" ");
            if(split.length !== 2)
                continue;

            const [rawPostId, rawTagId] = split;
            const entryPostId = Number(rawPostId);
            const entryTagId = Number(rawTagId);
            if(!Number.isInteger(entryPostId) || !Number.isInteger(entryTagId)) {
                console.warn(`Invalid entry in "${config.postTagsFilePath}": "${line}"`);
                continue;
            }

            if(entryTagId !== tagId || entryPostId !== postId)
                newPostTags.write(`${line}\n`);
        }

        newPostTags.close();

        await unlink(config.postTagsFilePath);
        await rename(tempFileName, config.postTagsFilePath);
    }

    private async updateCache(timestamp: number): Promise<void> {
        const tagsForPost = new Map<number, Set<number>>();
        const postsForTag = new Map<number, Set<number>>();

        for await (const [postId, tagId] of this.entries()) {
            const existingTags = tagsForPost.get(postId);
            if(existingTags != null)
                existingTags.add(tagId);
            else
                tagsForPost.set(postId, new Set([tagId]));

            const existingPosts = postsForTag.get(tagId);
            if(existingPosts != null)
                existingPosts.add(postId);
            else
                postsForTag.set(tagId, new Set([postId]));
        }

        this.cached = {
            timestamp,
            tagsForPost,
            postsForTag
        };
    }

    private async *entries(): AsyncGenerator<readonly [postId: number, tagId: number]> {
        console.log(`Fetching PostTags ${config.postTagsFilePath}`);

        const stream = createReadStream(config.postTagsFilePath, { encoding: "utf-8" });
        const lines = createInterface({
            input: stream,
            crlfDelay: Infinity
        });

        for await (const line of lines) {
            const split = line.trim().split(" ");
            if(split.length !== 2)
                continue;

            const [rawPostId, rawTagId] = split;
            const entryPostId = Number(rawPostId);
            const entryTagId = Number(rawTagId);
            if(!Number.isInteger(entryPostId) || !Number.isInteger(entryTagId)) {
                console.warn(`Invalid entry in "${config.postTagsFilePath}": "${line}"`);
                continue;
            }

            yield [entryPostId, entryTagId];
        }
    }
}

export const postTagsStorage = new PostTagsStorage();
