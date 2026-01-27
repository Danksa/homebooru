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

const tagList = document.getElementById("tags");
posts.addEventListener("tags", (event) => {
    tagList.tags = event.detail;
});


const startSlideshow = document.getElementById("start-slideshow");
startSlideshow.addEventListener("click", () => {
    navigate("/slideshow", {}, true);
}, { once: true });
