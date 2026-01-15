import { componentStyle } from "../util/attach-style.js";
import { TagSuggestionBox } from "./tag-suggestion-box.js";
import { debounced } from "../util/debounce.js";
import { fetchSuggestions } from "../util/suggestions.js";
import { create } from "../util/template.js";

export class AddTagInput extends HTMLElement {
    #inputKeyListener;
    #suggestionsFocusListener;
    #suggestionListener;
    
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

        nameInput.addEventListener("keydown", (event) => {
            if(event.key === "Enter")
                this.onInput(nameInput.value);
        });
        this.nameInput = nameInput;

        this.#inputKeyListener = (event) => {
            if(event.key === "Enter") {
                this.onInput(nameInput.value);
            } else if(event.key === "ArrowDown") {
                event.preventDefault();
                suggestions.focus();
            } else if(event.key === "Escape") {
                suggestions.clear();
            }
        };

        const debouncedRequest = debounced(this.requestSuggestions.bind(this), 500);
        const ignoredKeys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Enter", "Shift", "Control", "Alt", "Escape"];
        nameInput.addEventListener("keyup", (event) => {
            if(!ignoredKeys.includes(event.key)) {
                debouncedRequest(nameInput.value);
            }
        });

        addButton.addEventListener("click", () => {
            this.onInput(nameInput.value);
        });

        this.suggestions = suggestions;

        this.#suggestionsFocusListener = () => {
            nameInput.focus();
        };
        this.#suggestionListener = (event) => {
            nameInput.value = event.detail;
        };
    }

    connectedCallback() {
        this.suggestions.addEventListener("suggestion", this.#suggestionListener);
        this.suggestions.addEventListener("return-focus", this.#suggestionsFocusListener);
        this.nameInput.addEventListener("keydown", this.#inputKeyListener);
    }

    disconnectedCallback() {
        this.suggestions.removeEventListener("suggestion", this.#suggestionListener);
        this.suggestions.removeEventListener("return-focus", this.#suggestionsFocusListener);
        this.nameInput.removeEventListener("keydown", this.#inputKeyListener);
    }

    onInput(tag) {
        if(tag.length === 0)
            return;

        this.dispatchEvent(new CustomEvent("submit", { detail: { tag } }));

        this.suggestions.clear();
        this.nameInput.value = "";
    }

    async requestSuggestions(text) {
        const tags = await fetchSuggestions(text);
        this.suggestions.showSuggestions(tags);
    }
}

if(window.customElements.get("add-tag-input") == null)
    window.customElements.define("add-tag-input", AddTagInput);
