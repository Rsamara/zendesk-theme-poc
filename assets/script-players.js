(function () {
  'use strict';

  const USE_CUSTOM_PLAYER = window.USE_CUSTOM_PLAYER || false
  if (!USE_CUSTOM_PLAYER) {
    return
  }

  const youTubePattern = /(?:https?:\/\/)?(?:www\.)?(youtube\.com|youtu\.be|youtube-nocookie\.com)\/(?:embed|watch|v|.+?v=)?\/?([\w-]{11})/i;
  const vimeoPattern = /(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(?:channels\/[\w]+\/|video\/|)([\d]+)/i;
  const wistiaPattern = /(?:https?:\/\/)?(?:fast\.)?wistia\.(?:net|com)\/(?:embed\/iframe|medias)\/([\w]+)/i;

  const createPlayer = async function (player) {
    const wrapper = document.createElement('div');
    player.parentNode.insertBefore(wrapper, player);
    wrapper.appendChild(player);
    new Plyr(wrapper);
  }

  const makePlayerResponsive = function (player) {
    if (player.closest('.ratio-16-9') !== null) {
      return;
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'ratio ratio-16-9';
    player.parentNode.insertBefore(wrapper, player);
    wrapper.appendChild(player);
  }

  document.addEventListener('DOMContentLoaded', async () => {
    const iframes = Array.prototype.slice.call(document.querySelectorAll('iframe'));

    // Make Wistia players responsive
    const wistiaPlayers = iframes.filter(iframe => wistiaPattern.test(iframe.src));
    if (wistiaPlayers.length) {
      wistiaPlayers.forEach(makePlayerResponsive)
    }

    // Make YouTube and Vimeo players responsive (or play in Plyr player)
    const supportedPlayers = iframes.filter(iframe => youTubePattern.test(iframe.src) || vimeoPattern.test(iframe.src));
    if (supportedPlayers.length) {
      if (USE_CUSTOM_PLAYER) {
        window.Plyr = window.Plyr || (await import('plyr')).default;
        await Util.importStyleSheet('plyr');
        supportedPlayers.forEach(createPlayer);
      } else {
        supportedPlayers.forEach(makePlayerResponsive);
      }
    }
  });

})();