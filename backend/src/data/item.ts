import { readFile, stat, unlink, writeFile } from "fs/promises";
import { Cachable } from "./cachable.js";

type CachedItem<Data> = {
    filePath: string;
    accessTime: number;
    data: Data;
};

export const Item = <Data>(parser: (data: unknown) => Data, directory: string, defaultData: Data) => {
    return class Item implements Cachable<Data> {
        private cached: CachedItem<Data> | null;

        readonly id: number;

        constructor(id: number) {
            this.id = id;
            this.cached = null;
        }

        async exists(): Promise<boolean> {
            await this.fetchCache();
            return this.cached != null;
        }

        async save(data: Partial<Data>): Promise<void> {
            await this.fetchCache();
            const currentData = this.cached != null ? this.cached.data : {};
            const newData = {
                ...defaultData,
                ...currentData,
                ...data
            };

            const encoded = JSON.stringify(newData, undefined, "\t");
            console.log("Saving item", encoded);

            try {
                const path = await this.path();

                await writeFile(path, encoded, { encoding: "utf-8" });

                if(this.cached != null) {
                    this.cached.accessTime = Date.now();
                    this.cached.data = newData;
                }
            } catch {
                await writeFile(this.filePath(), encoded);
            }
        }

        async data(): Promise<Data> {
            await this.fetchCache();
            if(this.cached == null)
                throw new Error(`Item ${this.id} does not exist`);
            return this.cached.data;
        }

        async delete(): Promise<void> {
            try {
                const path = await this.path();
                await unlink(path);
                this.clearCache();
            } catch {
                // Item already deleted
            }
        }

        private clearCache(): void {
            this.cached = null;
        }

        async path(): Promise<string> {
            await this.fetchCache();
            if(this.cached == null)
                throw new Error(`Item with ID ${this.id} does not exist`);
            return this.cached.filePath;
        }

        private filePath(): string {
            return `${directory}/${this.id.toFixed(0)}.json`;
        }

        private async fetchCache(): Promise<void> {
            if(this.cached == null) {
                await this.updateCache(this.filePath());
            } else {
                const { filePath, accessTime } = this.cached;
                try {
                    const stats = await stat(filePath);
                    if(stats.mtimeMs <= accessTime)
                        return;

                    await this.updateCache(filePath);
                } catch {
                    this.clearCache();
                    await this.fetchCache();
                }
            }
        }

        protected async updateCache(filePath: string): Promise<void> {
            console.log(`Fetching item ${this.id}: ${filePath}`);

            try {
                const stats = await stat(filePath);
                const content = await readFile(filePath, { encoding: "utf-8" });
                const json = parser(JSON.parse(content));

                this.cached = {
                    accessTime: stats.mtimeMs,
                    filePath,
                    data: json
                };
            } catch (error) {
                console.error(`Could not read item ${this.id} (${filePath})`, error);
            }
        }
    }
};
