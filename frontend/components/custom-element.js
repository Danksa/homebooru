export class CustomElement extends HTMLElement {
    #listeners;

    constructor() {
        super();

        this.#listeners = [];
    }

    connectedCallback() {
        for(const [element, eventName, callback, options] of this.#listeners)
            element.addEventListener(eventName, callback, options);
    }

    disconnectedCallback() {
        for(const [element, eventName, callback] of this.#listeners)
            element.removeEventListener(eventName, callback);
    }

    registerListener(element, eventName, callback, options = undefined) {
        this.#listeners.push([element, eventName, callback.bind(this), options]);
    }
}
