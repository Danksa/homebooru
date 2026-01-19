import { RequestHandler } from "express";
import { categoryStorage } from "../../processing/category-storage.js";

export const listCategories: RequestHandler = async (_, res) => {
    try {
        const categories = new Array<{ id: number; name: string; color: string; }>;
        for await (const category of categoryStorage.categories()) {
            const data = await category.data();
            categories.push({
                id: category.id,
                name: data.name,
                color: data.color
            });
        }

        res.contentType("application/json");
        res.end(JSON.stringify(categories));
    } catch {
        res.status(500);
        res.end();
    }
};
