import { Dirent } from "fs";
import { config } from "../config.js";
import { readdir } from "fs/promises";
import { uploadProcessor } from "./upload-processor.js";
import { extname, join } from "path";

export type ImportProgressStart = {
    type: "start";
    files: number;
};

export type ImportProgressFile = {
    type: "file";
    currentFile: string;
    filesProcessed: number;
};

export type ImportProgressDone = {
    type: "done";
};

export type ImportProgress = ImportProgressStart | ImportProgressFile | ImportProgressDone;

export type ImportProgressListener = (progress: ImportProgress) => void;

class ImportProcessor {
    private readonly listeners: Set<ImportProgressListener>;
    private processing: boolean;
    private files: number;
    private currentIndex: number;
    private currentFile: string;

    constructor() {
        this.listeners = new Set();
        this.processing = false;
        this.files = 0;
        this.currentIndex = 0;
        this.currentFile = "";
    }

    get running(): boolean {
        return this.processing;
    }

    addListener(listener: ImportProgressListener): void {
        this.listeners.add(listener);

        if(this.processing) {
            listener({ type: "start", files: this.files });
            listener({ type: "file", filesProcessed: this.currentIndex, currentFile: this.currentFile })
        } else {
            listener({ type: "done" });
        }
    }

    removeListener(listener: ImportProgressListener): void {
        this.listeners.delete(listener);
    }

    async processImports(): Promise<void> {
        if(this.processing)
            return;

        this.processing = true;

        const files = await readdir(config.importDirectory, { encoding: "utf-8", recursive: false, withFileTypes: true });
        this.files = files.length;

        this.notifyListeners({ type: "start", files: this.files });

        for(this.currentIndex = 0; this.currentIndex < files.length; ++this.currentIndex) {
            const file = files[this.currentIndex];
            if(!file.isFile())
                continue;

            this.currentFile = file.name;
            this.notifyListeners({ type: "file", filesProcessed: this.currentIndex, currentFile: this.currentFile });

            await uploadProcessor.process(join(file.parentPath, file.name), extname(file.name));
            await new Promise<void>(r => setTimeout(r, 500));
        }

        this.notifyListeners({ type: "done" });
        this.processing = false;
    }

    private notifyListeners(progress: ImportProgress): void {
        for(const listener of this.listeners)
            listener(progress);
    }
}

export const importProcessor = new ImportProcessor();
