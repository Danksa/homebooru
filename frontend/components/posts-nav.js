import { maxPageQuicklinks, showFirstPage, showLastPage } from "../config.js";
import { componentStyle } from "../util/attach-style.js";
import { create } from "../util/template.js";

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
        const { start, total, step } = pagination;
        const pageCount = Math.ceil(total / step);
        const currentPage = Math.floor(start / step);
        const pageOffset = Math.floor(maxPageQuicklinks / 2) + (currentPage === pageCount - 1 ? 1 : 0);
        const startPage = Math.max(currentPage - pageOffset, 0);
        const shownCount = Math.min(maxPageQuicklinks, pageCount - startPage);

        const pages = Array.from({ length: shownCount }, (_, i) => startPage + i);

        let firstPageLink = "";
        if(showFirstPage && startPage > 0) {
            firstPageLink = `
                <a href="${this.pageUrl(0)}">1</a>
                <span>…</span>
            `;
        }

        let lastPageLink = "";
        const lastShownPage = startPage + shownCount;
        if(showLastPage && lastShownPage < pageCount) {
            lastPageLink = `<span>…</span><a href="${this.pageUrl(start + (pageCount - currentPage - 1) * step)}">${pageCount.toFixed(0)}</a>`;
        }

        const template = create(`
            <nav>
                <a ${start > 0 ? `href="${this.pageUrl(Math.max(start - step, 0).toFixed(0))}"` : ""}>&lt;</a>
                ${firstPageLink.trim()}
                ${pages.map(page => `<a ${page !== currentPage ? `href="${this.pageUrl(start + (page - currentPage) * step)}"` : `class="current"`}>${(page + 1).toFixed(0)}</a>`).join("")}
                ${lastPageLink.trim()}
                <a ${start + step < total ? `href="${this.pageUrl((start + step).toFixed(0))}"` : ""}">&gt;</a>
            </nav>
        `);
        shadow.append(...template.elements);
    }

    pageUrl(start) {
        const urlParams = new URLSearchParams(window.location.search);
        urlParams.set("start", start);
        return `${window.location.origin}${window.location.pathname}?${urlParams.toString()}`;
    }
}

window.customElements.define("posts-nav", PostsNav);
