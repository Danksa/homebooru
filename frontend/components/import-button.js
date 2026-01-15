import { backendUrl } from "../config.js";
import { componentStyle } from "../util/attach-style.js";

class ImportButton extends HTMLElement {
    constructor() {
        super();

        const shadow = this.attachShadow({ mode: "closed" });

        const button = document.createElement("button");
        button.textContent = "Process imports";
        button.part = "button";
        button.addEventListener("click", async () => {
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
        });
        shadow.appendChild(button);

        shadow.appendChild(componentStyle("/components/import-button.css"));
    }
}

window.customElements.define("import-button", ImportButton);
