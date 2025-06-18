import { hidingDownloadUrl } from './hidden.js';
import { restoringDownloadUrl } from './key.js';
import { switchActiveStep, disableButton } from '../core/upload-helper.js';

function handleBackBtnClick(zipFileBox, downloadBtn) {
  zipFileBox.css({
    'background-color': 'rgb(237, 247, 237)',
    color: 'rgb(30, 70, 32)',
  });

  zipFileBox.html(`
        <div class="loader"></div>
        <p>Loading file, please wait...</p>
    `);

  downloadBtn.addClass('disable-click');
  disableButton(downloadBtn);
}

export function handleDownloadZipFile() {
  $('.back-btn')
    .eq(1)
    .on('click', function () {
      switchActiveStep(1, 2);
      handleBackBtnClick($('.zip-file-box').eq(0), $('.download-btn').eq(0));
    });

  $('.download-btn')
    .eq(0)
    .on('click', function () {
      setTimeout(function () {
        URL.revokeObjectURL(hidingDownloadUrl);
      }, 100);
    });

  $('.back-btn')
    .eq(3)
    .on('click', function () {
      switchActiveStep(4, 5);
      handleBackBtnClick($('.zip-file-box').eq(1), $('.download-btn').eq(1));
    });

  $('.download-btn')
    .eq(1)
    .on('click', function () {
      setTimeout(function () {
        URL.revokeObjectURL(restoringDownloadUrl);
      }, 100);
    });
}
