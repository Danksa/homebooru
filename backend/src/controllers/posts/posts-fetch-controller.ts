import { RequestHandler } from "express";
import { postStorage } from "../../processing/post-storage.js";
import { ParseError } from "typebox/value";
import Type from "typebox";
import Compile from "typebox/compile";
import { PostId } from "./posts.schema.js";

const Query = Type.Object({
    id: PostId
});

const QueryParser = Compile(Query);

export const fetchPost: RequestHandler = async (req, res) => {
    try {
        const { id } = QueryParser.Parse(req.params);

        const post = postStorage.post(id);
        const postUrl = await post.fileName();
        const data = await post.data();

        res.contentType("application/json");
        res.end(JSON.stringify({
            url: postUrl,
            type: data.embedType
        }));
    } catch (error) {
        if(error instanceof ParseError) {
            res.status(400);
            res.end();
            return;
        }

        console.error("Failed:", error);
        res.status(500);
        res.end();
    }
};
