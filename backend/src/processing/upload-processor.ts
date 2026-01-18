import { join } from "path";
import { config } from "../config.js";
import { postStorage } from "./post-storage.js";
import { rename, unlink } from "fs/promises";
import { imageMagick } from "./imagemagick.js";
import { Thumbnail } from "./thumbnail.js";
import { PostType, postType } from "../data/post-type.js";
import { ThumbnailGenerator } from "./thumbnail-generator.js";
import { ffmpeg } from "./ffmpeg.js";

const thumbnailProcessors = {
    [PostType.Image]: imageMagick.generateThumbnail,
    [PostType.Video]: ffmpeg.generateThumbnail
} satisfies Record<PostType, ThumbnailGenerator>;

export type ProgressListener = (id: string, progress: number) => void;

class UploadProcessor {
    private readonly progress: Map<string, number>;
    private readonly listeners: Set<ProgressListener>;

    constructor() {
        this.progress = new Map();
        this.listeners = new Set();
    }

    addListener(listener: ProgressListener): void {
        this.listeners.add(listener);
        for(const [id, progress] of this.progress)
            listener(id, progress);
    }

    removeListener(listener: ProgressListener): void {
        this.listeners.delete(listener);
    }

    queue(id: string): void {
        this.progress.set(id, 0);
        this.notifyListeners(id, 0);
    }

    updateProgress(id: string, progress: number): void {
        this.progress.set(id, progress);
        this.notifyListeners(id, progress);
    }

    private notifyListeners(id: string, progress: number): void {
        for(const listener of this.listeners)
            listener(id, progress);
    }

    async process(filePath: string, extension: string, id?: string): Promise<void> {
        let type: PostType;
        try {
            type = postType(extension);
        } catch {
            await unlink(filePath);
            return;
        }

        if(id != null) {
            this.progress.delete(id);
        }

        console.log(`Processing upload: [${PostType[type]}] "${filePath}"`);

        const postId = await postStorage.lastId() + 1;
        console.log(`Post ID: ${postId}`);

        const postFileName = `${postId.toFixed(0)}${extension}`;
        const postPath = join(config.postsDirectory, postFileName);
        await rename(filePath, postPath);

        console.log("Generating thumbnail");
        const thumbnailFileName = Thumbnail.name(postId);
        const thumbnailPath = join(config.thumbnailDirectory, thumbnailFileName);

        await thumbnailProcessors[type](postPath, thumbnailPath, config.ThumbnailSize);
    }
}

export const uploadProcessor = new UploadProcessor();
