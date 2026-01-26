import { backend } from "./backend.js";
import { ParamNames } from "./search-params.js";

export const fetchSuggestions = async (text) => {
    const sanitized = window.encodeURIComponent(text.trim());
    return await backend.get(`/tags/suggestions?${ParamNames.query}=${sanitized}`);
};
