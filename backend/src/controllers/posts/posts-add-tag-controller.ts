import { RequestHandler } from "express";
import { tagStorage } from "../../processing/tag-storage.js";
import { postTagsStorage } from "../../processing/post-tags-storage.js";
import { ParseError } from "typebox/value";
import Type from "typebox";
import Compile from "typebox/compile";
import { Tag } from "../../data/tag.js";
import { PostId } from "./posts.schema.js";

const Query = Type.Object({
    id: PostId
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
        const sanitized = names.map(Tag.sanitizedName);
        for(const name of sanitized) {
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
