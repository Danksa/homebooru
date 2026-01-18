import { RequestHandler } from "express";
import { tagStorage } from "../../processing/tag-storage.js";
import { ParseError } from "typebox/value";
import Type from "typebox";
import Compile from "typebox/compile";

const Query = Type.Object({
    from: Type.Integer({ minimum: 0 }),
    count: Type.Integer({ minimum: 1 }),
    query: Type.Optional(Type.String())
});

const QueryParser = Compile(Query);

export const listTags: RequestHandler = async (req, res) => {
    try {
        const { from, count } = QueryParser.Parse(req.query);

        const totalCount = await tagStorage.count();
        const tags = await tagStorage.page(from, count);

        res.contentType("application/json");
        res.end(JSON.stringify({
            tags: await Promise.all(tags.map(async tag => ({
                id: tag.id,
                name: await tag.name()
            }))),
            total: totalCount
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
