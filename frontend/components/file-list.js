import { componentStyle } from "../util/attach-style.js";
import { create } from "../util/template.js";

class FileList extends HTMLElement {
    static SizeUnits = ["B", "kiB", "MiB", "GiB", "TiB"];

    constructor() {
        super();

        this.files = new Set();
        this.fileStates = new Map();

        const shadow = this.attachShadow({ mode: "closed" });
        shadow.appendChild(componentStyle("/components/file-list.css"));

        const template = create(`
            <ul id="list"></ul>
        `);
        shadow.append(...template.elements);

        const { list } = template.namedElements;
        this.list = list;
    }

    addFiles(files) {
        for(const file of files) {
            const template = create(`
                <li>
                    <div class="info">
                        <span class="name">${file.name}</span>
                        <span class="spacer"></span>
                        <span>${this.formattedSize(file.size)}</span>
                    </div>
                    <div class="progress">
                        <div class="bar">
                            <div id="percentage"></div>
                        </div>
                    </div>
                </li>
            `);
            const entry = template.elements[0];
            this.list.appendChild(entry);

            const { percentage } = template.namedElements;

            this.files.add(file);
            this.fileStates.set(file, {
                state: "idle",
                element: entry,
                percentage
            });
        }
    }

    updateFileState(file, state) {
        const currentState = this.fileStates.get(file);
        if(currentState == null)
            return;

        const { state: oldState, element, percentage } = currentState;
        if(oldState === "done")
            return;

        if(typeof state === "number") {
            element.style.setProperty("--progress", `${state.toFixed(2)}%`);
            percentage.textContent = `${state.toFixed(2)} %`;
            return;
        }

        element.classList.remove(oldState);
        element.classList.add(state);

        currentState.state = state;

        /*if(state === "done") {
            setTimeout(() => {
                element.remove();
                this.files.delete(file);
                this.fileStates.delete(file);
            }, 1000);
        }*/
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
