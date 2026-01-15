import { RequestHandler } from "express";
import { ListPostsQueryCompile } from "./post-controller.schema.js";
import { tagStorage } from "../processing/tag-storage.js";
import { ParseError } from "typebox/value";
import { CreateTagBodyCompile, FetchTagQueryCompile, TagSuggestionsQueryCompile } from "./tag-controller.schema.js";
import { Tag } from "../data/tag.js";

export const listTags: RequestHandler = async (req, res) => {
    try {
        const { from, count } = ListPostsQueryCompile.Parse(req.query);

        const totalCount = await tagStorage.count();
        const tags = await tagStorage.page(from, count);

        res.contentType("application/json");
        res.end(JSON.stringify({
            tags: await Promise.all(tags.map(async tag => ({
                id: tag.id,
                name: await tag.name()
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

export const createTag: RequestHandler = async (req, res) => {
    try {
        const { name } = CreateTagBodyCompile.Parse(req.body);
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

export const fetchTag: RequestHandler = async (req, res) => {
    try {
        const { id } = FetchTagQueryCompile.Parse(req.params);

        const tag = tagStorage.tag(id);

        res.contentType("application/json");
        res.end(JSON.stringify({
            name: await tag.name()
        }));
    } catch (error) {
        if(error instanceof ParseError) {
            res.status(400);
            res.end();
            return;
        }

        console.error("Error while fetching tag", error);
        res.status(500);
        res.end();
    }
};

export const deleteTag: RequestHandler = async (req, res) => {
    try {
        const { id } = FetchTagQueryCompile.Parse(req.params);

        console.log(`Deleted tag: ${id}`);
        await tagStorage.delete(id);

        res.end();
    } catch (error) {
        if(error instanceof ParseError) {
            res.status(400);
            res.end();
            return;
        }

        console.error("Error while deleting tag", error);
        res.status(500);
        res.end();
    }
};

export const suggestTags: RequestHandler = async (req, res) => {
    try {
        const { query } = TagSuggestionsQueryCompile.Parse(req.query);
        const sanitized = Tag.sanitizedName(query);
        if(sanitized.length === 0) {
            res.contentType("application/json");
            res.end("[]");
            return;
        }

        const suggestions = await tagStorage.suggestions(sanitized);
        res.contentType("application/json");
        res.end(JSON.stringify(suggestions));
    } catch (error) {
        if(error instanceof ParseError) {
            res.status(400);
            res.end();
            return;
        }

        console.error(error);
        res.status(500);
        res.end();
    }
};
