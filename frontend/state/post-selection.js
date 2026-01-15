class PostSelection extends EventTarget {
    #storageKey;

    constructor() {
        super();

        this.#storageKey = "post-selection";
    }

    toggleSelection(postId, select) {
        const ids = this.selection();
        if(select && !ids.includes(postId)) {
            ids.push(postId);
            this.#saveSelection(ids);
            this.dispatchEvent(new CustomEvent("selection-toggle", { detail: { id: postId, selected: select } }));
        } else if(!select) {
            const index = ids.findIndex(id => id === postId);
            if(index >= 0) {
                ids.splice(index, 1);
                this.#saveSelection(ids);
                this.dispatchEvent(new CustomEvent("selection-toggle", { detail: { id: postId, selected: select } }));
            }
        }
    }

    includes(postId) {
        const ids = this.selection();
        return ids.includes(postId);
    }

    clear() {
        const ids = this.selection();
        this.#saveSelection([]);

        for(const id of ids)
            this.dispatchEvent(new CustomEvent("selection-toggle", { detail: { id, selected: false } }));
    }

    #saveSelection(selection) {
        window.localStorage.setItem(this.#storageKey, JSON.stringify(selection));
    }

    selection() {
        const encoded = window.localStorage.getItem(this.#storageKey);
        return encoded != null ? JSON.parse(encoded) : [];
    }
}

export const postSelection = new PostSelection();
