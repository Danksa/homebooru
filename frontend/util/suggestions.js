import { backend } from "./backend.js";

export const fetchSuggestions = async (text) => {
    const sanitized = window.encodeURIComponent(text.trim());
    return await backend.get(`/tags/suggestions?query=${sanitized}`);
};
