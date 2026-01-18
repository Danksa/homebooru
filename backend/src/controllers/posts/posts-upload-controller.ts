import { RequestHandler } from "express";
import { uploadProcessor } from "../../processing/upload-processor.js";
import { extname } from "path";

export const uploadPosts: RequestHandler = async (req, res) => {
    if(req.files == null || !Array.isArray(req.files)) {
        res.status(400);
        res.end();
        return;
    }

    for(const file of req.files) {
        try {
            await uploadProcessor.process(file.path, extname(file.originalname));
        } catch (error) {
            console.error(`Processing upload: "${file.filename}" failed`, error);
            res.status(500);
        }
    }
    
    res.end();
};
