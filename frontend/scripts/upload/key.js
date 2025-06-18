import {
  switchToAddMode,
  switchToBrowseMode,
  renderFiles,
  switchToDownloadMode,
  switchActiveStep,
  switchToErrorMode,
} from '../core/upload-helper.js';
import { embeddedImageList } from './embedded.js';
import { shortenName, formatBytes } from '../core/file-utils.js';

const keyUploadInput = document.querySelector('#key-upload');
const keyList = new DataTransfer();
export let restoringDownloadUrl;

export function removeFile(index, id) {
  keyList.items.remove(index);
  keyUploadInput.files = keyList.files;
  $(`#${id}`).remove();
  switchToBrowseMode(
    $('.description-box').eq(3),
    $('.key-upload-box'),
    $('.key-box-container'),
    $('.change-file-box').eq(1),
    $('.custom-file-upload').eq(3),
    $('.key-next-btn')
  );
}

function extractImage(formData, callback) {
  let zipFileName = '';

  fetch('https://dual-image-rdh-be.onrender.com/extracting/', {
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
      restoringDownloadUrl = URL.createObjectURL(blob);
      callback(
        $('.download-btn').eq(1),
        $('.zip-file-box').eq(1),
        restoringDownloadUrl,
        zipFileName
      );
    })
    .catch((error) => {
      toastr.error(error.message, 'Error');
      switchToErrorMode($('.zip-file-box').eq(1), false);
    });

  fetch('https://dual-image-rdh-be.onrender.com/extracting/preview/', {
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
          <div class="preview-restored-box">
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
      $('.preview-restored-container').html(htmls);
    });
}

export function handleBrowseKey() {
  keyUploadInput.onchange = function (e) {
    switchToAddMode(
      $('.description-box').eq(3),
      $('.key-upload-box'),
      $('.key-box-container'),
      null,
      $('.change-file-box').eq(1),
      $('.custom-file-upload').eq(3),
      $('.key-next-btn')
    );
    keyList.items.clear();
    keyList.items.add(e.target.files[0]);
    renderFiles(
      e.target.files,
      'key-box',
      'delete-key-box',
      'key.js',
      $('.key-box-container'),
      null
    );
  };

  $('.back-btn')
    .eq(2)
    .on('click', function () {
      switchActiveStep(3, 4);
    });

  $('.key-next-btn').on('click', function () {
    const formData = new FormData();
    const password = $('#password-extract').val();
    formData.append('image_file_1', embeddedImageList.files[0]);
    formData.append('image_file_2', embeddedImageList.files[1]);
    formData.append('key_file', keyList.files[0]);
    formData.append('encryption_key', password);
    extractImage(formData, switchToDownloadMode);
    switchActiveStep(5, 4);
  });
}
