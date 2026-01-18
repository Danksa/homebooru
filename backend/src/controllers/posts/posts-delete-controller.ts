import { RequestHandler } from "express";
import { postStorage } from "../../processing/post-storage.js";
import { ParseError } from "typebox/value";
import Type from "typebox";
import Compile from "typebox/compile";

const Query = Type.Object({
    id: Type.Integer({ minimum: 0 })
});

const QueryParser = Compile(Query);

export const deletePost: RequestHandler = async (req, res) => {
    try {
        const { id } = QueryParser.Parse(req.params);

        console.log(`Deleted post: ${id}`);
        await postStorage.delete(id);

        res.end();
    } catch (error) {
        if(error instanceof ParseError) {
            res.status(400);
            res.end();
            return;
        }

        console.error("Error while deleting post", error);
        res.status(500);
        res.end();
    }
};
