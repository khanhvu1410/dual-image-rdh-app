import { checkFileExist } from '../core/file-utils.js';
import {
  switchToAddMode,
  switchToBrowseMode,
  renderFiles,
  switchActiveStep,
} from '../core/upload-helper.js';

const hostUploadInput = document.querySelector('#host-image-upload');
export let hostImageList = new DataTransfer();
const browseModeArgs = [
  $('.description-box').eq(0),
  $('.host-upload-box'),
  $('.host-box-container'),
  $('.add-reset-container').eq(0),
  $('.custom-file-upload').eq(0),
  $('.host-next-btn'),
];

export function removeFile(index, _) {
  hostImageList.items.remove(index);
  if (hostImageList.items.length <= 0) {
    hostUploadInput.files = hostImageList.files;
    switchToBrowseMode(...browseModeArgs);
  }
  renderFiles(
    hostImageList.files,
    'host-image-box',
    'delete-host-box',
    'host.js',
    $('.host-box-container'),
    $('.host-image-number')
  );
}

export function handleBrowseHostImage() {
  hostUploadInput.onchange = async function (e) {
    for (let file of e.target.files) {
      if (!(await checkFileExist(file, hostImageList.files))) {
        hostImageList.items.add(file);
      }
    }
    switchToAddMode(
      $('.description-box').eq(0),
      $('.host-upload-box'),
      $('.host-box-container'),
      $('.add-reset-container').eq(0),
      $('.add-reset-box').eq(0),
      $('.custom-file-upload').eq(0),
      $('.host-next-btn')
    );
    renderFiles(
      hostImageList.files,
      'host-image-box',
      'delete-host-box',
      'host.js',
      $('.host-box-container'),
      $('.host-image-number')
    );
  };

  $('.reset-host-box').on('click', function () {
    hostImageList.items.clear();
    hostUploadInput.files = hostImageList.files;
    switchToBrowseMode(...browseModeArgs);
  });

  $('.host-next-btn').on('click', function () {
    switchActiveStep(1, 0);
  });
}
