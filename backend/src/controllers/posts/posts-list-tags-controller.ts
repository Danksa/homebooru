import { RequestHandler } from "express";
import { postTagsStorage } from "../../processing/post-tags-storage.js";
import { tagStorage } from "../../processing/tag-storage.js";
import { ParseError } from "typebox/value";
import Type from "typebox";
import Compile from "typebox/compile";
import { categoryStorage } from "../../processing/category-storage.js";
import { Category } from "../../data/category.js";

const Query = Type.Object({
    id: Type.Integer({ minimum: 0 })
});

const QueryParser = Compile(Query);

export const listPostTags: RequestHandler = async (req, res) => {
    try {
        const { id } = QueryParser.Parse(req.params);

        const tagIds = await postTagsStorage.tagIds(id);
        const tags = await Promise.all(Array.from(tagIds).map(id => tagStorage.tag(id)));

        res.contentType("application/json");
        res.end(JSON.stringify(await Promise.all(tags.map(async tag => {
            const data = await tag.data();

            const category = data.category != null ? categoryStorage.category(data.category) : null;
            const categoryData = category != null ? await category.data() : null;

            return {
                id: tag.id,
                name: data.name,
                color: categoryData != null ? categoryData.color : Category.DefaultColor,
                category: categoryData != null ? categoryData.name : "Default",
                count: await postTagsStorage.postCount(tag.id)
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
