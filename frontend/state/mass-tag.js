import { backend } from "../util/backend.js";
import { postSelection } from "./post-selection.js";

class MassTag extends EventTarget {
    #tagsKey;
    #activeKey;

    constructor() {
        super();
        this.#tagsKey = "mass-tag-tags";
        this.#activeKey = "mass-tag-active";
    }

    addTag(tag) {
        const tags = this.tags();
        tags.push(tag);
        this.#save(tags);
    }

    #save(tags) {
        const encoded = JSON.stringify(tags);
        localStorage.setItem(this.#tagsKey, encoded);
    }

    tags() {
        const encoded = localStorage.getItem(this.#tagsKey);
        return encoded != null ? JSON.parse(encoded) : [];
    }

    async apply() {
        try {
            const tags = this.tags();
            const postIds = postSelection.selection();
            for(const postId of postIds) {
                await backend.post(`/posts/${postId}/tags`, { names: tags });
                
                postSelection.toggleSelection(postId, false);
            }
        } finally {
            this.cancel();
        }
    }

    cancel() {
        this.#save([]);
        this.toggle(false);
        postSelection.clear();
    }

    active() {
        return localStorage.getItem(this.#activeKey) === "true";
    }

    toggle(active) {
        localStorage.setItem(this.#activeKey, active ? "true" : "false");
        this.dispatchEvent(new CustomEvent("toggle", { detail: active }));
    }
}

export const massTag = new MassTag();
