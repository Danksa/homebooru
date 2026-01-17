import { thumbnailBasePath } from "../config.js";
import { postSelection } from "../state/post-selection.js";
import { componentStyle } from "../util/attach-style.js";
import { create } from "../util/template.js";

class PostsGridPost extends HTMLElement {
    constructor() {
        super();

        const shadow = this.attachShadow({ mode: "closed" });
        shadow.appendChild(componentStyle("/components/posts-grid-post.css"));

        const template = create(`
            <a id="link">
                <img id="thumbnail" />
            </a>
            <button id="selectButton" class="select" part="button select">+</button>
        `);
        shadow.append(...template.elements);

        const { link, thumbnail, selectButton } = template.namedElements;
        this.thumbnail = thumbnail;
        this.link = link;
        this.selectButton = selectButton;
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

window.customElements.define("posts-grid-post", PostsGridPost);
