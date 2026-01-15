import { Size } from "./processing/thumbnail-generator.js";

class Config {
    private readonly dataDirectory: string;

    readonly ThumbnailSize: Size = { width: 300, height: 300 };

    constructor() {
        this.dataDirectory = process.env.DATA_DIRECTORY ?? "./data";
    }

    get postsDirectory(): string {
        return `${this.dataDirectory}/posts`;
    }

    get uploadsDirectory(): string {
        return `${this.dataDirectory}/uploads`;
    }

    get thumbnailDirectory(): string {
        return `${this.dataDirectory}/thumbnails`;
    }

    get tagDirectory(): string {
        return `${this.dataDirectory}/tags`;
    }

    get postTagsFilePath(): string {
        return `${this.dataDirectory}/post-tags.txt`;
    }

    get importDirectory(): string {
        return `${this.dataDirectory}/imports`;
    }
}

export const config = new Config();
