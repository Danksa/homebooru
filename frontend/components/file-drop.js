import { componentStyle } from "../util/attach-style.js";

class FileDrop extends HTMLElement {
    static observedAttributes = ["disabled"];

    constructor() {
        super();

        const shadow = this.attachShadow({ mode: "closed" });

        this.globalDropSuppresion = (event) => {
            const items =  Array.from(event.dataTransfer.items);
            if(items.some(item => item.kind === "file"))
                event.preventDefault();
        };

        const label = document.createElement("label");
        label.addEventListener("drop", this.onFileDropped.bind(this));
        label.addEventListener("dragover", this.onFileDragOver.bind(this));
        label.addEventListener("dragleave", this.onFileDragEnd.bind(this));
        label.addEventListener("dragend", this.onFileDragEnd.bind(this));
        this.label = label;

        const labelContent = document.createElement("div");
        labelContent.classList.add("content");

        const icon = document.createElement("span");
        icon.classList.add("icon");
        icon.textContent = "📤";
        labelContent.appendChild(icon);

        const text = document.createElement("span");
        text.textContent = "Drop or select files to upload";
        labelContent.appendChild(text);

        label.appendChild(labelContent);

        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*,video/*";
        input.multiple = true;
        input.addEventListener("change", (event) => {
            this.dispatchEvent(new CustomEvent("files-added", { detail: event.target.files }));
            input.value = null;
        });
        this.input = input;
        label.appendChild(input);

        shadow.appendChild(label);

        shadow.appendChild(componentStyle("/components/file-drop.css"));
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if(name === "disabled") {
            this.input.toggleAttribute(name, newValue != null);
        }
    }

    connectedCallback() {
        window.addEventListener("drop", this.globalDropSuppresion);
    }

    disconnectedCallback() {
        window.removeEventListener("drop", this.globalDropSuppresion);
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
}

window.customElements.define("file-drop", FileDrop);
