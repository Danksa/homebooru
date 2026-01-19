import { tagsPerPage } from "./config.js";
import { backend } from "./util/backend.js";
import "./components/tags-nav.js";

const tagList = document.getElementById("tags");
const tagNav = document.getElementById("tag-nav");
const categoryList = document.getElementById("categories");

const urlParams = new URLSearchParams(window.location.search);
const start = Number(urlParams.get('start') ?? "0");

const fetchTags = async () => {
    const body = await backend.get(`/tags?from=${start}&count=${tagsPerPage}`);

    tagList.tags = body.tags;
    tagNav.create({
        start,
        total: body.total,
        step: tagsPerPage
    });
};
fetchTags();

const fetchCategories = async () => {
    const categories = await backend.get("/categories");
    categoryList.categories = categories;
};
fetchCategories();
