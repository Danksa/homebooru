import { RequestHandler } from "express";
import Type from "typebox";
import Compile from "typebox/compile";
import { postStorage } from "../../processing/post-storage.js";
import { tagStorage } from "../../processing/tag-storage.js";
import { ParseError } from "typebox/value";
import { PostId } from "./posts.schema.js";

const Query = Type.Object({
    id: PostId,
    query: Type.Optional(Type.String())
});

const QueryParser = Compile(Query);

export const adjacentPosts: RequestHandler = async (req, res) => {
    try {
        const { id, query } = QueryParser.Parse(req.query);

        const sanitizedQuery = query?.trim();
        const tagNames = sanitizedQuery == null || sanitizedQuery.length === 0 ? null : sanitizedQuery.split(" ");
        const tags = tagNames != null
            ? await Promise.all(
                tagNames.map(async tag => {
                    const excluded = tag.startsWith("-");
                    const id = await tagStorage.tagId(excluded ? tag.slice(1) : tag).catch(() => -1);
                    return [id, excluded] as readonly [id: number, excluded: boolean];
                })
            )
            : [];

        const [previous, next] = await postStorage.adjacent(id, tags);
        
        res.contentType("application/json");
        res.end(JSON.stringify({
            previous: previous?.id ?? null,
            next: next?.id ?? null
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
