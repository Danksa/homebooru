import { backend } from "./util/backend.js";

const drop = document.getElementById("drop");
const list = document.getElementById("list");
const upload = document.getElementById("upload");

drop.addEventListener("files-added", (event) => {
    list.addFiles(event.detail);
    upload.removeAttribute("disabled");
});

const uploadFile = async (file) => {
    const data = new FormData();
    data.append("files", file);
    
    await backend.post("/posts", data);
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
