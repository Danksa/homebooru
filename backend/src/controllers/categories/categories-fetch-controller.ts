import { RequestHandler } from "express";
import Type from "typebox";
import Compile from "typebox/compile";
import { categoryStorage } from "../../processing/category-storage.js";
import { ParseError } from "typebox/value";

const Query = Type.Object({
    id: Type.Integer({ minimum: 0 })
});

const QueryParser = Compile(Query);

export const fetchCategory: RequestHandler = async (req, res) => {
    try {
        const { id } = QueryParser.Parse(req.params);

        const category = categoryStorage.category(id);
        const data = await category.data();

        res.contentType("application/json");
        res.end(JSON.stringify({
            name: data.name,
            color: data.color
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
