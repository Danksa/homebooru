import { access, readdir, stat, unlink } from "fs/promises";
import { config } from "../config.js";
import { basename, extname, join, parse } from "path";
import { Thumbnail } from "../processing/thumbnail.js";
import { postTagsStorage } from "../processing/post-tags-storage.js";
import { postType, PostType } from "./post-type.js";
import { embedType, EmbedType } from "./embed-type.js";

type PostCache = {
    filePath: string;
    accessTime: number;
    type: PostType;
    embedType: EmbedType;
};

type ThumbnailCache = {
    path: string;
};

export class Post {
    private cached: PostCache | null;
    private cachedThumbnail: ThumbnailCache | null;

    readonly id: number;

    constructor(id: number) {
        this.id = id;
        this.cached = null;
        this.cachedThumbnail = null;
    }

    async exists(): Promise<boolean> {
        await this.fetchCache();
        return this.cached != null;
    }
    
    async delete(): Promise<void> {
        try {
            const path = await this.path();
            await unlink(path);

            const thumbnailPath = await this.thumbnailPath();
            if(basename(thumbnailPath) !== Thumbnail.DefaultName)
                await unlink(thumbnailPath);

            await postTagsStorage.removePost(this.id);

            this.clearCache();
        } catch {
            // Post already deleted
        }
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

    async type(): Promise<PostType> {
        await this.fetchCache();
        if(this.cached == null)
            throw new Error(`Post with ID ${this.id} does not exist`);
        return this.cached.type;
    }

    async embedType(): Promise<EmbedType> {
        await this.fetchCache();
        if(this.cached == null)
            throw new Error(`Post with ID ${this.id} does not exist`);
        return this.cached.embedType;
    }

    async thumbnailFileName(): Promise<string> {
        const path = await this.thumbnailPath();
        return basename(path);
    }

    async thumbnailPath(): Promise<string> {
        if(this.cachedThumbnail != null)
            return this.cachedThumbnail.path;

        let thumbnailPath = join(config.thumbnailDirectory, Thumbnail.name(this.id));
        try {
            await access(thumbnailPath)
        } catch {
            thumbnailPath = join(config.thumbnailDirectory, Thumbnail.DefaultName);
        }

        this.cachedThumbnail = {
            path: thumbnailPath
        };
        return thumbnailPath;
    }

    private async fetchCache(): Promise<void> {
        if(this.cached == null) {
            const filePath = await this.filePath();
            if(filePath == null)
                return;

            await this.updateCache(filePath);
        } else {
            const { filePath: cachedFilePath, accessTime } = this.cached;
            try {
                const stats = await stat(cachedFilePath);
                if (stats.mtimeMs <= accessTime)
                    return;
                
                await this.updateCache(cachedFilePath);
            } catch {
                this.clearCache();
                await this.fetchCache();
            }
        }
    }

    private clearCache(): void {
        this.cached = null;
        this.cachedThumbnail = null;
    }

    private async updateCache(filePath: string): Promise<void> {
        console.log(`Fetching Post ${this.id}: ${filePath}`);

        try {
            const stats = await stat(filePath);
            const extension = extname(filePath);
            this.cached = {
                accessTime: stats.mtimeMs,
                filePath,
                type: postType(extension),
                embedType: embedType(extension)
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
