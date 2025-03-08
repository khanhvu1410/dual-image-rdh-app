import { formatBytes, shortenName } from "./file-utils.js";
import { embeddedImageList } from "./embedded-image.js";

const ruleUploadInput = document.querySelector("#rule-upload");

const ruleList = new DataTransfer();

export let restoringDownloadUrl;

function renderFile(file) {
    const html = `
            <div class="rule-box">
                <p>${shortenName(file.name, 26)}</p>
                <p style="color:rgb(135, 135, 135)">${formatBytes(file.size)}</p>
                <div class="delete-hidden-box" onclick="import('./js/extracting-rule.js').then(module => module.removeFile())">
                    <img class="delete-icon" src="resources/css/icons/delete.svg">
                </div>
            </div>
        `;
        
    $(".rule-box-container").html(html);
}

export function removeFile() {
    ruleList.items.clear();
    ruleUploadInput.files = ruleList.files;
    switchToBrowseMode();
}

function extractImage(formData) {
    let zipFileName = "";

    fetch("http://localhost:8000/image-extracting/", {
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
            restoringDownloadUrl = URL.createObjectURL(blob);

            $(".download-btn").eq(1).attr({
                "href": `${restoringDownloadUrl}`,
                "download": `${zipFileName}`
            });

            $(".zip-file-name").eq(1).text(`${zipFileName}`);
        })
        .catch(error => {
            alert(error);   
        });
}

export function handleBrowseRule() {
    ruleUploadInput.onchange = function(e) {
        switchToChangeMode();
        ruleList.items.clear();
        ruleList.items.add(e.target.files[0]);
        renderFile(e.target.files[0]);
    }

    $(".back-btn").eq(2).on("click", function() {
        $(".slide-box").eq(3).slideDown();
        $(".slide-box").eq(4).slideUp();

        $(".number-box").eq(3).css("background-color", "rgb(84, 84, 84)");
        $(".number-box").eq(4).css("background-color", "rgb(150, 150, 150)");
    });

    $(".rule-next-btn").on("click", function() {
        const formData = new FormData();
        formData.append("image_file_1", embeddedImageList.files[0]);
        formData.append("image_file_2", embeddedImageList.files[1]);
        formData.append("extract_rule_file", ruleList.files[0]);
        extractImage(formData);
        
        $(".slide-box").eq(4).slideUp();
        $(".slide-box").eq(5).slideDown();
        $(".number-box").eq(4).css("background-color", "rgb(150, 150, 150)");
        $(".number-box").eq(5).css("background-color", "rgb(84, 84, 84)");
    });
}

function switchToChangeMode() {
    $(".browse-rule-box").css("height", "200px");

    $(".description-box").eq(3).hide();
    $(".rule-upload-box").hide();

    $(".rule-box-container").show();
    $(".change-file-box").eq(1).show();

    $(".change-file-box").eq(1).prepend($(".custom-file-upload").eq(3));
    $(".custom-file-upload").eq(3).children().eq(1).text("Change File");

    $(".rule-next-btn").prop("disabled", false);

    $(".rule-next-btn").css({
        "background-color": "rgb(70, 70, 83)", 
        "color": "rgb(255, 255, 255)"
    });

    $(".rule-next-btn").on("mouseenter", function() {
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
    $(".browse-rule-box").css("height", "130px");

    $(".description-box").eq(3).show();
    $(".rule-upload-box").show();

    $(".rule-box-container").hide();
    $(".change-file-box").eq(1).hide();

    $(".rule-upload-box").prepend($(".custom-file-upload").eq(3));
    $(".custom-file-upload").eq(3).children().eq(1).text("Upload File");

    $(".rule-next-btn").prop("disabled", true);

    $(".rule-next-btn").css({
        "background-color": "rgb(230, 230, 230)", 
        "color": "rgb(135, 135, 135)"
    });

    $(".rule-next-btn").off("mouseenter mouseleave");
}