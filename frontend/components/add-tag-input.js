import { componentStyle } from "../util/attach-style.js";
import { TagSuggestionBox } from "./tag-suggestion-box.js";
import { debounced } from "../util/debounce.js";
import { fetchSuggestions } from "../util/suggestions.js";

export class AddTagInput extends HTMLElement {
    #inputKeyListener;
    #suggestionsFocusListener;
    #suggestionListener;
    
    constructor() {
        super();

        const shadow = this.attachShadow({ mode: "closed" });

        const row = document.createElement("div");
        row.classList.add("row");

        const nameInput = document.createElement("input");
        nameInput.type = "text";
        nameInput.placeholder = "Enter tag name";
        nameInput.part = "input text";
        nameInput.addEventListener("keydown", (event) => {
            if(event.key === "Enter")
                this.onInput(nameInput.value);
        });
        this.nameInput = nameInput;
        row.appendChild(nameInput);

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

        const addButton = document.createElement("button");
        addButton.type = "button";
        addButton.textContent = "+";
        addButton.part = "button";
        addButton.addEventListener("click", () => {
            this.onInput(nameInput.value);
        });
        row.appendChild(addButton);

        const suggestions = new TagSuggestionBox();
        this.suggestions = suggestions;
        row.appendChild(suggestions);

        this.#suggestionsFocusListener = () => {
            nameInput.focus();
        };
        this.#suggestionListener = (event) => {
            nameInput.value = event.detail;
        };

        shadow.appendChild(row);

        shadow.appendChild(componentStyle("/components/add-tag-input.css"));
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
