import { CustomElement } from "./custom-element.js";
import { componentStyle } from "../util/attach-style.js";
import { create } from "../util/template.js";

export class CategoryList extends CustomElement {
    constructor() {
        super();

        const shadow = this.attachShadow({ mode: "closed" });
        shadow.appendChild(componentStyle("/components/category-list.css"));

        const template = create(`
            <ul id="list"></ul>
        `);
        shadow.append(...template.elements);

        const { list } = template.namedElements;
        this.list = list;
    }

    set categories(categories) {
        this.#clear();

        if(categories == null || categories.length === 0) {
            const placeholder = document.createElement("li");
            placeholder.textContent = "No categories";
            this.list.appendChild(placeholder);
            return;
        }

        const showEdit = this.hasAttribute("show-edit");
        
        for(const category of categories) {
            const template = create(`
                <li style="color: ${category.color}">
                    <span class="name">${category.name}</span>
                    ${showEdit ? `<a class="edit" href="/category.html?id=${category.id.toFixed(0)}">✏️</a>` : ""}
                </li>
            `);
            this.list.append(...template.elements);
        }
    }

    #clear() {
        while(this.list.firstChild)
            this.list.firstChild.remove();
    }
}

window.customElements.define("category-list", CategoryList);
