import { handleBrowseHostImage } from "./host-image.js";
import { handleBrowseHiddenImage } from "./hidden-image.js";
import { handleDownloadZipFile } from "./file-downloading.js";
import { handleBrowseEmbeddedImage } from "./embedded-image.js";
import { handleBrowseRule } from "./extracting-rule.js";

$(function() {
    handleClickOptionBox();

    hidingInitialSetup();

    restoringInitialSetup();

    handleBrowseHostImage();

    handleBrowseHiddenImage();

    handleDownloadZipFile();

    handleBrowseEmbeddedImage();

    handleBrowseRule();
});

function handleClickOptionBox() {
    $(".hiding-box").on("click", function() {
        $(".process-container").eq(0).show();
        $(".process-container").eq(1).hide();
        $(this).css({
            "background-color": "rgb(255, 255, 255)",
            "border-radius": "8px",
            "box-shadow": "2px 2px rgba(224, 224, 224, 0.2)"
        });
        $(".restoring-box").css({
            "background-color": "rgb(240, 240, 240)",
            "border-radius": "",
            "box-shadow": ""
        });
    });

    $(".restoring-box").on("click", function() {
        $(".process-container").eq(0).hide();
        $(".process-container").eq(1).show();
        $(this).css({
            "background-color": "rgb(255, 255, 255)",
            "border-radius": "8px",
            "box-shadow": "2px 2px rgba(224, 224, 224, 0.2)"
        });
        $(".hiding-box").css({
            "background-color": "rgb(240, 240, 240)",
            "border-radius": "",
            "box-shadow": ""
        });
    });
}

function hidingInitialSetup() {
    $(".host-next-btn").prop("disabled", true);
    $(".hidden-next-btn").prop("disabled", true);

    $(".host-box-container").hide();
    $(".add-reset-container").eq(0).hide();

    $(".slide-box").eq(1).hide();
    $(".hidden-box-container").hide();
    $(".change-file-box").eq(0).hide();

    $(".slide-box").eq(2).hide();
    $(".border-box").eq(2).css("border", "none");

    $(".number-box").eq(1).css("background-color", "rgb(150, 150, 150)");
    $(".number-box").eq(2).css("background-color", "rgb(150, 150, 150)");
}

function restoringInitialSetup() {
    $(".process-container").eq(1).hide();

    $(".embedded-box-container").hide();
    $(".add-reset-container").eq(1).hide();

    $(".slide-box").eq(4).hide();
    $(".rule-box-container").hide();
    $(".change-file-box").eq(1).hide();

    $(".slide-box").eq(5).hide();
    $(".border-box").eq(5).css("border", "none");

    $(".number-box").eq(4).css("background-color", "rgb(150, 150, 150)");
    $(".number-box").eq(5).css("background-color", "rgb(150, 150, 150)");
}