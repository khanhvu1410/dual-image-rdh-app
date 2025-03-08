import { formatBytes, shortenName, checkFileExist } from "./file-utils.js";

const embeddedUploadInput = document.querySelector("#embedded-image-upload");

export const embeddedImageList = new DataTransfer();

function renderFiles() {
    const files = embeddedImageList.files;
    
    let htmls = "";
    let sumSize = 0;
    for (let i = 0; i < files.length; i++) {
        htmls += `
            <div class="embedded-image-box">
                <p>${shortenName(files[i].name, 12)}</p>
                <p style="color:rgb(135, 135, 135)">${formatBytes(files[i].size)}</p>
                <div class="delete-embedded-box" onclick="import('./js/embedded-image.js').then(module => module.removeFile(${i}))">
                    <img class="delete-icon" src="resources/css/icons/delete.svg">
                </div>
            </div>
        `;
        sumSize += files[i].size;
    }

    $(".embedded-box-container").html(htmls);
    
    if (files.length > 1) {
        $(".embedded-image-number").text(`${files.length} files, ${formatBytes(sumSize)}`);
    } else {
        $(".embedded-image-number").text(`${files.length} file`);
    }
}

export function removeFile(index) {
    embeddedImageList.items.remove(index);
    if (embeddedImageList.items.length <= 0) {
        embeddedUploadInput.files = embeddedImageList.files;
        switchToBrowseMode();
    }
    renderFiles();
}

export function handleBrowseEmbeddedImage() {
    embeddedUploadInput.onchange = async function(e) {
        for (let file of e.target.files) {
            if (!await checkFileExist(file, embeddedImageList.files) 
                    && embeddedImageList.files.length < 2) {
                embeddedImageList.items.add(file);
            }
        }
        switchToAddMode();
        renderFiles();
    }

    $(".reset-embedded-box").on("click", function() {
        embeddedImageList.items.clear();
        embeddedUploadInput.files = embeddedImageList.files;
        switchToBrowseMode();
    });

    $(".embedded-next-btn").on("click", function() {
        $(".slide-box").eq(3).slideUp();
        $(".slide-box").eq(4).slideDown();
        $(".number-box").eq(3).css("background-color", "rgb(150, 150, 150)");
        $(".number-box").eq(4).css("background-color", "rgb(84, 84, 84)");
    });
}

function switchToAddMode() {
    $(".browse-embedded-box").css("height", "200px");

    $(".description-box").eq(2).hide();
    $(".embedded-upload-box").hide();

    $(".embedded-box-container").show();
    $(".add-reset-container").eq(1).show();

    $(".add-reset-box").eq(1).prepend($(".custom-file-upload").eq(2));
    $(".custom-file-upload").eq(2).children().eq(0).attr("src", "resources/css/icons/add.svg");
    $(".custom-file-upload").eq(2).children().eq(1).text("Add Files");
    
    $(".embedded-next-btn").prop("disabled", false);

    $(".embedded-next-btn").css({
        "background-color": "rgb(70, 70, 83)", 
        "color": "rgb(255, 255, 255)"
    });

    $(".embedded-next-btn").on("mouseenter", function() {
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
    $(".browse-embedded-box").css("height", "130px");

    $(".description-box").eq(2).show();
    $(".embedded-upload-box").show();

    $(".embedded-box-container").hide();
    $(".add-reset-container").eq(1).hide();

    $(".embedded-upload-box").prepend($(".custom-file-upload").eq(2));

    $(".custom-file-upload").eq(2).children().eq(0).attr("src", "resources/css/icons/file.svg");
    $(".custom-file-upload").eq(2).children().eq(1).text("Upload Files");

    $(".embedded-next-btn").prop("disabled", true);

    $(".embedded-next-btn").css({
        "background-color": "rgb(230, 230, 230)", 
        "color": "rgb(135, 135, 135)"
    });

    $(".embedded-next-btn").off("mouseenter mouseleave");
}