import { config } from "../config.js";
import { postTagsStorage } from "./post-tags-storage.js";
import { Post } from "../data/post.js";
import { PostRepository } from "../data/post-repository.js";
import { FileBasedPostRepository } from "../data/file-based-post-repository.js";

class PostStorage {
    private readonly repo: PostRepository;

    constructor() {
        this.repo = new FileBasedPostRepository(config.postsDirectory);
    }

    post(id: number): Post {
        return this.repo.post(id);
    }

    delete(id: number): Promise<void> {
        return this.repo.delete(id);
    }

    async query(start: number, count: number, tags?: ReadonlyArray<readonly [id: number, excluded: boolean]>): Promise<ReadonlyArray<Post>> {
        const posts = new Array<Post>();

        let skipped = 0;
        for await (const post of this.repo.posts()) {
            if(posts.length >= count)
                break;

            if(tags != null) {
                const postTagIds = await postTagsStorage.tagIds(post.id);
                const matching = tags.every(([id, excluded]) => excluded ? !postTagIds.has(id) : postTagIds.has(id));
                if(!matching)
                    continue;
            }

            if(skipped < start) {
                skipped += 1;
                continue;
            }

            posts.push(post);
        }
        return posts;
    }

    async adjacent(id: number, tags?: ReadonlyArray<readonly [id: number, excluded: boolean]>): Promise<readonly [previous: Post | null, next: Post | null]> {
        let previous: Post | null = null;
        let next: Post | null = null;
        let foundId = false;
        for await (const post of this.repo.posts()) {
            if(tags != null) {
                const postTagIds = await postTagsStorage.tagIds(post.id);
                const matching = tags.every(([id, excluded]) => excluded ? !postTagIds.has(id) : postTagIds.has(id));
                if(!matching)
                    continue;
            }

            if(post.id === id) {
                foundId = true;
                continue;
            }

            if(!foundId)
                previous = post;

            if(foundId) {
                next = post;
                break;
            }
        }
        return [previous, next];
    }

    async count(tags?: ReadonlyArray<readonly [id: number, excluded: boolean]>): Promise<number> {
        let count = 0;
        for await (const post of this.repo.posts()) {
            if(tags != null) {
                const postTagIds = await postTagsStorage.tagIds(post.id);
                if(!tags.every(([id, excluded]) => excluded ? !postTagIds.has(id) : postTagIds.has(id)))
                    continue;
            }

            count += 1;
        }
        return count;
    }

    async lastId(): Promise<number> {
        let highest = 0;
        for await (const post of this.repo.posts()) {
            highest = Math.max(highest, post.id);
        }
        return highest;
    }
}

export const postStorage = new PostStorage();
