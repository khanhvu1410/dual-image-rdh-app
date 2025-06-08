import {
  switchToAddMode,
  switchToBrowseMode,
  renderFiles,
  switchToDownloadMode,
  switchActiveStep,
} from '../core/upload-helper.js';
import { shortenName, formatBytes } from '../core/file-utils.js';
import { hostImageList } from './host.js';

const hiddenUploadInput = document.querySelector('#hidden-image-upload');
let hiddenImageList = new DataTransfer();
export let hidingDownloadUrl;

export function removeFile(index, id) {
  hiddenImageList.items.remove(index);
  hiddenUploadInput.files = hiddenImageList.files;
  $(`#${id}`).remove();
  switchToBrowseMode(
    $('.description-box').eq(1),
    $('.hidden-upload-box'),
    $('.hidden-box-container'),
    $('.change-file-box').eq(0),
    $('.custom-file-upload').eq(1),
    $('.hidden-next-btn')
  );
}

function embedImage(formData, callback) {
  let zipFileName = '';

  fetch('https://dual-image-rdh-be.onrender.com/embedding/', {
    method: 'POST',
    body: formData,
  })
    .then(async (response) => {
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Unknown error occurred');
      }
      const header = response.headers.get('content-disposition');
      const parts = header.split(';');
      zipFileName = parts[1].split('=')[1];
      return response.blob();
    })
    .then((blob) => {
      hidingDownloadUrl = URL.createObjectURL(blob);
      callback(
        $('.download-btn').eq(0),
        $('.zip-file-box').eq(0),
        hidingDownloadUrl,
        zipFileName
      );
    })
    .catch((error) => {
      toastr.error(error.message, 'Error');
    });

  fetch('https://dual-image-rdh-be.onrender.com/embedding/preview/', {
    method: 'POST',
    body: formData,
  })
    .then((response) => {
      return response.json();
    })
    .then((result) => {
      let htmls = '';
      for (let i = 0; i < result.length; i++) {
        htmls += `
          <div class="preview-stego-box">
            <p>${shortenName(result[i].filename, 11)}</p>  
            <img class="image-preview" src="data:image/bmp;base64,${
              result[i].content
            }" />
            <p style="color:rgb(135, 135, 135)">${formatBytes(
              result[i].size
            )}</p>
          </div>
        `;
      }
      $('.preview-stego-container').html(htmls);
    });
}

export function handleBrowseHiddenImage() {
  hiddenUploadInput.onchange = function (e) {
    switchToAddMode(
      $('.description-box').eq(1),
      $('.hidden-upload-box'),
      $('.hidden-box-container'),
      null,
      $('.change-file-box').eq(0),
      $('.custom-file-upload').eq(1),
      $('.hidden-next-btn')
    );
    hiddenImageList.items.clear();
    hiddenImageList.items.add(e.target.files[0]);
    renderFiles(
      e.target.files,
      'hidden-image-box',
      'delete-hidden-box',
      'hidden.js',
      $('.hidden-box-container'),
      null
    );
  };

  $('.back-btn')
    .eq(0)
    .on('click', function () {
      switchActiveStep(0, 1);
    });

  $('.hidden-next-btn').on('click', function () {
    const formData = new FormData();

    for (let file of hostImageList.files) {
      formData.append('image_files', file);
    }

    formData.append('data_file', hiddenImageList.files[0]);
    embedImage(formData, switchToDownloadMode);

    switchActiveStep(2, 1);
  });
}
