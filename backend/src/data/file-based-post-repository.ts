import { readdir, stat } from "fs/promises";
import { PostRepository } from "./post-repository.js";
import { Post } from "./post.js";
import { join, parse } from "path";
import { Dirent } from "fs";

export class FileBasedPostRepository implements PostRepository {
    private readonly directory: string;
    private readonly cached: Map<number, Post>;

    constructor(postDirectory: string) {
        this.directory = postDirectory;
        this.cached = new Map();
    }

    post(id: number): Post {
        const cachedPost = this.cached.get(id);
        if(cachedPost != null)
            return cachedPost;

        const post = new Post(id);
        this.cached.set(id, post);
        return post;
    }

    async delete(id: number): Promise<void> {
        const post = this.post(id);
        this.cached.delete(id);
        await post.delete();
    }

    async *posts(): AsyncGenerator<Post> {
        const files = await readdir(this.directory, { withFileTypes: true, encoding: "utf-8", recursive: false });
        files.sort(FileBasedPostRepository.byId);
        for(const file of files) {
            if(!file.isFile())
                continue;

            const name = parse(file.name).name;
            const fileId = Number(name);
            if(!Number.isInteger(fileId))
                continue;

            const cachedPost = this.cached.get(fileId);
            if(cachedPost != null) {
                yield cachedPost;
                continue;
            }

            const filePath = join(file.parentPath, file.name);
            const post = await Post.existing(fileId, filePath);
            this.cached.set(fileId, post);

            yield post;
        }
    }

    static byId(a: Dirent<string>, b: Dirent<string>): number {
        return Number(parse(b.name).name) - Number(parse(a.name).name);
    }
}
