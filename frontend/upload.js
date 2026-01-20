import { backendUrl } from "./config.js";
import { backend } from "./util/backend.js";

const drop = document.getElementById("drop");
const list = document.getElementById("list");
const upload = document.getElementById("upload");
const importPath = document.getElementById("import-path");

const fileIds = new Map();

drop.addEventListener("files-added", (event) => {
    list.addFiles(event.detail);
    upload.removeAttribute("disabled");
});

const randomId = () => {
    try {
        return crypto.randomUUID();
    } catch {
        return (Math.random() * 1000000.0).toFixed(0);
    }
};

const uploadFile = async (file) => {
    const data = new FormData();
    data.append("files", file);

    const id = randomId();
    fileIds.set(id, file);
    
    await backend.post(`/posts?progressId=${id}`, data);
};

const uploadFiles = async (files) => {
    for(const file of files) {
        list.updateFileState(file, "uploading");

        try {
            await uploadFile(file);
            list.updateFileState(file, "done");
        } catch {
            list.updateFileState(file, "error");
        }
    }

    drop.toggleAttribute("disabled", false);
};

upload.addEventListener("click", () => {
    drop.toggleAttribute("disabled", true);
    upload.toggleAttribute("disabled", true);

    const files = Array.from(list.files);
    uploadFiles(files);
});

const ws = new WebSocket(`${backendUrl}/posts/upload-status`);
ws.addEventListener("message", (event) => {
    const [id, progress] = event.data.split(":");
    const percent = parseFloat(progress);
    const file = fileIds.get(id);
    if(file != null)
        list.updateFileState(file, percent);
});

const loadImportPath = async () => {
    try {
        const path = await backend.get("/posts/import/path");
        importPath.textContent = path;
    } catch {
        importPath.textContent = "";
    }
};
loadImportPath();
