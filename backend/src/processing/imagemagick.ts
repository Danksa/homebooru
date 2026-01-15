import { spawn } from "child_process";
import { Size } from "./thumbnail-generator.js";

class ImageMagick {
    async generateThumbnail(inputPath: string, outputPath: string, size: Size): Promise<void> {
        const sizeArg = `${size.width.toFixed(0)}x${size.height.toFixed(0)}`;
        const process = spawn("magick", [inputPath, "-resize", sizeArg, "-background", "transparent", "-gravity", "center", "-extent", sizeArg, outputPath]);
        try {
            await new Promise<void>((resolve, reject) => {
                process.once("close", (code) => {
                    if (code === 0)
                        resolve();
                    else
                        reject(new Error(`magick exited with code ${code}`));
                });
            });
        } catch (error) {
            console.error("Could not generate thumbnail:", error);
        }
    }
}

export const imageMagick = new ImageMagick();
