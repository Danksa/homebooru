import { RequestHandler } from "express";
import { tagStorage } from "../../processing/tag-storage.js";
import { postTagsStorage } from "../../processing/post-tags-storage.js";
import { ParseError } from "typebox/value";
import Type from "typebox";
import Compile from "typebox/compile";

const Query = Type.Object({
    id: Type.Integer({ minimum: 0 })
});

const QueryParser = Compile(Query);

const Body = Type.Union([
    Type.Object({
        name: Type.String()
    }),
    Type.Object({
        names: Type.Array(Type.String(), { readOnly: true })
    })
]);

const BodyParser = Compile(Body);

export const addPostTags: RequestHandler = async (req, res) => {
    try {
        const { id } = QueryParser.Parse(req.params);
        const parsed = BodyParser.Parse(req.body);

        const names = "names" in parsed ? parsed.names : [parsed.name];
        for(const name of names) {
            let tagId: number | null = null;
            try {
                tagId = await tagStorage.tagId(name);
            } catch {
                const tag = await tagStorage.create(name);
                tagId = tag.id;
            }

            await postTagsStorage.addTag(id, tagId);
        }

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
