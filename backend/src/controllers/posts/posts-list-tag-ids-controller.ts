import { RequestHandler } from "express";
import { postTagsStorage } from "../../processing/post-tags-storage.js";
import { tagStorage } from "../../processing/tag-storage.js";
import { ParseError } from "typebox/value";
import Type from "typebox";
import Compile from "typebox/compile";

const Query = Type.Object({
    id: Type.Integer({ minimum: 0 })
});

const QueryParser = Compile(Query);

export const listPostTagIds: RequestHandler = async (req, res) => {
    try {
        const { id } = QueryParser.Parse(req.params);

        const tagIds = await postTagsStorage.tagIds(id);
        const tags = await Promise.all(Array.from(tagIds).map(id => tagStorage.tag(id)));

        res.contentType("application/json");
        res.end(JSON.stringify(await Promise.all(tags.map(async tag => {
            const data = await tag.data();
            return {
                id: tag.id,
                name: data.name
            };
        }))));
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
