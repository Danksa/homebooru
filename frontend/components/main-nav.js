import { componentStyle } from "../util/attach-style.js";

class MainNav extends HTMLElement {
    static Pages = [
        ["Posts", "/posts.html"],
        ["Tags", "/tags.html"],
        ["Upload", "/upload.html"]
    ];

    constructor() {
        super();

        const shadow = this.attachShadow({ mode: "closed" });

        const logo = document.createElement("div");
        logo.classList.add("logo");

        const logoLink = document.createElement("a");
        logoLink.href = "/index.html";
        logoLink.appendChild(logo);
        shadow.appendChild(logoLink);
        
        const currentUrl = window.location.pathname;
        const list = document.createElement("ul");
        list.style.visibility = "hidden";
        for(const [title, url] of MainNav.Pages) {
            const entry = document.createElement("li");
            if(currentUrl === url)
                entry.classList.add("current");

            const link = document.createElement("a");
            link.href = url;
            link.textContent = title;
            entry.appendChild(link);
            list.appendChild(entry);
        }
        shadow.appendChild(list);

        shadow.appendChild(componentStyle("/components/main-nav.css"));
    }
}

window.customElements.define("main-nav", MainNav);
