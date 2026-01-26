import { postsPerPage } from "../config.js";
import { componentStyle } from "../util/attach-style.js";
import { backend } from "../util/backend.js";
import { ParamNames, urlQuery, urlStart } from "../util/search-params.js";
import { create } from "../util/template.js";
import "./posts-grid-post.js";

class PostsGrid extends HTMLElement {
    constructor() {
        super();

        const shadow = this.attachShadow({ mode: "closed" });
        shadow.appendChild(componentStyle("/components/posts-grid.css"));

        const template = create(`
            <div id="grid" class="grid"></div>
        `);
        shadow.append(...template.elements);

        const { grid } = template.namedElements;
        this.grid = grid;

        this.fetchPosts();
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

    async fetchPosts() {
        const start = urlStart();
        const query = urlQuery();

        const queryString = query != null ? `&${ParamNames.query}=${query}` : "";
        const body = await backend.get(`/posts?${ParamNames.start}=${start}&${ParamNames.count}=${postsPerPage.toFixed(0)}${queryString}`);
        this.populate(body.posts);

        this.pagination = {
            start,
            total: body.total,
            step: postsPerPage
        };
        this.dispatchEvent(new CustomEvent("pagination", { detail: this.pagination }));

        this.dispatchEvent(new CustomEvent("tags", { detail: body.tags }));
    }
}

window.customElements.define("posts-grid", PostsGrid);
