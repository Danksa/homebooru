import { RequestHandler } from "express";
import Type from "typebox";
import Compile from "typebox/compile";
import { postStorage } from "../../processing/post-storage.js";
import { tagStorage } from "../../processing/tag-storage.js";
import { ParseError } from "typebox/value";

const Query = Type.Object({
    from: Type.Integer({ minimum: 0 }),
    count: Type.Integer({ minimum: 1 }),
    query: Type.Optional(Type.String())
});

const QueryParser = Compile(Query);

export const listPosts: RequestHandler = async (req, res) => {
    try {
        const { from, count, query } = QueryParser.Parse(req.query);

        const sanitizedQuery = query?.trim();
        const tagNames = sanitizedQuery == null || sanitizedQuery.length === 0 ? null : sanitizedQuery.split(" ");
        const tags = tagNames != null ? await Promise.all(tagNames.map(tag => tagStorage.tagId(tag).catch(() => -1))) : [];

        const totalCount = await postStorage.count(tags);
        const posts = await postStorage.query(from, count, tags);

        res.contentType("application/json");
        res.end(JSON.stringify({
            posts: await Promise.all(posts.map(async post => ({
                id: post.id,
                thumbnail: await post.thumbnailFileName(),
                type: await post.embedType()
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
