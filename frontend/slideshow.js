import { backend } from "./util/backend.js";
import { link, navigate, ParamNames } from "./util/search-params.js";

const close = document.getElementById("close");
close.addEventListener("click", () => {
    navigate("/posts", {}, true);
});

const embed = document.getElementById("embed");

const countPerPage = 10;
const millisPerPost = 5000;

let start = 0;
let currentPage = null;
let indexOnPage = 0;

const loadNextPost = async () => {
    if(indexOnPage >= currentPage.posts.length) {
        void loadNextPage();
        return;
    }

    const post = currentPage.posts[indexOnPage];
    if(post.type === "video") {
        embed.addEventListener("ended", () => {
            loadNextPost();
        }, { once: true });
    } else {
        setTimeout(loadNextPost, millisPerPost);
    }

    embed.setAttribute("post-id", post.id);

    indexOnPage += 1;
};

const loadNextPage = async () => {
    if (currentPage != null && start >= currentPage.total) {
        start = 0;
    }

    const response = await backend.get(link("/posts", { [ParamNames.start]: start, [ParamNames.count]: countPerPage }, true));
    currentPage = response;
    indexOnPage = 0;
    start += response.posts.length;

    if(response.posts.length > 0)
        void loadNextPost();
};

loadNextPage();
