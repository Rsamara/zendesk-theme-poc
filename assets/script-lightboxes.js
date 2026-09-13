(function () {
  'use strict';

  const USE_LIGHTBOXES = window.USE_LIGHTBOXES || false
  if (!USE_LIGHTBOXES) {
    return
  }

  document.addEventListener('DOMContentLoaded', async () => {
    const images = document.querySelectorAll('.content img');
    if (images.length) {
      images.forEach((img) => {
        if (!img.closest('a')) {
          // Wrap image
          var a = document.createElement('a');
          a.href = img.src;
          a.setAttribute('data-fancybox', '');

          // Set the caption
          if (img.hasAttribute('alt')) {
            a.setAttribute('data-caption', img.getAttribute('alt'));
          }

          // Insert the anchor element after the image
          img.insertAdjacentElement('afterend', a);
          a.appendChild(img);
        }
      });
    }
  });

})();