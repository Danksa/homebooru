import { config } from "../config.js";
import { postStorage } from "./post-storage.js";
import { PostTagsRepository } from "../data/post-tags-repository.js";
import { FileBasedPostTagsRepository } from "../data/file-based-post-tags-repository.js";
import { tagStorage } from "./tag-storage.js";

class PostTagsStorage {
    private readonly repo: PostTagsRepository;

    constructor() {
        this.repo = new FileBasedPostTagsRepository(config.postTagsFilePath);
    }

    tagIds(postId: number): Promise<ReadonlySet<number>> {
        return this.repo.postTags(postId);
    }

    async addTag(postId: number, tagId: number): Promise<void> {
        const postExists = await postStorage.post(postId).exists();
        if(!postExists)
            throw new Error(`Cannot add tag ${tagId} to post ${postId}, as the post does not exist`);

        const tagExists = await tagStorage.tag(tagId).exists();
        if(!tagExists)
            throw new Error(`Cannot add tag ${tagId} to post ${postId}, as the tag does not exist`);

        await this.repo.add(postId, tagId);
    }

    async removePost(postId: number): Promise<void> {
        await this.repo.deletePost(postId);
    }

    async removeTag(tagId: number): Promise<void> {
        await this.repo.deleteTag(tagId);
    }

    async removeTagFromPost(postId: number, tagId: number): Promise<void> {
        await this.repo.remove(postId, tagId);
    }

    async postCount(tagId: number): Promise<number> {
        const tagPosts = await this.repo.tagPosts(tagId);
        return tagPosts.size;
    }
}

export const postTagsStorage = new PostTagsStorage();
