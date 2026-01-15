export const debounced = (func, waitMs) => {
    let timeout = null;

    return (...args) => {
        if(timeout != null) {
            window.clearTimeout(timeout);
            timeout = null;
        }

        timeout = window.setTimeout(() => {
            timeout = null;
            func(...args);
        }, waitMs);
    };
};