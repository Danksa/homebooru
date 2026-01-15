import { componentStyle } from "../util/attach-style.js";
import { debounced } from "../util/debounce.js";
import { TagSuggestionBox } from "./tag-suggestion-box.js";
import { fetchSuggestions } from "../util/suggestions.js";

class SearchInput extends HTMLElement {
    #inputKeyListener;
    #suggestionsFocusListener;
    #suggestionListener;

    constructor() {
        super();

        const shadow = this.attachShadow({ mode: "closed" });

        const suggestions = new TagSuggestionBox();
        this.suggestions = suggestions;

        this.#suggestionsFocusListener = () => {
            input.focus();
        };
        this.#suggestionListener = (event) => {
            this.insertSuggestion(event.detail);
        };

        const input = document.createElement("input");
        input.type = "text";
        input.part = "input text";
        input.placeholder = "Filter by tags";
        input.autocomplete = "off";

        this.#inputKeyListener = (event) => {
            if(event.key === "Enter") {
                this.search(input.value);
                input.removeEventListener("keydown", this.#inputKeyListener);
            } else if(event.key === "ArrowDown") {
                event.preventDefault();
                suggestions.focus();
            } else if(event.key === "Escape") {
                suggestions.clear();
            }
        };
        this.input = input;

        const debouncedRequest = debounced(this.requestSuggestions.bind(this), 500);

        const ignoredKeys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Enter", "Shift", "Control", "Alt", "Escape"];
        input.addEventListener("keyup", (event) => {
            if(!ignoredKeys.includes(event.key)) {
                const words = input.value.split(" ");
                debouncedRequest(words[words.length - 1]);
            }
        });

        const searchButton = document.createElement("button");
        searchButton.type = "button";
        searchButton.textContent = "Search";
        searchButton.part = "button";
        searchButton.addEventListener("click", () => {
            this.search(input.value);
        }, { once: true });
        
        const container = document.createElement("div");
        container.style.visibility = "hidden";
        container.classList.add("container");
        container.appendChild(input);
        container.appendChild(suggestions);
        container.appendChild(searchButton);
        container.appendChild(suggestions);
        shadow.appendChild(container);

        shadow.appendChild(componentStyle("/components/search-input.css"));

        const urlParams = new URLSearchParams(window.location.search);
        const query = urlParams.get("query") ?? "";
        input.value = query;
        window.addEventListener("pageshow", (event) => {
            if(event.persisted) {
                input.value = query;
                this.connectedCallback();
            }
        });
    }

    connectedCallback() {
        this.suggestions.addEventListener("suggestion", this.#suggestionListener);
        this.suggestions.addEventListener("return-focus", this.#suggestionsFocusListener);
        this.input.addEventListener("keydown", this.#inputKeyListener);
    }

    disconnectedCallback() {
        this.suggestions.removeEventListener("suggestion", this.#suggestionListener);
        this.suggestions.removeEventListener("return-focus", this.#suggestionsFocusListener);
        this.input.removeEventListener("keydown", this.#inputKeyListener);
    }

    search(text) {
        const target = this.getAttribute("target");
        window.location = `${target != null ? target : ""}?query=${text}`;
    }

    async requestSuggestions(text) {
        const tags = await fetchSuggestions(text);
        this.suggestions.showSuggestions(tags);
    }

    insertSuggestion(suggestion) {
        const words = this.input.value.split(" ");
        const previousWords = words.slice(0, -1);
        this.input.value = `${previousWords.join(" ")}${previousWords.length > 0 ? " " : ""}${suggestion}`;
    }
}

window.customElements.define("search-input", SearchInput);
