import { formatBytes, shortenName, isFileEqual } from "./file-utils.js";

const hostUploadInput = document.querySelector("#host-image-upload");

export let hostImageList = new DataTransfer();

function renderFiles() {
    const files = hostImageList.files;

    let htmls = "";
    let sumSize = 0;
    for (let i = 0; i < files.length; i++) {
        htmls += `
            <div class="host-image-box">
                <p>${shortenName(files[i].name, 12)}</p>
                <p style="color:rgb(135, 135, 135)">${formatBytes(files[i].size)}</p>
                <div class="delete-host-box" onclick="import('./js/host-image.js').then(module => module.removeFile(${i}))">
                    <img class="delete-icon" src="resources/css/icons/delete.svg">
                </div>
            </div>
        `;
        sumSize += files[i].size;
    }

    $(".host-box-container").html(htmls);
    
    if (files.length > 1) {
        $(".host-image-number").text(`${files.length} files, ${formatBytes(sumSize)}`);
    } else {
        $(".host-image-number").text(`${files.length} file`);
    }
}

export function removeFile(index)
{
    hostImageList.items.remove(index);
    if (hostImageList.items.length <= 0) {
        hostUploadInput.files = hostImageList.files;
        switchToBrowseMode();
    }
    renderFiles();
}

async function checkFileExist(file) {
    for (let f of hostImageList.files) {
        if (await isFileEqual(file, f)) {
            return true;
        }
    }
    return false;
}

export function handleBrowseHostImage() {
    hostUploadInput.onchange = async function() {
        for (let file of hostUploadInput.files) {
            if (!await checkFileExist(file)) {
                hostImageList.items.add(file);
            }
        }
        switchToAddMode();
        renderFiles();        
    };

    $(".reset-host-box").on("click", function() {
        hostImageList.items.clear();
        hostUploadInput.files = hostImageList.files;
        switchToBrowseMode();
    });  

    $(".host-next-btn").on("click", function() {
        $(".slide-box").eq(0).slideUp();
        $(".slide-box").eq(1).slideDown();
        $(".number-box").eq(0).css("background-color", "rgb(150, 150, 150)");
        $(".number-box").eq(1).css("background-color", "rgb(84, 84, 84)");
    });
}

function switchToAddMode() {
    $(".browse-host-box").css("height", "200px");

    $(".description-box").eq(0).hide();
    $(".host-upload-box").hide();

    $(".host-box-container").show();
    $(".add-reset-container").show();

    $(".add-reset-box").prepend($(".custom-file-upload").eq(0));
    $(".custom-file-upload").eq(0).children().eq(0).attr("src", "resources/css/icons/add.svg");
    $(".custom-file-upload").eq(0).children().eq(1).text("Add Files");
    
    $(".host-next-btn").prop("disabled", false);

    $(".host-next-btn").css({
        "background-color": "rgb(70, 70, 83)", 
        "color": "rgb(255, 255, 255)"
    });

    $(".host-next-btn").on("mouseenter", function() {
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
    $(".browse-host-box").css("height", "130px");

    $(".description-box").eq(0).show();
    $(".host-upload-box").show();

    $(".host-box-container").hide();
    $(".add-reset-container").hide();

    $(".host-upload-box").prepend($(".custom-file-upload").eq(0));

    $(".custom-file-upload").eq(0).children().eq(0).attr("src", "resources/css/icons/file.svg");
    $(".custom-file-upload").eq(0).children().eq(1).text("Upload Files");

    $(".host-next-btn").prop("disabled", true);

    $(".host-next-btn").css({
        "background-color": "rgb(230, 230, 230)", 
        "color": "rgb(135, 135, 135)"
    });

    $(".host-next-btn").off("mouseenter mouseleave");
}