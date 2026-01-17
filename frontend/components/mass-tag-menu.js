import { massTag } from "../state/mass-tag.js";
import { componentStyle } from "../util/attach-style.js";
import { create } from "../util/template.js";
import { CustomElement } from "./custom-element.js";
import "./add-tag-input.js";
import "./tag-list.js";

class MassTagMenu extends CustomElement {
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

        this.registerListener(addTagInput, "submit", this.onTagAdded);
        this.addTagInput = addTagInput;

        tagList.tags = [];
        this.registerListener(tagList, "remove", this.onTagRemoved);
        this.tagList = tagList;

        this.registerListener(actionButton, "click", this.onActionButtonClicked);
        this.actionButton = actionButton;
        this.#updateActionButton(massTag.active());
        
        cancelButton.disabled = !massTag.active();
        this.registerListener(cancelButton, "click", this.onCancelButtonClicked);
        this.cancelButton = cancelButton;

        this.registerListener(massTag, "toggle", this.onMassTagToggle);

        this.#tags = [];
    }

    #updateActionButton(massTagActive) {
        this.actionButton.textContent = massTagActive ? "Apply" : "Start tagging";
    }

    onTagAdded(event) {
        const { tag } = event.detail;
        massTag.addTag(tag);
        this.#tags.push(tag);
        this.tagList.tags = this.#tags.map(tag => ({ name: tag }));
    }

    onTagRemoved(event) {
        const { name } = event.detail;
        const index = this.#tags.findIndex(tag => name === tag);
        if(index >= 0) {
            this.#tags.splice(index, 1);
            this.tagList.tags = this.#tags.map(tag => ({ name: tag }));
        }
    }

    onActionButtonClicked() {
        if(massTag.active()) {
            massTag.apply();
        } else {
            massTag.toggle(true);
        }
    }
    
    onCancelButtonClicked() {
        massTag.cancel();
    }

    onMassTagToggle(event) {
        const active = event.detail;
        this.#updateActionButton(active);
        this.cancelButton.disabled = !active;

        if(!active) {
            this.#tags.length = 0;
            this.tagList.tags = this.#tags;
        }
    }
}

window.customElements.define("mass-tag-menu", MassTagMenu);
