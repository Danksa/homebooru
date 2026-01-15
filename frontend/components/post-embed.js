import { backendUrl, postBasePath } from "../config.js";
import { componentStyle } from "../util/attach-style.js";
import { TagList } from "./tag-list.js";

class PostEmbed extends HTMLElement {
    constructor() {
        super();

        const shadow = this.attachShadow({ mode: "closed" });

        const container = document.createElement("div");
        container.classList.add("container");
        container.addEventListener("click", () => {
            container.classList.toggle("full");

            if(!container.classList.contains("full")) {
                document.body.style.zoom = "100%";
            }
        });
        this.container = container;

        shadow.appendChild(componentStyle("/components/post-embed.css"));

        shadow.appendChild(container);
    }

    connectedCallback() {
        const urlParams = new URLSearchParams(window.location.search);
        const postId = Number(urlParams.get("id") ?? undefined);
        if(!Number.isInteger(postId))
            return;

        this.displayPost(postId);

        const tagListId = this.getAttribute("tag-list");
        const tagList = document.getElementById(tagListId);
        if(tagList != null) {
            this.displayTags(postId, tagList);
        }
    }

    async displayPost(id) {
        try {
            const response = await fetch(`${backendUrl}/posts/${id}`);
            const body = await response.json();
            const url = `${postBasePath}/${body.url}`;

            switch(body.type) {
                case "image":
                case "animation":
                    const img = document.createElement("img");
                    img.src = url;
                    img.alt = `Post ${id.toFixed(0)}`;
                    this.container.appendChild(img);
                    break;
                case "video":
                    const video = document.createElement("video");
                    video.src = url;
                    video.autoplay = false;
                    video.loop = true;
                    video.controls = true;
                    this.container.appendChild(video);
                    break;
                default:
                    throw new Error(`Unsupported post type: ${body.type}`);
            }
        } catch (error) {
            console.error("Could not fetch post", error);

            const message = document.createElement("span");
            message.textContent = "Could not fetch post :(";

            this.container.appendChild(message);
        }
    }

    async displayTags(id, tagList) {
        if(!(tagList instanceof TagList))
            return;
        
        try {
            const response = await fetch(`${backendUrl}/posts/${id}/tags`);
            const body = await response.json();
            tagList.tags = body;
        } catch {
            tagList.tags = null;
        }
    }
}

window.customElements.define("post-embed", PostEmbed);
