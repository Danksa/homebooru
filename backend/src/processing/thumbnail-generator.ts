
export type Size = { width: number; height: number };

export type ThumbnailGenerator = (inputPath: string, outputPath: string, size: Size) => Promise<void>;
