import { RequestHandler } from "express";
import { tagStorage } from "../../processing/tag-storage.js";
import Compile from "typebox/compile";
import Type from "typebox";
import { TagId } from "./tags.schema.js";

const Query = Type.Object({
    id: TagId
});

const QueryParser = Compile(Query);

const Body = Type.Object({
    name: Type.String(),
    category: Type.Union([Type.Integer(), Type.Null()])
});

const BodyParser = Compile(Body);

export const updateTag: RequestHandler = async (req, res) => {
    try {
        const { id } = QueryParser.Parse(req.params);
        const { name, category } = BodyParser.Parse(req.body);
        
        await tagStorage.update(id, { name, category });

        res.end();
    } catch (error) {
        console.error("Error while creating tag", error);
        res.status(500);
        res.end();
    }
};
