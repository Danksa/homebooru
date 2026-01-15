import { componentStyle } from "../util/attach-style.js";

class FileList extends HTMLElement {
    static SizeUnits = ["B", "kiB", "MiB", "GiB", "TiB"];

    constructor() {
        super();

        this.files = new Set();
        this.fileStates = new Map();

        const shadow = this.attachShadow({ mode: "closed" });

        const list = document.createElement("ul");
        this.list = list;
        shadow.appendChild(list);

        shadow.appendChild(componentStyle("/components/file-list.css"));
    }

    addFiles(files) {
        for(const file of files) {
            const entry = document.createElement("li");

            const name = document.createElement("span");
            name.classList.add("name");
            name.textContent = file.name;
            entry.appendChild(name);

            const spacer = document.createElement("span");
            spacer.classList.add("spacer");
            entry.appendChild(spacer);

            const size = document.createElement("span");
            size.textContent = this.formattedSize(file.size);
            entry.appendChild(size);

            this.list.appendChild(entry);

            this.files.add(file);
            this.fileStates.set(file, {
                state: "idle",
                element: entry
            });
        }
    }

    updateFileState(file, state) {
        const currentState = this.fileStates.get(file);
        if(currentState == null)
            return;

        const { state: oldState, element } = currentState;
        if(oldState === "done")
            return;

        element.classList.remove(oldState);
        element.classList.add(state);

        currentState.state = state;

        if(state === "done") {
            setTimeout(() => {
                element.remove();
                this.files.delete(file);
                this.fileStates.delete(file);
            }, 1000);
        }
    }

    formattedSize(size) {
        const log = Math.log2(size);
        const nearestLog = Math.floor(log / 10.0) * 10.0;
        const unitIndex = Math.min(Math.floor(log / 10.0), FileList.SizeUnits.length - 1);
        const unit = FileList.SizeUnits[unitIndex];
        return `${(size / Math.pow(2, nearestLog)).toFixed(1)} ${unit}`;
    }
}

window.customElements.define("file-list", FileList);
