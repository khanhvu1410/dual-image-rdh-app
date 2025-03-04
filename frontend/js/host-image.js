const hostUploadInput = document.querySelector("#host-image-upload");

let fileList = new DataTransfer();

function formatBytes(bytes, decimals = 2) {
    if (!+bytes) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

function renderFiles() {
    const files = fileList.files;

    let htmls = "";
    let sumSize = 0;
    for (let i = 0; i < files.length; i++) {
        let fileName = "";
        if (files[i].name.length > 12) {
            for (let j = 0; j < 12; j++) {
                fileName += files[i].name[j];
            }
            fileName += "..."; 
        } else {
            fileName = files[i].name;
        }
        
        htmls += `
            <div class="host-image-box">
                <p>${fileName}</p>
                <p>${formatBytes(files[i].size)}</p>
                <div class="delete-host-box" onclick="import('./js/host-image.js').then(module => module.removeFile(${i}))">
                    <img class="delete-icon" src="resources/icons/delete.svg">
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

function removeFile(index)
{
    fileList.items.remove(index);
    if (fileList.items.length <= 0) {
        hostUploadInput.files = fileList.files;
        switchToBrowseMode();
    }
    renderFiles();
}

function handleBrowseHostImage() {
    hostUploadInput.onchange = function() {
        for (let file of hostUploadInput.files) {
            fileList.items.add(file);
        }
        switchToAddMode();
        renderFiles();        
    };

    $(".reset-host-box").on("click", function() {
        fileList.items.clear();
        hostUploadInput.files = fileList.files;
        switchToBrowseMode();
    });  
}

function switchToAddMode() {
    $(".browse-host-box").css("height", "200px");

    $(".description-box").hide();
    $(".host-upload-box").hide();

    $(".host-box-container").show();
    $(".add-reset-container").show();

    const customFileUpload = document.querySelectorAll(".custom-file-upload");
    customFileUpload[1].children[0].setAttribute("src", "resources/icons/add.svg");
    customFileUpload[1].children[1].textContent = "Add Files";
    
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

    $(".description-box").show();
    $(".host-upload-box").show();

    $(".host-box-container").hide();
    $(".add-reset-container").hide();

    $(".host-next-btn").prop("disabled", true);

    $(".host-next-btn").css({
        "background-color": "rgb(230, 230, 230)", 
        "color": "rgb(135, 135, 135)"
    });

    $(".host-next-btn").off("mouseenter mouseleave");
}

export { handleBrowseHostImage, removeFile};