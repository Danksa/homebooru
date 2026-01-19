import { backend } from "./util/backend.js";

const urlParams = new URLSearchParams(window.location.search);
const rawId = urlParams.get("id");
const id = rawId != null ? Number(rawId) : null;
if(id == null)
    window.location.href = "/404.html";

const idTitle = document.getElementById("id");
idTitle.textContent = id.toFixed(0);

const nameInput = document.getElementById("name");
const colorInput = document.getElementById("color");

const fetchCategory = async () => {
    const data = await backend.get(`/categories/${id.toFixed(0)}`);
    nameInput.value = data.name;
    colorInput.value = data.color;
};
fetchCategory();

const form = document.getElementById("form");
form.addEventListener("submit", async event => {
    event.preventDefault();
    
    const data = new FormData(form);
    
    try {
        await backend.patch(`/categories/${id.toFixed(0)}`, {
            name: data.get("name"),
            color: data.get("color")
        });
    } catch(error) {
        console.log(error);
    }
});

const deleteButton = document.getElementById("delete-button");
deleteButton.addEventListener("click", async () => {
    deleteButton.disabled = true;

    await backend.delete(`/categories/${id.toFixed(0)}`);

    window.location = "/tags.html";
});
