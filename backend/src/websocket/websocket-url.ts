export const websocketUrl = (url: string): string => {
    if(url.indexOf("?") < 0)
        return `${trailingSlash(url)}.websocket`;

    const [baseUrl, query] = url.split("?");
    return `${trailingSlash(baseUrl)}.websocket?${query}`;
};

const trailingSlash = (s: string): string => {
    return s.endsWith("/") ? s : `${s}/`;
};