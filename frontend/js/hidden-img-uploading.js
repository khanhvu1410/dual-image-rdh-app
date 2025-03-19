import {
    switchToAddMode,
    switchToBrowseMode,
    renderFiles,
    switchToDownloadMode,
    switchActiveStep
} from "./upload-helper.js";

import { hostImageList } from "./host-img-uploading.js";

const hiddenUploadInput = document.querySelector("#hidden-image-upload");

let hiddenImageList = new DataTransfer();

export let hidingDownloadUrl;

export function removeFile(index, id) {
    hiddenImageList.items.remove(index);
    hiddenUploadInput.files = hiddenImageList.files;
    $(`#${id}`).remove();
    switchToBrowseMode(
        $(".description-box").eq(1),
        $(".hidden-upload-box"),
        $(".hidden-box-container"),
        $(".change-file-box").eq(0),
        $(".custom-file-upload").eq(1),
        $(".hidden-next-btn")
    );
}

function embedImage(formData, callback) {
    let zipFileName = "";

    fetch("https://rdh-fastapi-app.onrender.com/image-embedding/", {
        method: "POST",
        body: formData
    })
        .then(response => {
            const header = response.headers.get("content-disposition");
            const parts = header.split(";");
            zipFileName = parts[1].split("=")[1];
            return response.blob();
        })
        .then(blob => {
            hidingDownloadUrl = URL.createObjectURL(blob);
            callback(
                $(".download-btn").eq(0),
                $(".zip-file-box").eq(0),
                hidingDownloadUrl,
                zipFileName
            );
        })
        .catch(error => {
            alert(error);
        });
} 

export function handleBrowseHiddenImage() {
    hiddenUploadInput.onchange = function(e) {
        switchToAddMode(
            $(".description-box").eq(1),
            $(".hidden-upload-box"),
            $(".hidden-box-container"),
            null,
            $(".change-file-box").eq(0),
            $(".custom-file-upload").eq(1),
            $(".hidden-next-btn")
        );
        hiddenImageList.items.clear();
        hiddenImageList.items.add(e.target.files[0]);
        renderFiles(
            e.target.files, 
            "hidden-image-box", 
            "delete-hidden-box", 
            "hidden-img-uploading.js", 
            $(".hidden-box-container"),
            null
        );
    };

    $(".back-btn").eq(0).on("click", function() {
        switchActiveStep(0, 1)
    });

    $(".hidden-next-btn").on("click", function() {
        const formData = new FormData();
        
        for (let file of hostImageList.files) {
            formData.append("image_files", file);
        }

        formData.append("data_file", hiddenImageList.files[0]);
        embedImage(formData, switchToDownloadMode);

        switchActiveStep(2, 1); 
    });
}