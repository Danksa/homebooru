import { access, stat, unlink } from "fs/promises";
import { basename, join } from "path";
import { config } from "../config.js";

type Cache = {
    filePath: string;
    accessTime: number;
};

export class Thumbnail {
    static readonly Extension: string = ".png";
    static readonly DefaultName: string = `default${this.Extension}`;

    private cached: Cache | null;

    readonly id: number;

    constructor(id: number) {
        this.id = id;
        this.cached = null;
    }

    async delete(): Promise<void> {
        try {
            const thumbnailPath = await this.path();
            if(basename(thumbnailPath) !== Thumbnail.DefaultName)
                await unlink(thumbnailPath);

            this.clearCache();
        } catch {
            // Thumbnail already deleted
        }
    }

    async fileName(): Promise<string> {
        const path = await this.path();
        return basename(path);
    }

    async path(): Promise<string> {
        await this.fetchCache();
        if(this.cached == null)
            throw new Error(`Thumbnail with ID ${this.id} does not exist`);
        return this.cached.filePath;
    }

    private async fetchCache(): Promise<void> {
        if(this.cached == null) {
            const filePath = await this.filePath();
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

    private clearCache(): void {
        this.cached = null;
    }
    
    private async updateCache(filePath: string): Promise<void> {
        console.log(`Fetching thumbnail ${this.id}: ${filePath}`);

        try {
            const stats = await stat(filePath);
            this.cached = {
                filePath,
                accessTime: stats.mtimeMs
            };
        } catch {
            this.cached = {
                filePath: join(config.thumbnailDirectory, Thumbnail.DefaultName),
                accessTime: Date.now()
            };
        }
    }

    private async filePath(): Promise<string> {
        let thumbnailPath = join(config.thumbnailDirectory, Thumbnail.name(this.id));
        try {
            await access(thumbnailPath);
        } catch {
            thumbnailPath = join(config.thumbnailDirectory, Thumbnail.DefaultName);
        }
        return thumbnailPath;
    }

    static name(postId: number): string {
        return `${postId.toFixed(0)}${this.Extension}`;
    }
}
