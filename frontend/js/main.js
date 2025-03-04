import { handleBrowseHostImage } from "./host-image.js";
import handleBrowseHiddenImage from "./hidden-image.js";

$(function() {
    $(".host-next-btn").prop("disabled", true);

    $(".host-box-container").hide();
    $(".add-reset-container").hide();

    $(".browse-hidden-box").hide();
    $(".border-box").eq(3).hide();

    handleBrowseHostImage();

    handleBrowseHiddenImage();
});