import { massTag } from "./state/mass-tag.js";

const posts = document.getElementById("posts");

massTag.addEventListener("toggle", (event) => {
    const active = event.detail;
    posts.toggleAttribute("show-selection", active);
});

posts.toggleAttribute("show-selection", massTag.active());


const masstagMenu = document.getElementById("masstag-menu");
const masstagToggle = document.getElementById("masstag-toggle");
masstagToggle.addEventListener("click", () => masstagMenu.classList.toggle("shown"));
