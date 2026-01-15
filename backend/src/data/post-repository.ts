import { Post } from "./post.js";

export type PostRepository = {
    post(id: number): Post;
    delete(id: number): Promise<void>;
    posts(): AsyncGenerator<Post>;
};
