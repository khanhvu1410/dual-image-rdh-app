import { formatBytes, shortenName } from "./file-utils.js";
import { hostImageList } from "./host-image.js";

const hiddenUploadInput = document.querySelector("#hidden-image-upload");

let hiddenImageList = new DataTransfer();

export let downloadUrl;

function renderFile(file) {
    const html = `
        <div class="hidden-image-box">
            <p>${shortenName(file.name, 26)}</p>
            <p style="color:rgb(135, 135, 135)">${formatBytes(file.size)}</p>
            <div class="delete-hidden-box" onclick="import('./js/hidden-image.js').then(module => module.removeFile())">
                <img class="delete-icon" src="resources/css/icons/delete.svg">
            </div>
        </div>
    `;
    
    $(".hidden-box-container").html(html);
}

export function removeFile() {
    hiddenImageList.items.clear();
    hiddenUploadInput.files = hiddenImageList.files;
    switchToBrowseMode();
}

function embedImage(formData) {
    let zipFileName = "";

    fetch("http://localhost:8000/image-embedding/", {
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
            downloadUrl = URL.createObjectURL(blob);
            
            $(".download-btn").attr({
                "href": `${downloadUrl}`,
                "download": `${zipFileName}`
            });

            $(".zip-file-name").text(`${zipFileName}`);
        })
        .catch(error => {
            alert(error);
        });
}

export function handleBrowseHiddenImage() {
    hiddenUploadInput.onchange = function() {
        switchToChangeMode();
        hiddenImageList.items.clear();
        hiddenImageList.items.add(hiddenUploadInput.files[0]);
        renderFile(hiddenUploadInput.files[0]);
    };

    $(".back-btn").eq(0).on("click", function() {
        $(".slide-box").eq(0).slideDown();
        $(".slide-box").eq(1).slideUp();

        $(".number-box").eq(0).css("background-color", "rgb(84, 84, 84)");
        $(".number-box").eq(1).css("background-color", "rgb(150, 150, 150)");
    });

    $(".hidden-next-btn").on("click", function() {
        const formData = new FormData();
        
        for (let file of hostImageList.files) {
            formData.append("image_files", file);
        }

        formData.append("data_file", hiddenImageList.files[0]);
        embedImage(formData);

        $(".slide-box").eq(1).slideUp();
        $(".slide-box").eq(2).slideDown();
        $(".number-box").eq(1).css("background-color", "rgb(150, 150, 150)");
        $(".number-box").eq(2).css("background-color", "rgb(84, 84, 84)");        
    });
}

function switchToChangeMode() {
    $(".browse-hidden-box").css("height", "200px");

    $(".description-box").eq(1).hide();
    $(".hidden-upload-box").hide();

    $(".hidden-box-container").show();
    $(".change-file-box").show();

    $(".change-file-box").prepend($(".custom-file-upload").eq(1));
    $(".custom-file-upload").eq(1).children().eq(1).text("Change File");

    $(".hidden-next-btn").prop("disabled", false);

    $(".hidden-next-btn").css({
        "background-color": "rgb(70, 70, 83)", 
        "color": "rgb(255, 255, 255)"
    });

    $(".hidden-next-btn").on("mouseenter", function() {
        $(this).css({
            "cursor": "pointer", 
            "background-color": "rgb(73, 73, 73)",
            "color": "rgb(255, 255, 255)"
        });
    }).on("mouseleave", function() {
        $(this).css({
            "cursor": "auto",
            "background-color": "rgb(70, 70, 83)", 
            "color": "rgb(255, 255, 255)"
        });
    });
}

function switchToBrowseMode() {
    $(".browse-hidden-box").css("height", "130px");

    $(".description-box").eq(1).show();
    $(".hidden-upload-box").show();

    $(".hidden-box-container").hide();
    $(".change-file-box").hide();

    $(".hidden-upload-box").prepend($(".custom-file-upload").eq(1));
    $(".custom-file-upload").eq(1).children().eq(1).text("Upload File");

    $(".hidden-next-btn").prop("disabled", true);

    $(".hidden-next-btn").css({
        "background-color": "rgb(230, 230, 230)", 
        "color": "rgb(135, 135, 135)"
    });

    $(".hidden-next-btn").off("mouseenter mouseleave");
}