import { tagSuggestionDebounceMillis } from "../config.js";
import { componentStyle } from "../util/attach-style.js";
import { debounced } from "../util/debounce.js";
import { fetchSuggestions } from "../util/suggestions.js";
import { create } from "../util/template.js";
import { CustomElement } from "./custom-element.js";
import "./tag-suggestion-box.js";

class SearchInput extends CustomElement {
    constructor() {
        super();

        const urlParams = new URLSearchParams(window.location.search);
        const query = urlParams.get("query") ?? "";
        this.query = query;

        const shadow = this.attachShadow({ mode: "closed" });
        shadow.appendChild(componentStyle("/components/search-input.css"));

        const template = create(`
                <div class="container" style="visibility: hidden">
                    <input id="input" type="text" part="input text" placeholder="Filter by tags" autocomplete="off" />
                    <tag-suggestion-box id="suggestions"></tag-suggestion-box>
                    <button id="searchButton" type="button" part="button">Search</button>
                </div>
        `);
        shadow.append(...template.elements);

        const { input, searchButton, suggestions } = template.namedElements;

        this.registerListener(suggestions, "suggestion", this.onSuggestionSelected);
        this.registerListener(suggestions, "return-focus", this.onReturnFocus);
        this.suggestions = suggestions;

        this.registerListener(input, "keydown", this.onKeyDown);
        this.registerListener(input, "keyup", this.onKeyUp);
        input.value = query;
        this.input = input;

        this.registerListener(searchButton, "click", this.onSearchClicked, { once: true });

        this.registerListener(window, "pageshow", this.onPageShow);

        this.debouncedRequest = debounced(this.requestSuggestions.bind(this), tagSuggestionDebounceMillis);
    }

    onPageShow(event) {
        if(event.persisted) {
            this.input.value = this.query;
            this.connectedCallback();
        }
    }

    onSearchClicked() {
        this.search(this.input.value);
    }

    onSuggestionSelected(event) {
        this.insertSuggestion(event.detail);
    }

    onReturnFocus() {
        this.input.focus();
    }

    onKeyDown(event) {
        if(event.key === "Enter") {
            this.search(this.input.value);
            this.input.disabled = true;
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
            const words = this.input.value.split(" ");
            this.debouncedRequest(words[words.length - 1]);
        }
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
        const excluded = words[words.length - 1].startsWith("-");
        this.input.value = `${previousWords.join(" ")}${previousWords.length > 0 ? " " : ""}${excluded ? "-" : ""}${suggestion}`;
    }
}

window.customElements.define("search-input", SearchInput);
