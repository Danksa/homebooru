import { componentStyle } from "../util/attach-style.js";
import { debounced } from "../util/debounce.js";
import { fetchSuggestions } from "../util/suggestions.js";
import { create } from "../util/template.js";
import { CustomElement } from "./custom-element.js";
import "./tag-suggestion-box.js";

export class AddTagInput extends CustomElement {
    constructor() {
        super();

        const shadow = this.attachShadow({ mode: "closed" });
        shadow.appendChild(componentStyle("/components/add-tag-input.css"));

        const template = create(`
            <div class="row">
                <input id="nameInput" type="text" placeholder="Enter tag name" part="input text" />
                <button id="addButton" type="button" part="button">+</button>
                <tag-suggestion-box id="suggestions"></tag-suggestion-box>
            </div>
        `);
        shadow.append(...template.elements);

        const { nameInput, addButton, suggestions } = template.namedElements;
        
        this.registerListener(nameInput, "keydown", this.onKeyDown);
        this.registerListener(nameInput, "keyup", this.onKeyUp);
        this.nameInput = nameInput;

        this.registerListener(addButton, "click", this.onAddClicked);

        this.registerListener(suggestions, "suggestion", this.onSuggestionSelected);
        this.registerListener(suggestions, "return-focus", this.onReturnFocus);
        this.suggestions = suggestions;

        this.debouncedRequest = debounced(this.requestSuggestions.bind(this), 500);
    }

    onInput(tag) {
        if(tag.length === 0)
            return;

        this.dispatchEvent(new CustomEvent("submit", { detail: { tag } }));

        this.suggestions.clear();
        this.nameInput.value = "";
    }

    onKeyDown(event) {
        if(event.key === "Enter") {
            this.onInput(this.nameInput.value);
        } else if(event.key === "ArrowDown") {
            event.preventDefault();
            this.suggestions.focus();
        } else if(event.key === "Escape") {
            this.suggestions.clear();
        }
    }

    onKeyUp(event) {
        const ignoredKeys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Enter", "Shift", "Control", "Alt", "Escape"];
        if(!ignoredKeys.includes(event.key)) {
            this.debouncedRequest(this.nameInput.value);
        }
    }

    onSuggestionSelected(event) {
        this.nameInput.value = event.detail;
    }

    onReturnFocus() {
        this.nameInput.focus();
    }

    onAddClicked() {
        this.onInput(this.nameInput.value);
    }

    async requestSuggestions(text) {
        const tags = await fetchSuggestions(text);
        this.suggestions.showSuggestions(tags);
    }
}

if(window.customElements.get("add-tag-input") == null)
    window.customElements.define("add-tag-input", AddTagInput);
