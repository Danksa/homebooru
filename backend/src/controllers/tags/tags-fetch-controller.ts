import { RequestHandler } from "express";
import { ParseError } from "typebox/value";
import { tagStorage } from "../../processing/tag-storage.js";
import Type from "typebox";
import Compile from "typebox/compile";

const Query = Type.Object({
    id: Type.Integer({ minimum: 0 })
});

const QueryParser = Compile(Query);

export const fetchTag: RequestHandler = async (req, res) => {
    try {
        const { id } = QueryParser.Parse(req.params);

        const tag = tagStorage.tag(id);

        res.contentType("application/json");
        res.end(JSON.stringify({
            name: await tag.name()
        }));
    } catch (error) {
        if(error instanceof ParseError) {
            res.status(400);
            res.end();
            return;
        }

        console.error("Error while fetching tag", error);
        res.status(500);
        res.end();
    }
};
