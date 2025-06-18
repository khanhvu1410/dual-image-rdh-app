import { formatBytes, shortenName } from './file-utils.js';

export function renderFiles(
  files,
  fileBox,
  deleteBox,
  moduleName,
  boxContainer,
  fileNumber
) {
  let maxLength = 11;
  if (fileNumber == null) {
    maxLength = 20;
  }

  let htmls = '';
  let sumSize = 0;
  for (let i = 0; i < files.length; i++) {
    let id = `${fileBox}-${i}`;
    let imgElement = isImageFile(files[i])
      ? `<img class="image-preview" src=${URL.createObjectURL(files[i])} />`
      : `<div class="file-type-box">${shortenName(
          files[i].type.split('application/')[1],
          11
        )}</div>`;
    htmls += `
      <div class="${fileBox}" id="${id}">   
        <p>${shortenName(files[i].name, maxLength)}</p>      
        ${imgElement}
        <p style="color:rgb(135, 135, 135)">${formatBytes(files[i].size)}</p>
        <div class="${deleteBox}" onclick="import('./scripts/upload/${moduleName}').then(module => module.removeFile(${i}, '${id}'))">
          x
        </div>
      </div>
    `;
    sumSize += files[i].size;
  }

  boxContainer.html(htmls);

  if (fileNumber != null) {
    if (files.length > 1) {
      fileNumber.text(`${files.length} files, ${formatBytes(sumSize)}`);
    } else {
      fileNumber.text(`${files.length} file`);
    }
  }
}

function isImageFile(file) {
  const acceptedImageTypes = [
    'image/jpeg',
    'image/png',
    'image/bmp',
    'image/gif',
    'image/webp',
    'image/svg+xml',
  ];
  return acceptedImageTypes.includes(file.type);
}

function enableButton(button) {
  button.css({
    'background-color': 'rgb(70, 70, 83)',
    color: 'rgb(255, 255, 255)',
  });

  button
    .on('mouseenter', function () {
      $(this).css({
        cursor: 'pointer',
        'background-color': 'rgb(73, 73, 73)',
        color: 'rgb(255, 255, 255)',
      });
    })
    .on('mouseleave', function () {
      $(this).css({
        cursor: 'auto',
        'background-color': 'rgb(70, 70, 83)',
        color: 'rgb(255, 255, 255)',
      });
    });
}

export function disableButton(button) {
  button.css({
    'background-color': 'rgb(230, 230, 230)',
    color: 'rgb(135, 135, 135)',
  });

  button.off('mouseenter mouseleave');
}

export function switchToAddMode(
  descriptionBox,
  uploadBox,
  boxContainer,
  addResetContainer,
  addResetBox,
  customFileUpload,
  nextBtn
) {
  descriptionBox.hide();
  uploadBox.hide();
  boxContainer.show();

  if (addResetContainer != null) {
    addResetContainer.show();
    addResetBox.prepend(customFileUpload);
    customFileUpload.children().eq(0).attr('src', 'assets/icons/add.svg');
    customFileUpload.children().eq(1).text('Add Files');
  } else {
    addResetBox.show();
    addResetBox.prepend(customFileUpload);
    customFileUpload.children().eq(1).text('Change File');
  }
  nextBtn.prop('disabled', false);
  enableButton(nextBtn);
}

export function switchToBrowseMode(
  descriptionBox,
  uploadBox,
  boxContainer,
  addResetContainer,
  customFileUpload,
  nextBtn
) {
  descriptionBox.show();
  uploadBox.show();

  boxContainer.hide();
  addResetContainer.hide();

  uploadBox.prepend(customFileUpload);
  customFileUpload.children().eq(0).attr('src', 'assets/icons/file.svg');
  customFileUpload.children().eq(1).text('Browse Files');

  nextBtn.prop('disabled', true);
  disableButton(nextBtn);
}

export function switchToDownloadMode(
  downloadBtn,
  zipFileBox,
  hidingDownloadUrl,
  zipFileName
) {
  downloadBtn.attr({
    href: `${hidingDownloadUrl}`,
    download: `${zipFileName}`,
  });

  zipFileBox.html(`
    <img class="lock-icon" src="assets/icons/lock.svg" alt="lock-icon">
    <p><span class="zip-file-name">${zipFileName}</span> was loaded successfully and ready to download</p>
  `);

  downloadBtn.removeClass('disable-click');
  enableButton(downloadBtn);
}

export function switchToErrorMode(zipFileBox, isEmbedding) {
  zipFileBox.css({
    'background-color': 'rgb(253, 236, 234)',
    color: 'rgb(97, 26, 21)',
  });

  zipFileBox.html(`
    <img class="error-icon" src="assets/icons/error.svg" alt="error-icon">
    <p>${
      isEmbedding
        ? 'We couldn’t hide your data properly. Please try again.'
        : 'We couldn’t restore your data properly. Please try again.'
    }</p>
`);
}

export function switchActiveStep(activeIndex, inactiveIndex) {
  $('.step-label').eq(activeIndex).css('color', 'rgb(0, 0, 0)');
  $('.step-label').eq(inactiveIndex).css('color', '');

  $('.slide-box').eq(activeIndex).slideDown();
  $('.slide-box').eq(inactiveIndex).slideUp();

  $('.number-box').eq(activeIndex).css('background-color', 'rgb(84, 84, 84)');
  $('.number-box')
    .eq(inactiveIndex)
    .css('background-color', 'rgb(150, 150, 150)');
}
