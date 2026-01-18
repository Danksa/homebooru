import { RequestHandler } from "express";
import { tagStorage } from "../../processing/tag-storage.js";
import { ParseError } from "typebox/value";
import Type from "typebox";
import Compile from "typebox/compile";

const Query = Type.Object({
    id: Type.Integer({ minimum: 0 })
});

const QueryParser = Compile(Query);

export const deleteTag: RequestHandler = async (req, res) => {
    try {
        const { id } = QueryParser.Parse(req.params);

        console.log(`Deleted tag: ${id}`);
        await tagStorage.delete(id);

        res.end();
    } catch (error) {
        if(error instanceof ParseError) {
            res.status(400);
            res.end();
            return;
        }

        console.error("Error while deleting tag", error);
        res.status(500);
        res.end();
    }
};
