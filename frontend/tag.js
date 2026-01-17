import { backend } from "./util/backend.js";

const urlParams = new URLSearchParams(window.location.search);
const rawTagId = urlParams.get("id");
const tagId = rawTagId != null ? Number(rawTagId) : null;
if(tagId == null)
    window.location.href = "/404.html";

const idTitle = document.getElementById("id");
idTitle.textContent = `ID ${tagId}`;

const tagName = document.getElementById("name");

const fetchTag = async () => {
    const body = await backend.get(`/tags/${tagId}`);
    tagName.textContent = body.name;
};

fetchTag();

const deleteButton = document.getElementById("delete-button");
deleteButton.addEventListener("click", async () => {
    deleteButton.toggleAttribute("disabled", true);

    await backend.delete(`/tags/${tagId}`);

    window.location = "/index.html";
});

