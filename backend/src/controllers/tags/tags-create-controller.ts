import { RequestHandler } from "express";
import { Tag } from "../../data/tag.js";
import { tagStorage } from "../../processing/tag-storage.js";
import Compile from "typebox/compile";
import Type from "typebox";

const Body = Type.Object({
    name: Type.String()
});

const BodyParser = Compile(Body);

export const createTag: RequestHandler = async (req, res) => {
    try {
        const { name } = BodyParser.Parse(req.body);
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

        await tagStorage.create(sanitized);

        res.end();
    } catch (error) {
        console.error("Error while creating tag", error);
        res.status(500);
        res.end();
    }
};
