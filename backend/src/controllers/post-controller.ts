import { RequestHandler } from "express";
import { uploadProcessor } from "../processing/upload-processor.js";
import { postStorage } from "../processing/post-storage.js";
import { extname, join } from "path";
import { AddTagsBodyCompile, FetchPostQueryCompile, ListPostsQueryCompile, RemoveTagQueryCompile } from "./post-controller.schema.js";
import { ParseError } from "typebox/value";
import { tagStorage } from "../processing/tag-storage.js";
import { postTagsStorage } from "../processing/post-tags-storage.js";
import { readdir } from "fs/promises";
import { config } from "../config.js";

export const postCount: RequestHandler = async (_, res) => {
    try {
        const count = await postStorage.count();

        res.contentType("application/json");
        res.end(JSON.stringify(count));
    } catch (error) {
        console.error("Error while counting posts", error);

        res.contentType("text/raw");
        res.status(500);
        res.end();
    }
};

export const uploadPosts: RequestHandler = async (req, res) => {
    if(req.files == null || !Array.isArray(req.files)) {
        res.status(400);
        res.end();
        return;
    }

    for(const file of req.files) {
        try {
            await uploadProcessor.process(file.path, extname(file.originalname));
        } catch (error) {
            console.error(`Processing upload: "${file.filename}" failed`, error);
            res.status(500);
        }
    }
    
    res.end();
};

export const listPosts: RequestHandler = async (req, res) => {
    try {
        const { from, count, query } = ListPostsQueryCompile.Parse(req.query);

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

export const fetchPost: RequestHandler = async (req, res) => {
    try {
        const { id } = FetchPostQueryCompile.Parse(req.params);

        const post = postStorage.post(id);
        const postUrl = await post.fileName();
        const embedType = await post.embedType();

        res.contentType("application/json");
        res.end(JSON.stringify({
            url: postUrl,
            type: embedType
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

export const listPostTagIds: RequestHandler = async (req, res) => {
    try {
        const { id } = FetchPostQueryCompile.Parse(req.params);

        const tagIds = await postTagsStorage.tagIds(id);
        const tags = await Promise.all(Array.from(tagIds).map(id => tagStorage.tag(id)));

        res.contentType("application/json");
        res.end(JSON.stringify(await Promise.all(tags.map(async tag => ({
            id: tag.id,
            name: await tag.name()
        })))));
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

export const addPostTags: RequestHandler = async (req, res) => {
    try {
        const { id } = FetchPostQueryCompile.Parse(req.params);
        const parsed = AddTagsBodyCompile.Parse(req.body);

        const names = "names" in parsed ? parsed.names : [parsed.name];
        for(const name of names) {
            let tagId: number | null = null;
            try {
                tagId = await tagStorage.tagId(name);
            } catch {
                const tag = await tagStorage.create(name);
                tagId = tag.id;
            }

            await postTagsStorage.addTag(id, tagId);
        }

        res.end();
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

export const removePostTag: RequestHandler = async (req, res) => {
    try {
        const { id, tagId } = RemoveTagQueryCompile.Parse(req.params);

        await postTagsStorage.removeTagFromPost(id, tagId);

        res.end();
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

export const deletePost: RequestHandler = async (req, res) => {
    try {
        const { id } = FetchPostQueryCompile.Parse(req.params);

        console.log(`Deleted post: ${id}`);
        await postStorage.delete(id);

        res.end();
    } catch (error) {
        if(error instanceof ParseError) {
            res.status(400);
            res.end();
            return;
        }

        console.error("Error while deleting post", error);
        res.status(500);
        res.end();
    }
};

let importRunning = false;

export const runPostImport: RequestHandler = (_, res) => {
    if(importRunning) {
        res.status(400);
        res.end("Already running");
        return;
    }

    importRunning = true;

    const processFiles = async () => {
        const files = await readdir(config.importDirectory, { encoding: "utf-8", recursive: false, withFileTypes: true });
        for(const file of files) {
            if(!file.isFile())
                continue;

            await uploadProcessor.process(join(file.parentPath, file.name), extname(file.name));
        }

        await new Promise<void>(r => setTimeout(r, 5000));

        importRunning = false;
    };

    processFiles();
    res.status(202);
    res.end();
};
