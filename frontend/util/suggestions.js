import { backendUrl } from "../config.js";

export const fetchSuggestions = async (text) => {
    const sanitized = window.encodeURIComponent(text.trim());
    const response = await fetch(`${backendUrl}/tags/suggestions?query=${sanitized}`);
    return await response.json();
};
