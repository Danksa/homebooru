import { backendUrl, tagsPerPage } from "./config.js";
import "./components/tags-nav.js";

const tagList = document.getElementById("tags");
const tagNav = document.getElementById("tag-nav");

const urlParams = new URLSearchParams(window.location.search);
const start = Number(urlParams.get('start') ?? "0");

const fetchTags = async () => {
    const result = await fetch(`${backendUrl}/tags?from=${start}&count=${tagsPerPage}`);
    const body = await result.json();
    console.log("Result", body);

    tagList.tags = body.tags;
    tagNav.create({
        start,
        total: body.total,
        step: tagsPerPage
    });
};

fetchTags();
