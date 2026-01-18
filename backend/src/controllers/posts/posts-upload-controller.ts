import { RequestHandler } from "express";
import { ProgressListener, uploadProcessor } from "../../processing/upload-processor.js";
import { extname } from "path";
import { config } from "../../config.js";
import multer from "multer";
import { WebSocketHandler } from "../../websocket/web-socket-router.js";
import Type from "typebox";
import Compile from "typebox/compile";

const Query = Type.Object({
    progressId: Type.Optional(Type.String())
});

const QueryParser = Compile(Query);

const trackProgress: RequestHandler = (req, _, next) => {
    const { progressId } = QueryParser.Parse(req.query);

    if(progressId == null) {
        next();
        return;
    }

    uploadProcessor.queue(progressId);

    const contentLength = req.headers["content-length"];
    if(contentLength == null) {
        next();
        uploadProcessor.updateProgress(progressId, 100.0);
        return;
    }

    const size = parseInt(contentLength);
    let transferred = 0;
    req.on("data", chunk => {
        transferred += chunk.length;

        const progress = 100.0 * transferred / size;
        uploadProcessor.updateProgress(progressId, progress);
    });
    
    console.log("next");
    next();
};

const processPosts: RequestHandler = async (req, res) => {
    console.log("process start");

    if(req.files == null || !Array.isArray(req.files)) {
        res.status(400);
        res.end();
        return;
    }

    const { progressId } = QueryParser.Parse(req.query);

    for(const file of req.files) {
        try {
            await uploadProcessor.process(file.path, extname(file.originalname), progressId);
        } catch (error) {
            console.error(`Processing upload: "${file.filename}" failed`, error);
            res.status(500);
        }
    }
    
    res.end();
};

const upload = multer({ dest: config.uploadsDirectory });

export const uploadPosts: Array<RequestHandler> = [trackProgress, upload.array("files"), processPosts];

export const trackUploadStatus: WebSocketHandler = (ws, req, next) => {
    const listener: ProgressListener = (id, progress) => {
        ws.send(`${id}:${progress.toFixed(2)}`);
    };

    uploadProcessor.addListener(listener);

    ws.on("close", () => {
        uploadProcessor.removeListener(listener);
    });

    next();
};
