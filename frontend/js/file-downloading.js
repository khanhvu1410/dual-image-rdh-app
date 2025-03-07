import { downloadUrl } from "./hidden-image.js";

export function handleDownloadZipFile() {
    $(".back-btn").eq(1).on("click", function() {
        $(".slide-box").eq(1).slideDown();
        $(".slide-box").eq(2).slideUp();

        $(".number-box").eq(1).css("background-color", "rgb(84, 84, 84)");
        $(".number-box").eq(2).css("background-color", "rgb(150, 150, 150)");
    });

    $(".download-btn").on("click", function() {
        setTimeout(function() {
            URL.revokeObjectURL(downloadUrl);
        }, 100);
    });
}