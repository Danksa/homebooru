import { RequestHandler } from "express";
import Type from "typebox";
import Compile from "typebox/compile";
import { postStorage } from "../../processing/post-storage.js";
import { tagStorage } from "../../processing/tag-storage.js";
import { ParseError } from "typebox/value";
import { postTagsStorage } from "../../processing/post-tags-storage.js";
import { union } from "../../util/set.js";
import { categoryStorage } from "../../processing/category-storage.js";
import { Category } from "../../data/category.js";
import { config } from "../../config.js";

const Query = Type.Object({
    start: Type.Integer({ minimum: 0 }),
    count: Type.Integer({ minimum: 1 }),
    query: Type.Optional(Type.String())
});

const QueryParser = Compile(Query);

export const listPosts: RequestHandler = async (req, res) => {
    try {
        const { start, count, query } = QueryParser.Parse(req.query);

        console.log("QUERY", query);

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

        const totalCount = await postStorage.count(tags);
        const posts = await postStorage.query(start, count, tags);
        const tagIds = await Promise.all(posts.map(post => postTagsStorage.tagIds(post.id)));
        const uniqueTagIds = union(tagIds);
        const tagFrequencies = new Map<number, number>();
        for(const postTagIds of tagIds) {
            for(const tagId of postTagIds)
                tagFrequencies.set(tagId, (tagFrequencies.get(tagId) ?? 0) + 1);
        }

        const tagsWithCounts = await Promise.all(Array.from(uniqueTagIds).map(async id => {
            const tag = tagStorage.tag(id);
            const data = await tag.data();
            const count = await postTagsStorage.postCount(id);
            const color = data.category != null ? (await categoryStorage.category(data.category).data()).color : Category.DefaultColor;
            return {
                name: data.name,
                count,
                color,
                countOnPage: tagFrequencies.get(id) ?? 0
            };
        }));
        tagsWithCounts.sort(({ countOnPage: countA }, { countOnPage: countB }) => countB - countA);

        res.contentType("application/json");
        res.end(JSON.stringify({
            posts: await Promise.all(posts.map(async post => {
                const data = await post.data();
                return {
                    id: post.id,
                    thumbnail: await post.thumbnail.fileName(),
                    type: data.embedType
                };
            })),
            total: totalCount,
            tags: tagsWithCounts.slice(0, config.FrequentTagsCount)
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
