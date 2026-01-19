import { access, readdir, stat, unlink } from "fs/promises";
import { config } from "../config.js";
import { basename, extname, join, parse } from "path";
import { Thumbnail } from "./thumbnail.js";
import { postTagsStorage } from "../processing/post-tags-storage.js";
import { postType, PostType } from "./post-type.js";
import { embedType, EmbedType } from "./embed-type.js";

type Data = {
    type: PostType;
    embedType: EmbedType;
};

type Cache = {
    filePath: string;
    accessTime: number;
    data: Data;
};

export class Post {
    private cached: Cache | null;

    readonly id: number;
    readonly thumbnail: Thumbnail;

    constructor(id: number) {
        this.id = id;
        this.cached = null;
        this.thumbnail = new Thumbnail(id);
    }

    async exists(): Promise<boolean> {
        await this.fetchCache();
        return this.cached != null;
    }
    
    async data(): Promise<Data> {
        await this.fetchCache();
        if(this.cached == null)
            throw new Error(`Post ${this.id} does not exist`);
        return this.cached.data;
    }

    async delete(): Promise<void> {
        try {
            const path = await this.path();
            await unlink(path);

            await this.thumbnail.delete();

            await postTagsStorage.removePost(this.id);

            this.clearCache();
        } catch {
            // Post already deleted
        }
    }

    private clearCache(): void {
        this.cached = null;
    }

    async fileName(): Promise<string> {
        const path = await this.path();
        return basename(path);
    }

    async path(): Promise<string> {
        await this.fetchCache();
        if(this.cached == null)
            throw new Error(`Post with ID ${this.id} does not exist`);
        return this.cached.filePath;
    }

    private async fetchCache(): Promise<void> {
        if(this.cached == null) {
            const filePath = await this.filePath();
            if(filePath != null)
                await this.updateCache(filePath);
        } else {
            const { filePath, accessTime } = this.cached;
            try {
                const stats = await stat(filePath);
                if(stats.mtimeMs <= accessTime)
                    return;

                try {
                    await access(filePath);
                    await this.updateCache(filePath);
                } catch {
                    this.cached = null;
                    await this.fetchCache();
                }
            } catch {
                this.clearCache();
                await this.fetchCache();
            }
        }
    }

    private async updateCache(filePath: string): Promise<void> {
        console.log(`Fetching Post ${this.id}: ${filePath}`);

        try {
            const stats = await stat(filePath);
            const extension = extname(filePath);
            this.cached = {
                accessTime: stats.mtimeMs,
                filePath,
                data: {
                    type: postType(extension),
                    embedType: embedType(extension)
                }
            };
        } catch {
            return;
        }
    }

    private async filePath(): Promise<string | null> {
        const files = await readdir(config.postsDirectory, { withFileTypes: true, encoding: "utf-8", recursive: false });
        for(const file of files) {
            if(!file.isFile())
                continue;

            const name = parse(file.name).name;
            const fileId = Number(name);
            if(!Number.isInteger(fileId))
                continue;

            if(fileId === this.id)
                return join(file.parentPath, file.name);
        }

        return null;
    }

    static async existing(id: number, filePath: string): Promise<Post> {
        const post = new Post(id);
        await post.updateCache(filePath);
        return post;
    }
}
