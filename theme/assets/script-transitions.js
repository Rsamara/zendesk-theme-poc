(function() {
  'use strict';

  let transitionQueue = new Map();

  function processTransitionQueue () {
    for (const [selector, transitionName] of transitionQueue) {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        elements.forEach(element => {
          applyTransition(element, { name: transitionName });
        });
        transitionQueue.delete(selector);
      }
    }

    if (!transitionQueue.size) {
      document.removeEventListener('template:render', processTransitionQueue);
    }
  }

  function applyTransition (element, transition) {
    element.classList.add('transition', `hover:${transition.name}`);
  }

  document.addEventListener('DOMContentLoaded', () => {
    Object.entries(window.Theme.transitions).forEach(([selector, transitionName]) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        elements.forEach(element => {
          applyTransition(element, { name: transitionName });
        });
      } else {
        transitionQueue.set(selector, transitionName);
      }
    });

    if (transitionQueue.size) {
      document.addEventListener('template:render', processTransitionQueue);
    }
  });

})();