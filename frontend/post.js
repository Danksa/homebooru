import { link } from "./util/search-params.js";

const editLink = document.getElementById("edit-link");
editLink.href = link("/edit-post.html", {}, true);
