import { hidingDownloadUrl } from "./hidden-img-uploading.js";
import { restoringDownloadUrl } from "./key-uploading.js";
import { switchActiveStep, disableButton } from "./upload-helper.js";

function handleBackBtnClick(zipFileBox, downloadBtn) {
    zipFileBox.css({
        "background-color": "rgb(253, 236, 234)",
        "color": "rgb(97, 26, 21)"
    });

    zipFileBox.html(`
        <div class="loader"></div>
        <p>Loading file, please wait...</p>
    `);

    downloadBtn.addClass("disable-click");

    disableButton(downloadBtn);
}

export function handleDownloadZipFile() {
    $(".back-btn").eq(1).on("click", function() {
        switchActiveStep(1, 2);

        handleBackBtnClick(
            $(".zip-file-box").eq(0),
            $(".download-btn").eq(0)
        );
    });

    $(".download-btn").eq(0).on("click", function() {
        setTimeout(function() {
            URL.revokeObjectURL(hidingDownloadUrl);
        }, 100);
    });

    $(".back-btn").eq(3).on("click", function() {
        switchActiveStep(4, 5);

        handleBackBtnClick(
            $(".zip-file-box").eq(1),
            $(".download-btn").eq(1)
        );
    }); 

    $(".download-btn").eq(1).on("click", function() {
        setTimeout(function() {
            URL.revokeObjectURL(restoringDownloadUrl);
        }, 100);
    });
}