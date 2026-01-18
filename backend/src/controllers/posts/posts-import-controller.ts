import { RequestHandler } from "express";
import { readdir } from "fs/promises";
import { config } from "../../config.js";
import { uploadProcessor } from "../../processing/upload-processor.js";
import { extname, join } from "path";

let importRunning = false;

export const runPostImport: RequestHandler = (_, res) => {
    if(importRunning) {
        res.status(400);
        res.end("Already running");
        return;
    }

    importRunning = true;

    const processFiles = async () => {
        const files = await readdir(config.importDirectory, { encoding: "utf-8", recursive: false, withFileTypes: true });
        for(const file of files) {
            if(!file.isFile())
                continue;

            await uploadProcessor.process(join(file.parentPath, file.name), extname(file.name));
        }

        await new Promise<void>(r => setTimeout(r, 5000));

        importRunning = false;
    };

    processFiles();
    res.status(202);
    res.end();
};
