import { backend } from "./util/backend.js";

const categoryInput = document.getElementById("category");
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
};
fetchCategories();

const form = document.getElementById("form");
form.addEventListener("submit", async event => {
    event.preventDefault();
    
    const data = new FormData(form);
    const category = data.get("category");

    try {
        await backend.post("/tags", {
            name: data.get("name"),
            category: category === "" ? null : parseInt(category)
        });
        window.location = "/tags.html";
    } catch(error) {
        console.log(error);
    }
});
