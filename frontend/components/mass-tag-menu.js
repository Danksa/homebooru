import { massTag } from "../state/mass-tag.js";
import { componentStyle } from "../util/attach-style.js";
import { create } from "../util/template.js";
import "./add-tag-input.js";
import "./tag-list.js";

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
        shadow.appendChild(componentStyle("/components/mass-tag-menu.css"));

        const template = create(`
            <add-tag-input id="addTagInput" exportparts="button, input, text"></add-tag-input>
            <tag-list id="tagList" show-remove exportparts="button, input, text"></tag-list>
            <div class="button-row">
                <button id="cancelButton" part="button">Cancel</button>
                <button id="actionButton" part="button"></button>
            </div>
        `);
        shadow.append(...template.elements);

        const { addTagInput, tagList, actionButton, cancelButton } = template.namedElements;

        this.addTagInput = addTagInput;

        tagList.tags = [];
        this.tagList = tagList;

        this.actionButton = actionButton;
        this.#updateActionButton(massTag.active());
        
        cancelButton.disabled = !massTag.active();
        this.cancelButton = cancelButton;

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
