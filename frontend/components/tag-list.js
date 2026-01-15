import { componentStyle } from "../util/attach-style.js";

export class TagList extends HTMLElement {
    constructor() {
        super();

        const shadow = this.attachShadow({ mode: "closed" });

        const list = document.createElement("ul");
        this.list = list;
        shadow.appendChild(list);

        shadow.appendChild(componentStyle("/components/tag-list.css"));
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
            const element = document.createElement("li");

            const link = document.createElement("a");
            link.href = `/posts.html?query=${tag.name}`;
            link.textContent = tag.name;
            element.appendChild(link);

            if(showEdit) {
                const editLink = document.createElement("a");
                editLink.classList.add("edit");
                editLink.href = `/tag.html?id=${tag.id.toFixed(0)}`;
                editLink.textContent = "✏️";
                element.appendChild(editLink);
            }

            if(showRemove) {
                const removeButton = document.createElement("button");
                removeButton.part = "button negative";
                removeButton.textContent = "Remove";
                removeButton.addEventListener("click", () => {
                    this.dispatchEvent(new CustomEvent("remove", { detail: tag }));
                });
                element.appendChild(removeButton);
            }

            this.list.appendChild(element);
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
