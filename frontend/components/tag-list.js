import { componentStyle } from "../util/attach-style.js";
import { create } from "../util/template.js";

export class TagList extends HTMLElement {
    constructor() {
        super();

        const shadow = this.attachShadow({ mode: "closed" });
        shadow.appendChild(componentStyle("/components/tag-list.css"));

        const template = create(`
            <ul id="list"></ul>
        `);
        shadow.append(...template.elements);

        const { list } = template.namedElements;
        this.list = list;        
    }

    set tags(tags) {
        this.#clear();

        if(tags == null || tags.length === 0) {
            const placeholder = document.createElement("li");
            placeholder.textContent = "No tags assigned";
            this.list.appendChild(placeholder);
            return;
        }

        const showEdit = this.hasAttribute("show-edit");
        const showRemove = this.hasAttribute("show-remove");

        for(const tag of tags) {
            const template = create(`
                <li>
                    <a href="/posts.html?query=${tag.name}" style="color: ${tag.color}">${tag.name}</a>
                    ${showEdit ? `<a class="edit" href="/tag.html?id=${tag.id.toFixed(0)}">✏️</a>` : ""}
                    ${showRemove ? `<button id="removeButton" part="button negative">Remove</button>` : ""}
                </li>
            `);
            this.list.append(...template.elements);

            if(showRemove) {
                const { removeButton } = template.namedElements;
                removeButton.addEventListener("click", () => {
                    this.dispatchEvent(new CustomEvent("remove", { detail: tag }));
                });
            }
        }
    }

    #clear() {
        while(this.list.firstChild)
            this.list.firstChild.remove();
    }
}

if(window.customElements.get("tag-list") == null) {
    window.customElements.define("tag-list", TagList);
}
