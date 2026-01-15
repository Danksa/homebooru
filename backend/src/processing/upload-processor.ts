import { join } from "path";
import { config } from "../config.js";
import { postStorage } from "./post-storage.js";
import { rename, unlink } from "fs/promises";
import { imageMagick } from "./imagemagick.js";
import { Thumbnail } from "./thumbnail.js";
import { PostType, postType } from "../data/post-type.js";
import { Size, ThumbnailGenerator } from "./thumbnail-generator.js";
import { ffmpeg } from "./ffmpeg.js";

const thumbnailProcessors = {
    [PostType.Image]: imageMagick.generateThumbnail,
    [PostType.Video]: ffmpeg.generateThumbnail
} satisfies Record<PostType, ThumbnailGenerator>;

class UploadProcessor {
    static readonly ThumbnailSize: Size = { width: 300, height: 300 };

    async process(filePath: string, extension: string): Promise<void> {
        let type: PostType;
        try {
            type = postType(extension);
        } catch {
            await unlink(filePath);
            return;
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

        await thumbnailProcessors[type](postPath, thumbnailPath, UploadProcessor.ThumbnailSize);
    }
}

export const uploadProcessor = new UploadProcessor();
