export type TaggedPost = readonly [postId: number, tagId: number];

export type PostTagsRepository = {
    add(postId: number, tagId: number): Promise<void>;
    remove(postId: number, tagId: number): Promise<void>;
    deletePost(postId: number): Promise<void>;
    deleteTag(tagId: number): Promise<void>;
    postTags(postId: number): Promise<ReadonlySet<number>>;
    tagPosts(tagId: number): Promise<ReadonlySet<number>>;
};