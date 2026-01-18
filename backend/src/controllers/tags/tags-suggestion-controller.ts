import { RequestHandler } from "express";
import { Tag } from "../../data/tag.js";
import { tagStorage } from "../../processing/tag-storage.js";
import { ParseError } from "typebox/value";
import Compile from "typebox/compile";
import Type from "typebox";


const Query = Type.Object({
    query: Type.String()
});

const QueryParser = Compile(Query);

export const suggestTags: RequestHandler = async (req, res) => {
    try {
        const { query } = QueryParser.Parse(req.query);
        const sanitized = Tag.sanitizedName(query);
        if(sanitized.length === 0) {
            res.contentType("application/json");
            res.end("[]");
            return;
        }

        const suggestions = await tagStorage.suggestions(sanitized);
        res.contentType("application/json");
        res.end(JSON.stringify(suggestions));
    } catch (error) {
        if(error instanceof ParseError) {
            res.status(400);
            res.end();
            return;
        }

        console.error(error);
        res.status(500);
        res.end();
    }
};
