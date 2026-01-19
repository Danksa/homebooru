import { RequestHandler } from "express";
import Type from "typebox";
import Compile from "typebox/compile";
import { ParseError } from "typebox/value";
import { categoryStorage } from "../../processing/category-storage.js";

const Query = Type.Object({
    id: Type.Integer({ minimum: 0 })
});

const QueryParser = Compile(Query);

export const deleteCategory: RequestHandler = async (req, res) => {
    try {
        const { id } = QueryParser.Parse(req.params);

        await categoryStorage.delete(id);

        res.status(200);
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