import { backendUrl } from "./config.js";

const urlParams = new URLSearchParams(window.location.search);
const postId = Number(urlParams.get("id") ?? undefined);
if(!Number.isInteger(postId))
    throw new Error("Post ID not specified");

const editLink = document.getElementById("edit-link");
editLink.href = `/post.html${window.location.search}`;

const addTagInput = document.getElementById("add-tag");
addTagInput.addEventListener("submit", async (event) => {
    const { tag } = event.detail;

    try {
        await fetch(`${backendUrl}/posts/${postId}/tags`, { method: "post", body: JSON.stringify({ name: tag }), headers: { "Content-Type": "application/json" } });
        window.location.reload();
    } catch (error) {
        console.log(error);
    }
});

const tags = document.getElementById("tags");
tags.addEventListener("remove", async (event) => {
    const { id } = event.detail;
    try {
        await fetch(`${backendUrl}/posts/${postId}/tags/${id}`, { method: "delete" });
        window.location.reload();
    } catch (error) {
        console.log(error);
    }
});

const deleteButton = document.getElementById("delete-button");
deleteButton.addEventListener("click", async () => {
    try {
        await fetch(`${backendUrl}/posts/${postId}`, { method: "delete" });
        window.location = "/posts.html";
    } catch (error) {
        console.log(error);
    }
}, { once: true });
