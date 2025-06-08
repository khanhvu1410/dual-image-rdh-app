import { handleBrowseHostImage } from './upload/host.js';
import { handleBrowseHiddenImage } from './upload/hidden.js';
import { handleDownloadZipFile } from './upload/file-download.js';
import { handleBrowseEmbeddedImage } from './upload/embedded.js';
import { handleBrowseKey } from './upload/key.js';

$(function () {
  toastr.options = {
    positionClass: 'toast-custom-position',
    timeOut: '5000',
    closeButton: true,
  };

  $('.hiding-box').css('color', 'rgb(63, 63, 63)');

  handleClickOptionBox();

  hidingInitialSetup();

  restoringInitialSetup();

  handleBrowseHostImage();

  handleBrowseHiddenImage();

  handleDownloadZipFile();

  handleBrowseEmbeddedImage();

  handleBrowseKey();
});

function handleClickOptionBox() {
  $('.hiding-box').on('click', function () {
    $('.process-container').eq(0).show();
    $('.process-container').eq(1).hide();
    $(this).css({
      'background-color': 'rgb(255, 255, 255)',
      'border-radius': '8px',
      'box-shadow': '2px 2px rgba(224, 224, 224, 0.2)',
      color: 'rgb(63, 63, 63)',
    });
    $('.restoring-box').css({
      'background-color': 'rgb(240, 240, 240)',
      'border-radius': '',
      'box-shadow': '',
      color: '',
    });
  });

  $('.restoring-box').on('click', function () {
    $('.process-container').eq(0).hide();
    $('.process-container').eq(1).show();
    $(this).css({
      'background-color': 'rgb(255, 255, 255)',
      'border-radius': '8px',
      'box-shadow': '2px 2px rgba(224, 224, 224, 0.2)',
      color: 'rgb(63, 63, 63)',
    });
    $('.hiding-box').css({
      'background-color': 'rgb(240, 240, 240)',
      'border-radius': '',
      'box-shadow': '',
      color: '',
    });
  });
}

function hidingInitialSetup() {
  $('.step-label').eq(0).css('color', 'rgb(0, 0, 0)');

  $('.host-next-btn').prop('disabled', true);
  $('.hidden-next-btn').prop('disabled', true);

  $('.host-box-container').hide();
  $('.add-reset-container').eq(0).hide();

  $('.slide-box').eq(1).hide();
  $('.hidden-box-container').hide();
  $('.change-file-box').eq(0).hide();

  $('.slide-box').eq(2).hide();
  $('.border-box').eq(2).css('border', 'none');

  $('.number-box').eq(1).css('background-color', 'rgb(150, 150, 150)');
  $('.number-box').eq(2).css('background-color', 'rgb(150, 150, 150)');
}

function restoringInitialSetup() {
  $('.step-label').eq(3).css('color', 'rgb(0, 0, 0)');

  $('.process-container').eq(1).hide();

  $('.embedded-box-container').hide();
  $('.add-reset-container').eq(1).hide();

  $('.slide-box').eq(4).hide();
  $('.key-box-container').hide();
  $('.change-file-box').eq(1).hide();

  $('.slide-box').eq(5).hide();
  $('.border-box').eq(5).css('border', 'none');

  $('.number-box').eq(4).css('background-color', 'rgb(150, 150, 150)');
  $('.number-box').eq(5).css('background-color', 'rgb(150, 150, 150)');
}
