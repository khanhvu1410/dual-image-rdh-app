import { handleBrowseHostImage } from "./host-image.js";
import { handleBrowseHiddenImage } from "./hidden-image.js";
import { handleDownloadZipFile } from "./file-downloading.js";

$(function() {
    $(".host-next-btn").prop("disabled", true);
    $(".hidden-next-btn").prop("disabled", true);

    $(".host-box-container").hide();
    $(".add-reset-container").hide();

    $(".slide-box").eq(1).hide();
    $(".hidden-box-container").hide();
    $(".change-file-box").hide();

    $(".slide-box").eq(2).hide();
    $(".border-box").eq(2).css("border", "none");

    $(".number-box").eq(1).css("background-color", "rgb(150, 150, 150)");
    $(".number-box").eq(2).css("background-color", "rgb(150, 150, 150)");

    handleBrowseHostImage();

    handleBrowseHiddenImage();

    handleDownloadZipFile();
});