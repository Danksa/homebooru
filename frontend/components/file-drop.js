import { componentStyle } from "../util/attach-style.js";
import { create } from "../util/template.js";
import { CustomElement } from "./custom-element.js";

class FileDrop extends CustomElement {
    static observedAttributes = ["disabled"];

    constructor() {
        super();

        const shadow = this.attachShadow({ mode: "closed" });
        shadow.appendChild(componentStyle("/components/file-drop.css"));

        const template = create(`
            <label id="label">
                <div class="content">
                    <span class="icon">📤</span>
                    <span>Drop or select files to upload</span>
                </div>
                <input id="input" type="file" accept="image/*,video/*" multiple />
            </label>
        `);
        shadow.append(...template.elements);

        const { label, input } = template.namedElements;

        this.registerListener(label, "drop", this.onFileDropped);
        this.registerListener(label, "dragover", this.onFileDragOver);
        this.registerListener(label, "dragleave", this.onFileDragEnd);
        this.registerListener(label, "dragend", this.onFileDragEnd);
        this.label = label;

        this.registerListener(input, "change", this.onInputChange);
        this.input = input;

        this.registerListener(window, "drop", this.suppressDefaultDrop);
    }

    attributeChangedCallback(name, _, newValue) {
        if(name === "disabled") {
            this.input.toggleAttribute(name, newValue != null);
        }
    }

    suppressDefaultDrop(event) {
        const items =  Array.from(event.dataTransfer.items);
        if(items.some(item => item.kind === "file"))
            event.preventDefault();
    }

    onFileDropped(event) {
        if(this.hasAttribute("disabled"))
            return;

        event.preventDefault();

        const files = Array.from(event.dataTransfer.items).filter(item => item.kind === "file").map(item => item.getAsFile());
        this.dispatchEvent(new CustomEvent("files-added", { detail: files }));

        this.onFileDragEnd();
    }

    onFileDragOver(event) {
        const files = Array.from(event.dataTransfer.items).filter(item => item.kind === "file");
        if(files.length === 0)
            return;

        event.preventDefault();

        if(this.hasAttribute("disabled")) {
            event.dataTransfer.dropEffect = "none";
            return;
        }

        const includesValidFiles = files.some(file => file.type.startsWith("image/") || file.type.startsWith("video/"));
        event.dataTransfer.dropEffect = includesValidFiles ? "copy" : "none";
        this.label.classList.toggle("valid", includesValidFiles);
        this.label.classList.add("dragging");
    }

    onFileDragEnd() {
        this.label.classList.remove("dragging");
    }

    onInputChange(event) {
        this.dispatchEvent(new CustomEvent("files-added", { detail: event.target.files }));
        this.input.value = null;
    }
}

window.customElements.define("file-drop", FileDrop);
