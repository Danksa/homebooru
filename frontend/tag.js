import { backend } from "./util/backend.js";
import { navigate, urlId } from "./util/search-params.js";

const tagId = urlId();
if(tagId == null)
    navigate("/404.html");

const idTitle = document.getElementById("id");
idTitle.textContent = `ID ${tagId}`;

const deleteButton = document.getElementById("delete-button");
deleteButton.addEventListener("click", async () => {
    deleteButton.toggleAttribute("disabled", true);

    await backend.delete(`/tags/${tagId}`);

    navigate("/tags.html");
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

const form = document.getElementById("form");
form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const data = new FormData(form);
    const category = data.get("category");

    await backend.patch(`/tags/${tagId}`, {
        name: data.get("name"),
        category: category === "" ? null : parseInt(category)
    });
});
