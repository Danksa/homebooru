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

        tags.sort((a, b) => {
            if(a.category == null || b.category == null)
                return 0;

            return a.category.localeCompare(b.category);
        });

        let lastCategory = undefined;

        for(const tag of tags) {
            const color = tag.color != null ? tag.color : null;

            const category = tag.category;
            if(category !== lastCategory) {
                const header = document.createElement("li");
                header.textContent = category;
                header.classList.add("category");
                if(color != null)
                    header.style.color = color;
                this.list.appendChild(header);
                
                lastCategory = category;
            }

            const template = create(`
                <li${color != null ? ` style="color: ${color}"` : ""}>
                    <a class="name" href="/posts.html?query=${tag.name}">${tag.name}</a>
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
