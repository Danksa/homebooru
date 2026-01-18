import { componentStyle } from "../util/attach-style.js";
import { CustomElement } from "./custom-element.js";

export class TagSuggestionBox extends CustomElement {
    constructor() {
        super();

        this.tabIndex = 0;

        const shadow = this.attachShadow({ mode: "closed" });
        shadow.appendChild(componentStyle("/components/tag-suggestion-box.css"));

        const suggestions = document.createElement("ul");
        this.suggestions = suggestions;
        shadow.appendChild(suggestions);

        this.registerListener(this, "keydown", this.#onKeyDown);

        this.registerListener(window, "pageshow", this.onPageShow);
    }

    onPageShow(event) {
        if(event.persisted)
            this.connectedCallback();
    }

    focus() {
        super.focus();
        this.suggestions.firstChild?.classList.add("selected");
    }

    showSuggestions(tags) {
        this.clear();

        for(const tag of tags) {
            const suggestion = document.createElement("li");
            suggestion.textContent = tag;
            suggestion.addEventListener("click", () => {
                this.#suggestionSelected(tag);
            });
            this.suggestions.appendChild(suggestion);
        }
    }

    clear() {
        while(this.suggestions.firstChild)
            this.suggestions.firstChild.remove();
    }

    #suggestionSelected(suggestion) {
        this.clear();
        this.dispatchEvent(new CustomEvent("suggestion", { detail: suggestion }));
        this.#leaveFocus();
    }

    #onKeyDown(event) {
        if(event.key === "ArrowUp") {
            event.preventDefault();

            const selected = this.suggestions.querySelector(".selected");
            if(selected == null) {
                this.#leaveFocus();
                return;
            }

            selected.classList.remove("selected");

            const previous = selected.previousElementSibling;
            if(previous == null) {
                this.#leaveFocus();
            } else {
                previous.classList.add("selected");
            }
        } else if (event.key === "ArrowDown") {
            event.preventDefault();

            const selected = this.suggestions.querySelector(".selected");
            if(selected == null) {
                this.#leaveFocus();
                return;
            }

            const next = selected.nextElementSibling;
            if(next != null) {
                selected.classList.remove("selected");
                next.classList.add("selected");
            }
        } else if (event.key === "Enter") {
            event.preventDefault();

            const selected = this.suggestions.querySelector(".selected");
            if(selected != null) {
                this.#suggestionSelected(selected.textContent);
            }
        } else if (event.key === "Escape") {
            this.clear();
            this.#leaveFocus();
        }
    }

    #leaveFocus() {
        this.blur();
        this.dispatchEvent(new CustomEvent("return-focus"));
    }
}

if(window.customElements.get("tag-suggestion-box") == null)
    window.customElements.define("tag-suggestion-box", TagSuggestionBox);
