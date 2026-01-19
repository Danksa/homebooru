import { RequestHandler } from "express";
import Compile from "typebox/compile";
import Type from "typebox";
import { Category } from "../../data/category.js";
import { categoryStorage } from "../../processing/category-storage.js";
import { CategoryId } from "./categories.schema.js";

const Query = Type.Object({
    id: CategoryId
});

const QueryParser = Compile(Query);

const Body = Type.Object({
    name: Type.String(),
    color: Type.String()
});

const BodyParser = Compile(Body);

export const updateCategory: RequestHandler = async (req, res) => {
    try {
        const { id } = QueryParser.Parse(req.params);
        const { name, color } = BodyParser.Parse(req.body);

        await categoryStorage.update(id, { name, color });

        res.status(200);
        res.end();
    } catch (error) {
        console.error("Error while creating category", error);
        res.status(500);
        res.end();
    }
};
