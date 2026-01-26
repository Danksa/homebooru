import { postBasePath } from "../config.js";
import { componentStyle } from "../util/attach-style.js";
import { backend } from "../util/backend.js";
import { navigate, urlId } from "../util/search-params.js";
import { create } from "../util/template.js";
import { CustomElement } from "./custom-element.js";
import { TagList } from "./tag-list.js";

class PostEmbed extends CustomElement {
    constructor() {
        super();

        const shadow = this.attachShadow({ mode: "closed" });
        shadow.appendChild(componentStyle("/components/post-embed.css"));

        const template = create(`
            <div id="container" class="container">
                <nav id="post-nav">
                    <button id="previousButton" type="button" part="button" disabled>&lt;</button>
                    <button id="nextButton" type="button" part="button" disabled>&gt;</button>
                </nav>
            </div>
        `);
        shadow.append(...template.elements);

        const { container, previousButton, nextButton } = template.namedElements;

        this.container = container;
        this.previousButton = previousButton;
        this.nextButton = nextButton;
    }

    connectedCallback() {
        super.connectedCallback();

        const postId = urlId();
        if(postId == null)
            return;

        this.displayPost(postId);

        const tagListId = this.getAttribute("tag-list");
        const tagList = document.getElementById(tagListId);
        if(tagList != null) {
            this.displayTags(postId, tagList);
        }

        this.initializeNavigation(postId);
    }

    async displayPost(id) {
        try {
            const body = await backend.get(`/posts/${id}`);
            const url = `${postBasePath}/${body.url}`;

            const postContainer = this.createPostContainer(body.type, url, id);
            postContainer.addEventListener("click", () => this.container.classList.toggle("full"));
            this.container.appendChild(postContainer);
        } catch (error) {
            console.error("Could not fetch post", error);

            const message = document.createElement("span");
            message.textContent = "Could not fetch post :(";

            this.container.appendChild(message);
        }
    }

    createPostContainer(type, url, id) {
        switch(type) {
            case "image":
            case "animation":
                const img = document.createElement("img");
                img.src = url;
                img.alt = `Post ${id.toFixed(0)}`;
                return img;
            case "video":
                const video = document.createElement("video");
                video.src = url;
                video.autoplay = false;
                video.loop = true;
                video.controls = true;
                return video;
            default:
                throw new Error(`Unsupported post type: ${type}`);
        }
    }

    async displayTags(id, tagList) {
        if(!(tagList instanceof TagList))
            return;
        
        try {
            tagList.tags = await backend.get(`/posts/${id}/tags`);
        } catch {
            tagList.tags = null;
        }
    }

    async initializeNavigation(postId) {
        const { previous, next } = await backend.get(`/posts/${postId.toFixed(0)}/adjacent${window.location.search}`);
        if(next != null) {
            this.nextButton.addEventListener("click", () => navigate("/post.html", { id: next.toFixed(0) }, true));
            this.nextButton.disabled = false;
        }

        if(previous != null) {
            this.previousButton.addEventListener("click", () => navigate("/post.html", { id: previous.toFixed(0) }, true));
            this.previousButton.disabled = false;
        }
    }
}

window.customElements.define("post-embed", PostEmbed);
