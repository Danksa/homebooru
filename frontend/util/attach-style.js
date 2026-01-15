export const componentStyle = (stylePath) => {
    const style = document.createElement("link");
    style.rel = "stylesheet";
    style.href = stylePath;
    return style;
};