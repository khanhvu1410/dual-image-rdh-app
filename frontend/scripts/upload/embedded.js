import { checkFileExist } from '../core/file-utils.js';
import {
  switchToAddMode,
  switchToBrowseMode,
  renderFiles,
  switchActiveStep,
} from '../core/upload-helper.js';
import { formatBytes } from '../core/file-utils.js';

const embeddedUploadInput = document.querySelector('#embedded-image-upload');
export const embeddedImageList = new DataTransfer();
const browseModeArgs = [
  $('.description-box').eq(2),
  $('.embedded-upload-box'),
  $('.embedded-box-container'),
  $('.add-reset-container').eq(1),
  $('.custom-file-upload').eq(2),
  $('.embedded-next-btn'),
];

export function removeFile(index, id) {
  embeddedImageList.items.remove(index);
  $(`#${id}`).remove();
  if (embeddedImageList.items.length <= 0) {
    embeddedUploadInput.files = embeddedImageList.files;
    switchToBrowseMode(...browseModeArgs);
  }
  const files = embeddedImageList.files;
  let sumSize = 0;
  for (let i = 0; i < files.length; i++) {
    sumSize += files[i].size;
  }
  if (files.length > 1) {
    $('.embedded-image-number').text(
      `${files.length} files, ${formatBytes(sumSize)}`
    );
  } else {
    $('.embedded-image-number').text(`${files.length} file`);
  }
}

export function handleBrowseEmbeddedImage() {
  embeddedUploadInput.onchange = async function (e) {
    for (let file of e.target.files) {
      if (
        !(await checkFileExist(file, embeddedImageList.files)) &&
        embeddedImageList.files.length < 2
      ) {
        embeddedImageList.items.add(file);
      }
    }
    switchToAddMode(
      $('.description-box').eq(2),
      $('.embbeded-upload-box'),
      $('.embedded-box-container'),
      $('.add-reset-container').eq(1),
      $('.add-reset-box').eq(1),
      $('.custom-file-upload').eq(2),
      $('.embedded-next-btn')
    );
    renderFiles(
      embeddedImageList.files,
      'embedded-image-box',
      'delete-embedded-box',
      'embedded.js',
      $('.embedded-box-container'),
      $('.embedded-image-number')
    );
  };

  $('.reset-embedded-box').on('click', function () {
    embeddedImageList.items.clear();
    embeddedUploadInput.files = embeddedImageList.files;
    switchToBrowseMode(...browseModeArgs);
  });

  $('.embedded-next-btn').on('click', function () {
    switchActiveStep(4, 3);
  });
}
