import { componentStyle } from "../util/attach-style.js";
import { create } from "../util/template.js";

class MainNav extends HTMLElement {
    static Pages = [
        ["Posts", "/posts.html"],
        ["Tags", "/tags.html"],
        ["Upload", "/upload.html"]
    ];

    constructor() {
        super();

        const shadow = this.attachShadow({ mode: "closed" });
        shadow.appendChild(componentStyle("/components/main-nav.css"));

        const currentUrl = window.location.pathname;
        const template = create(`
            <a href="/index.html">
                <div class="logo"></div>
            </a>
            <ul style="visibility: hidden">
                ${MainNav.Pages.map(([title, url]) => `
                    <li class="${currentUrl === url ? "current" : ""}">
                        <a href="${url}">${title}</a>
                    </li>
                `).join("")}
            </ul>
        `);
        shadow.append(...template.elements);
    }
}

window.customElements.define("main-nav", MainNav);
