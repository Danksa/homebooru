import { massTag } from "../state/mass-tag.js";
import { componentStyle } from "../util/attach-style.js";
import { AddTagInput } from "./add-tag-input.js";
import { TagList } from "./tag-list.js";

class MassTagMenu extends HTMLElement {
    #actionButtonListener;
    #cancelButtonListener;
    #massTagListener;
    #addTagListener;
    #removeTagListener;
    #tags;

    constructor() {
        super();
        
        const shadow = this.attachShadow({ mode: "open" });

        const addTagInput = new AddTagInput();
        addTagInput.setAttribute("exportparts", "button, input, text");
        this.addTagInput = addTagInput;
        shadow.appendChild(addTagInput);

        this.#tags = [];

        this.#addTagListener = (event) => {
            const { tag } = event.detail;
            massTag.addTag(tag);
            this.#tags.push(tag);
            tagList.tags = this.#tags.map(tag => ({ name: tag }));
        };

        this.#removeTagListener = (event) => {
            const { name } = event.detail;
            const index = this.#tags.findIndex(tag => name === tag);
            if(index >= 0) {
                this.#tags.splice(index, 1);
                tagList.tags = this.#tags.map(tag => ({ name: tag }));
            }
        };

        const tagList = new TagList();
        tagList.toggleAttribute("show-remove", true);
        tagList.tags = [];
        tagList.setAttribute("exportparts", "button, input, text");
        this.tagList = tagList;
        shadow.appendChild(tagList);

        this.#actionButtonListener = () => {
            if(massTag.active()) {
                massTag.apply();
            } else {
                massTag.toggle(true);
            }
        };

        this.#cancelButtonListener = () => {
            massTag.cancel();
        };

        this.#massTagListener = (event) => {
            const active = event.detail;
            this.#updateActionButton(active);
            cancelButton.disabled = !active;

            if(!active) {
                this.#tags.length = 0;
                tagList.tags = this.#tags;
            }
        };

        const actionButton = document.createElement("button");
        actionButton.part = "button";
        this.actionButton = actionButton;
        this.#updateActionButton(massTag.active());
        
        const cancelButton = document.createElement("button");
        cancelButton.part = "button";
        cancelButton.textContent = "Cancel";
        cancelButton.disabled = !massTag.active();
        this.cancelButton = cancelButton;

        const buttonRow = document.createElement("div");
        buttonRow.classList.add("button-row");
        buttonRow.appendChild(cancelButton);
        buttonRow.appendChild(actionButton);
        shadow.appendChild(buttonRow);

        shadow.appendChild(componentStyle("/components/mass-tag-menu.css"));
    }

    connectedCallback() {
        this.actionButton.addEventListener("click", this.#actionButtonListener);
        this.cancelButton.addEventListener("click", this.#cancelButtonListener);
        this.addTagInput.addEventListener("submit", this.#addTagListener);
        this.tagList.addEventListener("remove", this.#removeTagListener);
        massTag.addEventListener("toggle", this.#massTagListener);
    }

    disconnectedCallback() {
        this.actionButton.removeEventListener("click", this.#actionButtonListener);
        this.cancelButton.removeEventListener("click", this.#cancelButtonListener);
        this.addTagInput.removeEventListener("submit", this.#addTagListener);
        this.tagList.removeEventListener("remove", this.#removeTagListener);
        massTag.removeEventListener("toggle", this.#massTagListener);
    }

    #updateActionButton(massTagActive) {
        this.actionButton.textContent = massTagActive ? "Apply" : "Start tagging";
    }
}

window.customElements.define("mass-tag-menu", MassTagMenu);
