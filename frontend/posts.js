import { massTag } from "./state/mass-tag.js";
import { navigate } from "./util/search-params.js";

const posts = document.getElementById("posts");

massTag.addEventListener("toggle", (event) => {
    const active = event.detail;
    posts.toggleAttribute("show-selection", active);
});

posts.toggleAttribute("show-selection", massTag.active());


const sidemenu = document.getElementById("sidemenu");
const menuToggle = document.getElementById("menu-toggle");
menuToggle.addEventListener("click", () => sidemenu.classList.toggle("shown"));

const tagList = document.getElementById("tags");
posts.addEventListener("tags", (event) => {
    tagList.tags = event.detail;
});


const startSlideshowButtons = document.querySelectorAll(".start-slideshow");
for(const button of startSlideshowButtons) {
    button.addEventListener("click", () => {
        navigate("/slideshow.html", {}, true);
    });
}
