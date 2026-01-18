import { mkdir, writeFile } from "fs/promises";
import { config } from "./config.js";

export const initialize = async () => {
    await mkdir(config.importDirectory, { recursive: true });
    await mkdir(config.postsDirectory, { recursive: true });
    await mkdir(config.tagDirectory, { recursive: true });
    await mkdir(config.thumbnailDirectory, { recursive: true });
    await mkdir(config.uploadsDirectory, { recursive: true });
    await mkdir(config.categoryDirectory, { recursive: true });
    await writeFile(config.postTagsFilePath, "", { flag: "wx" }).catch(() => { /* File already exists */ });
};
