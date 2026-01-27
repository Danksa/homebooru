export const ParamNames = {
    query: "query",
    start: "start",
    count: "count",
    id: "id"
};

export const urlId = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = Number(urlParams.get(ParamNames.id) ?? undefined);
    return Number.isInteger(id) ? id : null;
};

export const urlStart = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const start = Number(urlParams.get(ParamNames.start) ?? "0");
    return Number.isInteger(start) ? start : 0;
};

export const urlQuery = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(ParamNames.query) ?? null;
};

export const navigate = (path, params = {}, keepCurrent = false) => {
    window.location.href = link(path, params, keepCurrent);
};

export const link = (path, params = {}, keepCurrent = false) => {
    const urlParams = new URLSearchParams(keepCurrent ? window.location.search : "");
    for(const [name, value] of Object.entries(params))
        urlParams.set(name, value.toString());

    return `${path}?${urlParams.toString()}`;
};
