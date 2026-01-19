import { RequestHandler } from "express";
import Compile from "typebox/compile";
import Type from "typebox";
import { Category } from "../../data/category.js";
import { categoryStorage } from "../../processing/category-storage.js";

const Body = Type.Object({
    name: Type.String(),
    color: Type.String()
});

const BodyParser = Compile(Body);

export const createCategory: RequestHandler = async (req, res) => {
    try {
        const { name, color } = BodyParser.Parse(req.body);
        const sanitized = Category.sanitizedName(name);
        console.log(`Creating category: "${name}" -> "${sanitized}"`);

        if(sanitized.length === 0) {
            res.status(400);
            res.end(`Category name "${sanitized}" has no length after sanitization`);
            return;
        }

        const existingNames = await categoryStorage.names();
        if(existingNames.includes(sanitized)) {
            res.status(400);
            res.end(`Category with name "${sanitized}" already exists`);
            return;
        }

        await categoryStorage.create(sanitized, color);

        res.status(200);
        res.end();
    } catch (error) {
        console.error("Error while creating category", error);
        res.status(500);
        res.end();
    }
};
