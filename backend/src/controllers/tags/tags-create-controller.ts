import { RequestHandler } from "express";
import { Tag } from "../../data/tag.js";
import { tagStorage } from "../../processing/tag-storage.js";
import Compile from "typebox/compile";
import Type from "typebox";
import { categoryStorage } from "../../processing/category-storage.js";

const Body = Type.Object({
    name: Type.String(),
    category: Type.Union([Type.Number(), Type.Null()])
});

const BodyParser = Compile(Body);

export const createTag: RequestHandler = async (req, res) => {
    try {
        const { name, category: categoryId } = BodyParser.Parse(req.body);
        const sanitized = Tag.sanitizedName(name);
        console.log(`Creating tag: "${name}" -> "${sanitized}"`);

        if(sanitized.length === 0) {
            res.status(400);
            res.end(`Tag name "${sanitized}" has no length after sanitization`);
            return;
        }

        const existingNames = await tagStorage.names();
        if(existingNames.includes(sanitized)) {
            res.status(400);
            res.end(`Tag with name "${sanitized}" already exists`);
            return;
        }

        let category: number | undefined = undefined;
        if(categoryId != null && await categoryStorage.category(categoryId).exists()) {
            category = categoryId;
        }

        await tagStorage.create(sanitized, category);

        res.end();
    } catch (error) {
        console.error("Error while creating tag", error);
        res.status(500);
        res.end();
    }
};
