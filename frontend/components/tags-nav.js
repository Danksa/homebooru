import { maxPageQuicklinks } from "../config.js";
import { componentStyle } from "../util/attach-style.js";

class TagsNav extends HTMLElement {
    constructor() {
        super();

        const shadow = this.attachShadow({ mode: "closed" });

        shadow.appendChild(componentStyle("/components/tags-nav.css"));

        this.create = (pagination) => this.populate(shadow, pagination);
    }

    populate(shadow, pagination) {
        const row = document.createElement("nav");

        const { start, total, step } = pagination;
        const pageCount = Math.ceil(total / step);
        const currentPage = Math.floor(start / step);
        const pageOffset = Math.floor(maxPageQuicklinks / 2) + (currentPage === pageCount - 1 ? 1 : 0);
        const startPage = Math.max(currentPage - pageOffset, 0);
        const shownCount = Math.min(maxPageQuicklinks, pageCount - startPage);

        const prevButton = document.createElement("a");
        if(start > 0)
            prevButton.href = this.pageUrl(Math.max(start - step, 0).toFixed(0));
        prevButton.textContent = "<";
        row.appendChild(prevButton);

        for(let i = 0; i < shownCount; ++i) {
            const page = startPage + i;

            const button = document.createElement("a");
            button.textContent = (page + 1).toFixed(0);
            if(page !== currentPage)
                button.href = this.pageUrl(start + (page - currentPage) * step);
            row.appendChild(button);
        }

        const nextButton = document.createElement("a");
        if(start + step < total)
            nextButton.href = this.pageUrl((start + step).toFixed(0));
        nextButton.textContent = ">";
        row.appendChild(nextButton);

        shadow.appendChild(row);
    }

    pageUrl(start) {
        const urlParams = new URLSearchParams(window.location.search);
        urlParams.set("start", start);
        return `${window.location.origin}${window.location.pathname}?${urlParams.toString()}`;
    }
}

window.customElements.define("tags-nav", TagsNav);
