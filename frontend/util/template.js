class Template {
    #elements;
    #namedElements;

    constructor(html) {
        this.#namedElements = {};

        const template = document.createElement("template");
        template.innerHTML = html.trim();

        const parsed = template.content.cloneNode(true);
        this.#elements = Array.from(parsed.children);

        for(const element of this.#elements)
            this.#findNamedElements(element);
    }

    get elements() {
        return this.#elements;
    }

    get namedElements() {
        return this.#namedElements;
    }

    #findNamedElements(element) {
        const id = element.getAttribute("id");
        if(id != null)
            this.#namedElements[id] = element;

        for(const child of element.children)
            this.#findNamedElements(child);
    }
}

export const create = (html) => new Template(html);
