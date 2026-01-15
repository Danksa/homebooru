import { maxPageQuicklinks, showFirstPage, showLastPage } from "../config.js";
import { componentStyle } from "../util/attach-style.js";

class PostsNav extends HTMLElement {
    constructor() {
        super();

        const shadow = this.attachShadow({ mode: "closed" });

        shadow.appendChild(componentStyle("/components/posts-nav.css"));

        const gridId = this.getAttribute("grid");
        const grid = document.getElementById(gridId);
        grid.addEventListener("pagination", (event) => {
            this.populate(shadow, event.detail);
        });
        
        if(grid.pagination != null)
            this.populate(shadow, grid.pagination);
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

        if(showFirstPage && startPage > 0) {
            const button = document.createElement("a");
            button.textContent = "1";
            button.href = this.pageUrl(0);
            row.appendChild(button);

            const dots = document.createElement("span");
            dots.textContent = "…";
            row.appendChild(dots);
        }

        for(let i = 0; i < shownCount; ++i) {
            const page = startPage + i;

            const button = document.createElement("a");
            button.textContent = (page + 1).toFixed(0);
            if(page !== currentPage)
                button.href = this.pageUrl(start + (page - currentPage) * step);
            else
                button.classList.add("current");
            row.appendChild(button);
        }

        const lastShownPage = startPage + shownCount;
        if(showLastPage && lastShownPage < pageCount) {
            const dots = document.createElement("span");
            dots.textContent = "…";
            row.appendChild(dots);

            const button = document.createElement("a");
            button.textContent = pageCount.toFixed(0);
            button.href = this.pageUrl(start + (pageCount - currentPage - 1) * step);
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

window.customElements.define("posts-nav", PostsNav);
