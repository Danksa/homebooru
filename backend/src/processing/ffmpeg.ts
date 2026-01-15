import { Serializable, spawn } from "child_process";
import { Size } from "./thumbnail-generator.js";

class Ffmpeg {
    async generateThumbnail(inputPath: string, outputPath: string, size: Size): Promise<void> {
        const width = size.width.toFixed(0);
        const height = size.height.toFixed(0);
        const sizeArg = `${width}x${height}`;

        const format = "[0]format=yuva420p"; // Required to support transparency
        const scale = `scale=w=${width}:h=${height}:force_original_aspect_ratio=decrease`;
        const pad = `pad=${width}:${height}:(( (ow - iw)/2 )):(( (oh - ih)/2 )):azure@0`;

        const process = spawn("ffmpeg", ["-i", inputPath, "-s", sizeArg, "-vf", `${format},${scale},${pad},thumbnail`, "-frames:v", "1", outputPath]);
        try {
            await new Promise<void>((resolve, reject) => {
                process.once("close", (code) => {
                    if (code === 0)
                        resolve();
                    else
                        reject(new Error(`ffmpeg exited with code ${code}`));
                });
            });
        } catch (error) {
            console.error("Could not generate thumbnail:", error);
        }
    }
}

export const ffmpeg = new Ffmpeg();
