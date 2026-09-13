(function () {
  'use strict';

  const ANIMATION_THRESHOLD = 0;
  const ANIMATION_DELAY = 0.1;

  const observer = new IntersectionObserver(handleIntersect, {
    root: null,
    rootMargin: '-100px 0px 0px 0px',
    threshold: ANIMATION_THRESHOLD
  });

  const handledGroups = new Set();
  const animationQueue = new Map();

  function handleIntersect (entries, observer) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;

        if (el.dataset.animationGroup) {
          const groupId = el.dataset.animationGroup;
          if (!handledGroups.has(groupId)) {
            handledGroups.add(groupId);
          }

          // Animate all children within this group
          const groupElements = document.querySelectorAll(`[data-animation-group="${groupId}"][data-animation]`);
          groupElements.forEach((groupElement, index) => {
            // Only animate the group container if it has its own animation
            if (groupElement !== el || el.dataset.animation) {
              applyAnimation(groupElement, { name: groupElement.dataset.animation }, index);
            }
          });

          // Look for nested animation groups inside this group
          groupElements.forEach(child => {
            if (
              child !== el &&
              child.dataset.animationGroup &&
              !handledGroups.has(child.dataset.animationGroup) &&
              child.querySelectorAll('[data-animation]').length > 0
            ) {
              observer.observe(child);
            }
          });
        } else if (el.dataset.animation) {
          // Animate a single element
          applyAnimation(el, { name: el.dataset.animation });
        }

        observer.unobserve(el);
      }
    });
  }

  function processAnimationQueue () {
    for (const [selector, animationName] of animationQueue) {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        applyGroupAnimations(elements, { selector, name: animationName });
        animationQueue.delete(selector);
      }
    }

    if (!animationQueue.size) {
      document.removeEventListener('template:render', processAnimationQueue);
    }
  }

  function applyGroupAnimations (elements, animation) {
    // Parse the selector to identify if it's compound
    const selectorParts = animation.selector.trim().split(' ');
    const isCompoundSelector = selectorParts.length > 1;

    const groupId = `group-${Math.random().toString(36).substr(2, 9)}`;

    if (isCompoundSelector) {
      // The first part should be an ID selector
      const parentSelector = selectorParts[0];
      const childSelector = selectorParts.slice(1).join(' ');
      const parent = document.querySelector(parentSelector);

      if (parent) {
        // Only assign a group id if it doesn't already have one
        if (!parent.dataset.animationGroup) {
          parent.dataset.animationGroup = groupId;
        }

        // Find all child elements within the parent that match the rest of the selector
        const childElements = parent.querySelectorAll(childSelector);
        childElements.forEach(el => {
          // If this child is not a group container, assign the parent's group ID
          // otherwise, let nested group containers keep their own group ID
          if (!el.dataset.animationGroup) {
            setupElement(el, parent.dataset.animationGroup, animation.name);
          }
        });

        observer.observe(parent);
      }

    } else {
      // Handle individual elements
      elements.forEach(el => {
        setupElement(el, null, animation.name);
        observer.observe(el);
      });
    }
  }

  function setupElement (el, groupId, animationName) {
    if (groupId && !el.dataset.animationGroup) {
      el.dataset.animationGroup = groupId;
    }
    el.dataset.animation = animationName;
    el.style.opacity = '0';
    el.classList.add('animation');
  }

  function applyAnimation (el, animation, index = 0) {
    const delay = index * ANIMATION_DELAY;
    el.style.animationDelay = `${delay}s`;
    el.classList.add('animated', `animation:${animation.name}`);
    el.style.opacity = '';

    const handleAnimationEnd = () => {
      el.removeEventListener('animationend', handleAnimationEnd);
      el.classList.remove(`animation:${animation.name}`);
    };

    el.addEventListener('animationend', handleAnimationEnd);
  }

  document.addEventListener('DOMContentLoaded', () => {
    const animations = window.Theme?.animations || {};

    Object.entries(animations)
      .filter(([selector, animationName]) => {
        return selector && animationName && typeof selector === 'string' && typeof animationName === 'string';
      })
      .forEach(([selector, animationName]) => {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          applyGroupAnimations(elements, { selector, name: animationName });
        } else {
          animationQueue.set(selector, animationName);
        }
      });

    if (animationQueue.size) {
      document.addEventListener('template:render', processAnimationQueue);
    }
  });
})();