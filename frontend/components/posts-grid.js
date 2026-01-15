import { backendUrl, postsPerPage, thumbnailBasePath } from "../config.js";
import { postSelection } from "../state/post-selection.js";
import { componentStyle } from "../util/attach-style.js";

class PostsGrid extends HTMLElement {
    static observedAttributes = ["show-selection"];

    constructor() {
        super();

        const shadow = this.attachShadow({ mode: "closed" });

        const grid = document.createElement("div");
        grid.classList.add("grid");
        shadow.appendChild(grid);
        this.grid = grid;

        shadow.appendChild(componentStyle("/components/posts-grid.css"));

        const fetchPosts = async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const start = Number(urlParams.get("start") ?? "0");
            const query = urlParams.get("query");

            const queryString = query != null ? `&query=${query}` : "";
            const result = await fetch(`${backendUrl}/posts?from=${start}&count=${postsPerPage.toFixed(0)}${queryString}`);
            const body = await result.json();
            this.populate(body.posts);

            this.pagination = {
                start,
                total: body.total,
                step: postsPerPage
            };
            this.dispatchEvent(new CustomEvent("pagination", { detail: this.pagination }));
        };
        fetchPosts();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if(name === "show-selection") {

        }
    }

    populate(posts) {
        for(const post of posts) {
            const element = document.createElement("posts-grid-post");
            element.setAttribute("postId", post.id);
            element.setAttribute("thumbnailUrl", post.thumbnail);
            element.setAttribute("type", post.type);
            element.setAttribute("exportparts", "button");
            this.grid.appendChild(element);
        }
    }
}

window.customElements.define("posts-grid", PostsGrid);

class Post extends HTMLElement {
    constructor() {
        super();

        const shadow = this.attachShadow({ mode: "closed" });

        const thumbnail = document.createElement("img");
        this.thumbnail = thumbnail;

        const link = document.createElement("a");
        link.appendChild(thumbnail);
        this.link = link;

        shadow.appendChild(link);

        const selectButton = document.createElement("button");
        selectButton.classList.add("select");
        selectButton.part = "button select";
        selectButton.textContent = "+";
        this.selectButton = selectButton;
        shadow.appendChild(selectButton);

        const style = document.createElement("link");
        style.rel = "stylesheet";
        style.href = "/components/posts-grid-post.css";
        shadow.appendChild(style);
    }

    connectedCallback() {
        const id = this.getAttribute("postId");
        const thumbnailUrl = this.getAttribute("thumbnailUrl");
        const type = this.getAttribute("type");

        this.link.classList.add(type);

        this.thumbnail.src = `${thumbnailBasePath}/${thumbnailUrl}`;
        this.thumbnail.alt = `Thumbnail for post ${id}`;

        this.link.href = `/post.html?id=${id}`;

        const numberId = Number(id);
        const selected = postSelection.includes(numberId);
        this.selectButton.textContent = selected ? "-" : "+";
        this.classList.toggle("selected", selected);

        this.selectButton.addEventListener("click", () => {
            const selected = postSelection.includes(numberId);
            postSelection.toggleSelection(numberId, !selected);
        });

        postSelection.addEventListener("selection-toggle", (event) => {
            const { id, selected } = event.detail;
            if(id === numberId) {
                this.selectButton.textContent = selected ? "-" : "+";
                this.classList.toggle("selected", selected);
            }
        });
    }
}

window.customElements.define("posts-grid-post", Post);
