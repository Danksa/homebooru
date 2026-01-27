import { tagsPerPage } from "./config.js";
import { backend } from "./util/backend.js";
import "./components/tags-nav.js";
import { ParamNames, urlStart } from "./util/search-params.js";

const tagList = document.getElementById("tags");
const tagNav = document.getElementById("tag-nav");
const categoryList = document.getElementById("categories");

const start = urlStart();

const fetchTags = async () => {
    const body = await backend.get(`/tags?${ParamNames.start}=${start}&${ParamNames.count}=${tagsPerPage}`);

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
