const browseHostBox = document.querySelector(".browse-host-box");

const descriptionBox = document.querySelector(".description-box");
const hostUploadBox = document.querySelector(".host-upload-box");

const hostBoxContainer = document.querySelector(".host-box-container");
const addResetContainer = document.querySelector(".add-reset-container");

const hostUploadInput = document.querySelector("#host-image-upload");
const resetHostBox = document.querySelector(".reset-host-box");

const hostNextBtn = document.querySelector(".host-next-btn");

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
                <div class="delete-host-box" onclick="import('./host-image.js').then(module => module.removeFile(${i}))">
                    <img class="delete-icon" src="icons/delete.svg">
                </div>
            </div>
        `;

        sumSize += files[i].size;
    }

    hostBoxContainer.innerHTML = htmls;

    const hostImageNumber = document.querySelector(".host-image-number");
    
    if (files.length > 1) {
        hostImageNumber.textContent = `${files.length} files, ${formatBytes(sumSize)}`;
    } else {
        hostImageNumber.textContent = `${files.length} file`;
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

function handleBrowseFile() {
    hostUploadInput.onchange = function() {
        for (let file of hostUploadInput.files) {
            fileList.items.add(file);
        }
        switchToAddMode();
        renderFiles();        
    };

    resetHostBox.onclick = function() {
        fileList.items.clear();
        hostUploadInput.files = fileList.files;
        switchToBrowseMode();
    }
}

function setStyleMouseOverNextBtn() {
    this.setAttribute("style", "cursor:pointer;background-color:rgb(73, 73, 73);color:rgb(255,255,255)");
}

function setStyleMouseOutNextBtn() {
    this.setAttribute("style", "background-color:rgb(70, 70, 83);color:rgb(255,255,255)");
}

function switchToAddMode() {
    browseHostBox.style.height = "200px";

    descriptionBox.style.display = "none";
    hostUploadBox.style.display = "none";

    hostBoxContainer.style.display = "flex";
    addResetContainer.style.display = "flex";

    const customFileUpload = document.querySelectorAll(".custom-file-upload");
    customFileUpload[1].children[0].setAttribute("src", "icons/add.svg");
    customFileUpload[1].children[1].textContent = "Add Files";
    
    hostNextBtn.disabled = false;
    hostNextBtn.style.backgroundColor = "rgb(70, 70, 83)";
    hostNextBtn.style.color = "rgb(255, 255, 255)";

    hostNextBtn.addEventListener("mouseover", setStyleMouseOverNextBtn);
    hostNextBtn.addEventListener("mouseout", setStyleMouseOutNextBtn);
}

function switchToBrowseMode() {
    browseHostBox.style.height = "130px";

    descriptionBox.style.display = "flex";
    hostUploadBox.style.display = "flex";

    hostBoxContainer.style.display = "none";
    addResetContainer.style.display = "none";

    hostNextBtn.disabled = true;
    hostNextBtn.style.backgroundColor = "rgb(230, 230, 230)";
    hostNextBtn.style.color = "rgb(135, 135, 135)";

    hostNextBtn.removeEventListener("mouseover", setStyleMouseOverNextBtn);
    hostNextBtn.removeEventListener("mouseout", setStyleMouseOutNextBtn);
}

export {hostNextBtn, handleBrowseFile, removeFile};