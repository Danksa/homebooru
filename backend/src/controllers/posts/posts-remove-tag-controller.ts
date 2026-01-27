import { RequestHandler } from "express";
import Type from "typebox";
import Compile from "typebox/compile";
import { ParseError } from "typebox/value";
import { postTagsStorage } from "../../processing/post-tags-storage.js";
import { PostId } from "./posts.schema.js";
import { TagId } from "../tags/tags.schema.js";

const Query = Type.Object({
    id: PostId,
    tagId: TagId
});

const QueryParser = Compile(Query);

export const removePostTag: RequestHandler = async (req, res) => {
    try {
        const { id, tagId } = QueryParser.Parse(req.params);

        await postTagsStorage.removeTagFromPost(id, tagId);

        res.end();
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