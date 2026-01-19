import { backend } from "./util/backend.js";

const urlParams = new URLSearchParams(window.location.search);
const rawTagId = urlParams.get("id");
const tagId = rawTagId != null ? Number(rawTagId) : null;
if(tagId == null)
    window.location.href = "/404.html";

const idTitle = document.getElementById("id");
idTitle.textContent = `ID ${tagId}`;

const deleteButton = document.getElementById("delete-button");
deleteButton.addEventListener("click", async () => {
    deleteButton.toggleAttribute("disabled", true);

    await backend.delete(`/tags/${tagId}`);

    window.location = "/index.html";
});

const categoryInput = document.getElementById("category");

const tagName = document.getElementById("name");

const fetchTag = async () => {
    const { name, category } = await backend.get(`/tags/${tagId}`);
    tagName.value = name;
    categoryInput.value = category ?? "";
};

const fetchCategories = async () => {
    const categories = await backend.get("/categories");

    const defaultCategory = document.createElement("option");
    defaultCategory.value = "";
    defaultCategory.textContent = "Default";
    categoryInput.appendChild(defaultCategory);

    for(const { id, name } of categories) {
        const option = document.createElement("option");
        option.value = id;
        option.textContent = name;
        categoryInput.appendChild(option);
    }

    await fetchTag();
};
fetchCategories();
