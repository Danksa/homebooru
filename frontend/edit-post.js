import { backend } from "./util/backend.js";
import { link, navigate, urlId } from "./util/search-params.js";

const postId = urlId();
if(postId == null)
    navigate("/404.html");

const editLink = document.getElementById("edit-link");
editLink.href = link("/post.html", {}, true);

const addTagInput = document.getElementById("add-tag");
addTagInput.addEventListener("submit", async (event) => {
    const { tag } = event.detail;

    try {
        await backend.post(`/posts/${postId}/tags`, { name: tag });
        window.location.reload();
    } catch (error) {
        console.log(error);
    }
});

const tags = document.getElementById("tags");
tags.addEventListener("remove", async (event) => {
    const { id } = event.detail;
    try {
        await backend.delete(`/posts/${postId}/tags/${id}`);
        window.location.reload();
    } catch (error) {
        console.log(error);
    }
});

const deleteButton = document.getElementById("delete-button");
deleteButton.addEventListener("click", async () => {
    try {
        await backend.delete(`/posts/${postId}`);
        navigate("/posts.html");
    } catch (error) {
        console.log(error);
    }
}, { once: true });
