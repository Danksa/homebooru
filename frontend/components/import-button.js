import { componentStyle } from "../util/attach-style.js";
import { backend } from "../util/backend.js";
import { create } from "../util/template.js";
import { CustomElement } from "./custom-element.js";
import { backendUrl } from "../config.js";

class ImportButton extends CustomElement {
    #ws;

    constructor() {
        super();

        const shadow = this.attachShadow({ mode: "closed" });
        shadow.appendChild(componentStyle("/components/import-button.css"));

        const template = create(`
            <div id="progress">
                <div class="bar">
                    <span id="count">4 / 8</span>
                </div>
            </div>
            <div id="details">
                <span>Current file:</span>
                <code id="current">blabla/blabelin</code>
            </div>
            <button id="button" part="button" disabled>Process imports</button>
        `);
        shadow.append(...template.elements);

        const { button, progress, count, current, details } = template.namedElements;

        this.registerListener(button, "click", this.onImportClicked);
        this.button = button;

        this.progress = progress;
        this.count = count;
        this.current = current;
        this.details = details;

        this.totalCount = "";

        this.#ws = new WebSocket(`${backendUrl}/posts/import-status`);
        this.registerListener(this.#ws, "message", this.onWsMessage);
    }

    onWsMessage(event) {
        const [type, value] = event.data.split(":");
        switch(type) {
            case "start":
                this.button.toggleAttribute("disabled", true);
                this.totalCount = value;

                this.count.textContent = `${0} / ${value}`;
                this.current.textContent = "-";
                this.progress.style.setProperty("--progress", "0%");
                this.progress.classList.add("visible");
                this.details.classList.add("visible");

                break;
            case "file":
                const [filesDone, currentFile] = value.split(",");

                this.count.textContent = `${filesDone} / ${this.totalCount}`;
                this.current.textContent = currentFile;
                this.progress.style.setProperty("--progress", `${(100.0 * filesDone / this.totalCount).toFixed(2)}%`);

                break;
            case "done":
                this.button.toggleAttribute("disabled", false);
                this.progress.classList.remove("visible");
                this.details.classList.remove("visible");
                break;
        }
    }

    async onImportClicked() {
        try {
            await backend.post("/posts/import");
        } catch(error) {
            console.log(error);
        }
    }
}

window.customElements.define("import-button", ImportButton);
