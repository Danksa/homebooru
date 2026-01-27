import { postBasePath } from "../config.js";
import { componentStyle } from "../util/attach-style.js";
import { backend } from "../util/backend.js";
import { navigate, urlId } from "../util/search-params.js";
import { create } from "../util/template.js";
import { CustomElement } from "./custom-element.js";
import { TagList } from "./tag-list.js";

class PostEmbed extends CustomElement {
    static observedAttributes = ["post-id"];

    #displayedPostId;

    constructor() {
        super();

        const shadow = this.attachShadow({ mode: "closed" });
        shadow.appendChild(componentStyle("/components/post-embed.css"));

        const template = create(`
            <div id="container" class="container">
                <nav id="postNav">
                    <button id="previousButton" type="button" part="button" disabled>&lt;</button>
                    <button id="nextButton" type="button" part="button" disabled>&gt;</button>
                </nav>
            </div>
        `);
        shadow.append(...template.elements);

        const { container, previousButton, nextButton, postNav } = template.namedElements;

        this.container = container;
        this.previousButton = previousButton;
        this.nextButton = nextButton;
        this.postNav = postNav;

        this.#displayedPostId = -1;
    }

    get postId() {
        return this.parsedPostId(this.getAttribute("post-id"));
    }

    connectedCallback() {
        super.connectedCallback();
        
        if(!this.hasAttribute("show-adjacent"))
            this.postNav.style.display = "none";

        if(this.hasAttribute("autoplay"))
            this.container.classList.add("full");

        const postId = this.postId ?? urlId();
        this.displayPost(postId);
    }

    attributeChangedCallback(name, _, newValue) {
        if(name === "post-id") {
            const postId = this.parsedPostId(newValue);
            this.displayPost(postId);
        }
    }

    parsedPostId(idString) {
        if (idString == null)
            return null;

        const id = Number(idString);
        return Number.isInteger(id) ? id : null;
    }

    displayPost(postId) {
        if(postId == null || postId === this.#displayedPostId)
            return;

        this.#displayedPostId = postId;

        this.loadPost(postId);

        const tagListId = this.getAttribute("tag-list");
        const tagList = document.getElementById(tagListId);
        if(tagList != null) {
            this.displayTags(postId, tagList);
        }

        this.initializeNavigation(postId);
    }

    async loadPost(id) {
        if(this.postContainer != null) {
            this.postContainer.remove();
        }

        try {
            const body = await backend.get(`/posts/${id}`);
            const url = `${postBasePath}/${body.url}`;

            const postContainer = this.createPostContainer(body.type, url, id);
            if(!this.hasAttribute("autoplay"))
                postContainer.addEventListener("click", () => this.container.classList.toggle("full"));

            this.postContainer = postContainer;
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
                video.autoplay = this.hasAttribute("autoplay");
                video.loop = !video.autoplay;
                video.controls = true;
                video.addEventListener("ended", () => {
                    this.dispatchEvent(new CustomEvent("ended"));
                }, { once: true });
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
        if(!this.hasAttribute("show-adjacent"))
            return;

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
