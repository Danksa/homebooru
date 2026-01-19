import { backendUrl } from "../config.js";

const get = async (path) => {
    const url = `${backendUrl}${path}`;
    try {
        const response = await fetch(url);
        const body = await response.json();
        return body;
    } catch (error) {
        console.error(`Error while fetching URL "${url}":`, error);
        console.error(`Is the backend URL "${backendUrl}" correct? If not, update it in the config.js file.`);
        throw error;
    }
};

const post = async (path, body = undefined) => {
    const url = `${backendUrl}${path}`;
    try {
        const options = { method: "POST" };
        if(body instanceof FormData) {
            options.body = body;
        } else if(body != null) {
            options.body = JSON.stringify(body);
            options.headers = {
                "Content-Type": "application/json"
            };
        }

        const response = await fetch(url, options);
        return response;
    } catch (error) {
        console.error(`Error while fetching URL "${url}":`, error);
        console.error(`Is the backend URL "${backendUrl}" correct? If not, update it in the config.js file.`);
        throw error;
    }
};

const patch = async (path, body = undefined) => {
    const url = `${backendUrl}${path}`;
    try {
        const options = { method: "PATCH" };
        if(body instanceof FormData) {
            options.body = body;
        } else if(body != null) {
            options.body = JSON.stringify(body);
            options.headers = {
                "Content-Type": "application/json"
            };
        }

        const response = await fetch(url, options);
        return response;
    } catch (error) {
        console.error(`Error while fetching URL "${url}":`, error);
        console.error(`Is the backend URL "${backendUrl}" correct? If not, update it in the config.js file.`);
        throw error;
    }
};

const _delete = async(path) => {
    const url = `${backendUrl}${path}`;
    try {
        await fetch(url, { method: "DELETE" });
    } catch (error) {
        console.error(`Error while fetching URL "${url}":`, error);
        console.error(`Is the backend URL "${backendUrl}" correct? If not, update it in the config.js file.`);
        throw error;
    }
};

export const backend = {
    get,
    post,
    patch,
    delete: _delete
};
