import { RequestHandler } from "express";
import { postStorage } from "../../processing/post-storage.js";

export const postCount: RequestHandler = async (_, res) => {
    try {
        const count = await postStorage.count();

        res.contentType("application/json");
        res.end(JSON.stringify(count));
    } catch (error) {
        console.error("Error while counting posts", error);

        res.contentType("text/raw");
        res.status(500);
        res.end();
    }
};
