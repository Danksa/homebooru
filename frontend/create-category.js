import { backend } from "./util/backend.js";
import { navigate } from "./util/search-params.js";

const form = document.getElementById("form");
form.addEventListener("submit", async event => {
    event.preventDefault();
    
    const data = new FormData(form);
    
    try {
        await backend.post("/categories", {
            name: data.get("name"),
            color: data.get("color")
        });
        navigate("/tags.html");
    } catch(error) {
        console.log(error);
    }
});
