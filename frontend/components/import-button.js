import { backendUrl } from "../config.js";
import { componentStyle } from "../util/attach-style.js";
import { create } from "../util/template.js";
import { CustomElement } from "./custom-element.js";

class ImportButton extends CustomElement {
    constructor() {
        super();

        const shadow = this.attachShadow({ mode: "closed" });
        shadow.appendChild(componentStyle("/components/import-button.css"));

        const template = create(`
            <button id="button" part="button">Process imports</button>
        `);
        shadow.append(...template.elements);

        const { button } = template.namedElements;
        this.registerListener(button, "click", this.onImportClicked);
    }

    async onImportClicked() {
        try {
            const response = await fetch(`${backendUrl}/posts/import`, { method: "post" });
            if(response.status >= 200 && response.status < 300)
                alert("Import started");
            else
                alert(await response.text());
        } catch(error) {
            console.log(error);
            alert(`Could not start import: ${error}`)
        }
    }
}

window.customElements.define("import-button", ImportButton);
