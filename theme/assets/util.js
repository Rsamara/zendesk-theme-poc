// True if debug mode is enabled
const DEBUG = window.DEBUG = (window.DEBUG|| false);

// Utilities
const Util = (function() {
  'use strict';

  const MINUTE = 1000 * 60;
  const HOUR = MINUTE * 60;

  // Current locale specified in document_head.hbs
  const LOCALE = Theme.locale;

  // Key codes used in event handlers
  const KEYS = {
    ENTER: 13,
    ESCAPE: 27,
    SPACE: 32,
    UP: 38,
    DOWN: 40,
    TAB: 9
  };

  const CLASS_NAMES = {
    ACTIVE: 'is-active',
    FOCUS: 'is-focused',
    DISABLED: 'is-disabled',
    VISIBLE: 'is-visible',
    INVISIBLE: 'invisible',
    SHOWN: 'is-shown',
    COLLAPSE: 'collapse',
    COLLAPSING: 'collapsing',
    EXPANDED: 'is-expanded',
    HIDDEN: 'is-hidden',
    STICKY: 'sticky-top',
    STUCK: 'is-stuck',
    UNSTUCK: 'is-unstuck',
    FILLED: 'is-filled',
  };

  const SELECTORS = {
    NAV: '.nav',
    COLLAPSE: '[data-toggle="collapse"]',
    TAB: '[data-toggle="tab"]',
    TABS: '.js-tabs, [data-element="tabs"]',
    TOGGLES: '.js-toggles, [data-element="toggles"]',
    CAROUSEL: '.js-carousel, [data-element="carousel"]',
    TABLE_OF_CONTENTS: '[data-element="table-of-contents"]',
    BACK_TO_TOP: '[data-element="back-to-top"]',
    SCROLLSPY: '[data-spy="scroll"]',
    STICKY: '[data-element="sticky"]',
    SYSTEM_STATUS: '[data-element="system-status"]',
    MAP: '.js-map',
    SEARCH_FORM: 'form[role="search"]',
    SEARCH_FIELD: 'input[type="search"]'
  };

  const IDS = {
    FOCUS: 'returnFocusTo'
  };

  const EVENTS = {
    INITIALIZE: 'initialize',
    RENDER: 'render',
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    VISIBLE: 'visible',
    INVISIBLE: 'invisible',
    SHOW: 'show',
    SHOWN: 'shown',
    HIDE: 'hide',
    HIDDEN: 'hidden',
    STUCK: 'stuck',
    UNSTUCK: 'unstuck',
    NEXT: 'next',
    PREVIOUS: 'previous',
  };

  const EXTENSIONS = {
    COLLAPSE: 'collapse',
    SCROLLSPY: 'scrollspy',
    STICKY: 'sticky',
    TAB: 'tab',
    TABS: 'tabs',
    TOGGLES: 'toggles',
    CAROUSEL: 'carousel',
    TABLE_OF_CONTENTS: 'tableOfContents',
    NOTIFICATION: 'notification',
    BACK_TO_TOP: 'backToTop',
    SYSTEM_STATUS: 'systemStatus',
    MAP: 'map'
  };

  const VIDEO_PROVIDERS = {
    YOUTUBE: 'YouTube',
    VIMEO: 'Vimeo',
    WISTIA: 'Wistia'
  }

  const API = {

    // Constants
    minute: MINUTE,
    hour: HOUR,
    locale: LOCALE,
    keys: KEYS,
    classNames: {
      ...CLASS_NAMES,

      row (number_columns = 1) {
        let classNames = 'row-cols-12';
        if (number_columns >= 2) classNames += ' md:row-cols-6';
        if (number_columns >= 3) classNames += ' lg:row-cols-4';
        if (number_columns >= 4) classNames += ' xl:row-cols-3';
        return classNames;
      },

      column (number_columns = 1) {
        let classNames = 'col-12';
        if (number_columns >= 2) classNames += ' md:col-6';
        if (number_columns >= 3) classNames += ' lg:col-4';
        if (number_columns >= 4) classNames += ' xl:col-3';
        return classNames;
      },

      list (list_style) {
        switch (list_style) {
          case 'bullet': return 'list-disc';
          case 'unstyled': return 'list-unstyled';
          case 'bordered': return 'list-unstyled list-bordered';
          default: return 'list-unstyled';
        }
      },

      justify (alignment = 'left') {
        if (alignment === 'center') return 'justify-content-center';
        return 'justify-content-start'
      },

      align (alignment = 'left') {
        if (alignment === 'center') return 'align-items-center';
        return 'align-items-start'
      },

      textAlign (alignment = 'left') {
        if (alignment === 'center') return 'text-center';
        return 'text-left'
      }
    },
    selectors: SELECTORS,
    ids: IDS,
    events: EVENTS,
    extensions: EXTENSIONS,
    videoProviders: VIDEO_PROVIDERS,

    // Prints to the browser console if debugging is enabled
    log () {
      if (DEBUG === true) {
        console.log.apply(this, arguments);
      }
    },

    // Returns a localized string
    i18n (key, context) {
      const l18n = window.Theme.l18n || {};
      let template = l18n[key] || key;

      // Replace placeholders with context values
      if (context && typeof context === 'object') {
        Object.keys(context).forEach((key) => {
          template = template.replace(new RegExp(`{${key}}`, 'g'), context[key]);
        });
      }

      return template
    },

    // Returns a new unique ID
    generateId () {
      const time = Date.now().toString(36);
      const random = Math.random().toString(36).substring(2, 8);
      return `${time}${random}`;
    },

    // Returns a given value's type
    typeOf (value) {
      return {}.toString.call(value).match(/\s([a-z]+)/i)[1].toLowerCase();
    },

    // Returns an object composed of properties from another object
    pick (obj, props) {
      let picked = {};
      if (!obj) return picked;
      if (!props || !props.length) return obj;
      props.forEach((prop) => {
        if (obj.hasOwnProperty(prop)) picked[prop] = obj[prop];
      });
      return picked;
    },

    // Returns a potentially nested object property, if it exists
    getProperty (object, propertyPath) {
      try {
        return propertyPath.split('.').reduce((obj, key) => obj[key], object);
      } catch (error) {
        return null;
      }
    },

    // Returns the values that are the intersection of two arrays
    intersection (x, y) {
      return x.filter((value) => y.includes(value));
    },

    // Returns a function that will be called after it stops being called for `wait` milliseconds
    debounce (callback, wait) {
      let timeoutId = null;
      return (...args) => {
        window.clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => {
          callback.apply(null, args);
        }, wait);
      }
    },

    // Throttles a given function to be called at most once every `limit` milliseconds
    throttle (func, limit) {
      let inThrottle;
      return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
          func.apply(context, args);
          inThrottle = true;
          setTimeout(() => {
            return inThrottle = false;
          }, limit);
        }
      }
    },

    // Extends a target object with properties from one or more source objects
    extend (target, ...sources) {
      let output = Object.assign({}, target);
      sources.forEach(source => {
        if (API.isObject(target) && API.isObject(source)) {
          Object.keys(source).forEach(key => {
            if (API.isObject(source[key])) {
              if (!(key in target)) {
                let obj = {};
                obj[key] = source[key];
                Object.assign(output, obj);
              } else {
                if (API.isElement(source[key])) {
                  output[key] = source[key];
                } else {
                  output[key] = Util.extend(target[key], source[key]);
                }
              }
            } else {
              output[key] = source[key];
            }
          });
        }
      });
      return output;
    },

    // Returns true if the given item is an object
    isObject (obj) {
      return (obj && typeof obj === 'object' && !Array.isArray(obj));
    },

    // Returns true if the given object is an HTML element
    isElement (obj) {
      return obj instanceof Element || obj instanceof HTMLDocument;
    },

    // Returns the object ID associated with the current URL (or the one specified)
    getPageId (url = Util.getPageUrl()) {
      const links = url.split('/');
      let result = links[links.length - 1];
      // If the last element is empty (due to trailing slash), get the second-to-last element
      if (result === '') {
        result = links[links.length - 2];
      }
      return parseInt(result, 10) || null;
    },

    // Returns the current page URL
    getPageUrl () {
      return window.PAGE_URL || window.location.href
    },

    // Returns true if the current URL (or the one specified) is the Home page
    isHomePage (url = Util.getPageUrl()) {
      return /^http(s)?:\/\/[^\/?#]+(\/hc(\/[a-z-0-9_]+)?(\/)?(signin)?([?]([^?\/]+)?)?([#]([^#\/]+)?)?)?$/.test(url);
    },

    // Returns true if the current URL (or the one specified) is a category
    isCategoryPage (url = Util.getPageUrl()) {
      return /\/hc\/([a-z-0-9_]+\/)?categories\//i.test(url);
    },

    // Returns true if the current URL (or the one specified) is a section
    isSectionPage (url = Util.getPageUrl()) {
      return /\/hc\/([a-z-0-9_]+\/)?sections\//i.test(url);
    },

    // Returns true if the current URL (or the one specified) is an article
    isArticlePage (url = Util.getPageUrl()) {
      return /\/hc\/([a-z-0-9_]+\/)?articles\//i.test(url);
    },

    // Returns true if the current URL (or the one specified) is the Search Results page
    isSearchResultsPage (url = Util.getPageUrl()) {
      return /\/hc\/([a-z-0-9_]+\/)?search\?*.*/i.test(url);
    },

    // Returns true if the current URL (or the one specified) is the New Request page
    isNewRequestPage (url = Util.getPageUrl()) {
      return /\/hc\/([a-z-0-9_]+\/)?requests\/new(\/)?([?#].*)?$/i.test(url);
    },

    // Returns true if the current URL (or the one specified) is the Request List page
    isRequestListPage (url = Util.getPageUrl()) {
      return /\/hc\/([a-z-0-9_]+\/)?requests(\/)?([?#].*)?$/i.test(url);
    },

    // Returns true if the current URL (or the one specified) is the Request page
    isRequestPage (url = Util.getPageUrl()) {
      return (!this.isNewRequestPage(url) && /\/hc\/([a-z-0-9_]+\/)?requests\/[^/?#]+(\/)?([?#].*)?$/i.test(url));
    },

    // Returns true if the current URL (or the one specified) is the Community Topic List page
    isTopicListPage (url = Util.getPageUrl()) {
      return /\/hc\/([a-z-0-9_]+\/)?community\/topics(\/)?([?#].*)?$/i.test(url);
    },

    // Returns true if the current URL (or the one specified) is the Community Post List page
    isPostListPage (url = Util.getPageUrl()) {
      return /\/hc\/([a-z-0-9_]+\/)?community\/posts(\/)?([?#].*)?$/i.test(url);
    },

    // Returns true if the current URL (or the one specified) is the Community Topic page
    isTopicPage (url = Util.getPageUrl()) {
      return /\/hc\/([a-z-0-9_]+\/)?community\/topics\/[^\/?#]+(\/)?([?#].*)?$/i.test(url);
    },

    // Returns true if the current URL (or the one specified) is the Community Post page
    isPostPage (url = Util.getPageUrl()) {
      return !API.isNewPostPage(url) && /\/hc\/([a-z-0-9_]+\/)?community\/posts\/[^\/?#]+(\/)?([?#].*)?$/i.test(url);
    },

    // Returns true if the current URL (or the one specified) is the Community New Post page
    isNewPostPage (url = Util.getPageUrl()) {
      return /\/hc\/([a-z-0-9_]+\/)?community\/posts\/new(\/)?([?#].*)?$/i.test(url);
    },

    // Returns true if the current URL (or the one specified) is the User Profile page
    isUserProfilePage (url = Util.getPageUrl()) {
      return /\/hc\/([a-z-0-9_]+\/)?profiles\/[^\/?#]+(\/)?([?#].*)?$/i.test(url);
    },

    // Sorts objects by created date (ascending)
    sortByDateAscending (a, b) {
      return new Date(a['created_at']) - new Date(b['created_at']);
    },

    // Sorts objects by created date (descending)
    sortByDateDescending (a, b) {
      return new Date(b['created_at']) - new Date(a['created_at']);
    },

    // Sorts objects by position and created date
    sortManually (a, b) {
      // Sort by position first
      const positionComparison = (a.position || 0) - (b.position || 0);

      // If positions are equal, sort by created date
      if (positionComparison === 0) {
        return new Date(b['created_at']) - new Date(a['created_at']);
      }

      // Otherwise, return the result of the position comparison
      return positionComparison;
    },

    // Sorts objects by position
    sortByPosition (a, b) {
      return (a.position || 0) - (b.position || 0);
    },

    // Sorts objects by name or title (ascending)
    sortByNameAscending (a, b) {
      const nameA = (a.title || a.name || '').toLowerCase();
      const nameB = (b.title || b.name || '').toLowerCase();
      return nameA.localeCompare(nameB);
    },

    // Sorts objects by name or title (descending)
    sortByNameDescending (a, b) {
      if ((a.title || a.name) > (b.title || b.name)) return -1;
      if ((a.title || a.name) < (b.title || b.name)) return 1;
      return 0;
    },

    // Sorts objects by promoted status
    sortByPromoted (a, b) {
      if (a.promoted === b.promoted) {
        return 0;
      }
      return a.promoted ? -1 : 1;
    },

    // Returns the value of a named URL parameter
    getURLParameter (name, url = location.search) {
      name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
      const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
      const results = regex.exec(url);
      return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    },

    // Sets the value of a named URL parameter
    setURLParameter (url, name, value) {
      name = encodeURIComponent(name);
      value = encodeURIComponent(value);

      const baseUrl = url.split('?')[0];
      const newParam = name + '=' + value;
      const urlQueryString = (url.split('?')[1] === undefined) ? '' : '?' + url.split('?')[1];
      let params = '?' + newParam;

      if (urlQueryString) {
        const updateRegex = new RegExp('([\?&])' + name + '[^&]*');
        const removeRegex = new RegExp('([\?&])' + name + '=[^&;]+[&;]?');
        if (typeof value === 'undefined' || value === null || value === '') {
          params = urlQueryString.replace(removeRegex, "$1");
          params = params.replace(/[&;]$/, "");
        } else if (urlQueryString.match(updateRegex) !== null) {
          params = urlQueryString.replace(updateRegex, "$1" + newParam);
        } else if (urlQueryString === '') {
          params = `?${newParam}`;
        } else {
          params = `${urlQueryString}&${newParam}`;
        }
      }
      params = params === '?' ? '' : params;
      return baseUrl + params;
    },

    // Returns a promise that returns all images once they are loaded
    onImagesLoaded (el = document) {
      const images = Array.prototype
        .slice.call(el.querySelectorAll('img'))
        .filter((img) => !img.complete)
      const promises = images
        .map((img) => {
          return new Promise((resolve, reject) => {
            img.addEventListener('load', function() { return resolve(img) });
            img.addEventListener('error', function() { return reject(img) });
          });
        });
      return Promise.all(promises);
    },

    // Calls a given function once when a transition ends on the target elemen
    onTransitionEnd (el, callback) {
      if (!el || !callback || typeof callback !== 'function') {
        return;
      }
      let called = false;
      const _this = this;

      el.addEventListener('transitionend', function endTransition(e) {
        if (e.target !== el) {
          return;
        }
        called = true;
        el.removeEventListener('transitionend', endTransition, false);
        callback.call(_this, e);
      }, false)

      setTimeout(() => {
        if (!called) {
          API.triggerEvent(el, 'transitionend');
        }
      }, API.getTransitionDuration(el));
    },

    // Returns the transition duration in ms for a given element
    getTransitionDuration (el) {
      if (!el) return 0;
      const computedStyle = getComputedStyle(el);
      const transitionDuration = parseFloat(computedStyle.transitionDuration);
      const transitionDelay = parseFloat(computedStyle.transitionDelay);
      if (!transitionDuration && !transitionDelay) return 0;
      return (transitionDuration + transitionDelay) * 1000;
    },

    // Scrolls a given element into view
    scrollIntoView (el, offset, scrollElement) {
      offset = parseInt(offset, 10) || 0;
      scrollElement = scrollElement || window;
      if (!el) {
        return;
      }
      if (offset) {
        const targetElementPosition = el.getBoundingClientRect().top;
        const scrollTop = scrollElement === window ? scrollElement.pageYOffset : scrollElement.scrollTop;
        const scrollElementOffset = scrollElement === window ? 0 : scrollElement.offsetTop;
        const offsetPosition = targetElementPosition - offset + scrollTop - scrollElementOffset;
        scrollElement.scrollTo({ top: offsetPosition, behavior: 'smooth' });
      } else if (typeof el.scrollIntoView === 'function') {
        el.scrollIntoView({ block: 'start', inline: 'nearest', behavior: 'smooth' });
      }
    },

    // Maybe replace an image with an inline SVG
    async replaceWithSVG (imgElement) {
      if (!(imgElement instanceof HTMLImageElement)) {
        throw new Error('Input must be an HTML Image Element');
      }

      // Do nothing if the image element does not have a src attribute
      if (!imgElement.src) {
        throw new Error('Image must have a src attribute');
      }

      try {
        const response = await fetch(imgElement.src);
        if (!response.ok) {
          throw new Error(`Failed to fetch SVG: ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type');
        const isSVGByContentType = contentType && contentType.includes('image/svg+xml');
        const content = await response.text();

        // Validate that this is actually SVG content by checking for key SVG indicators
        const hasSVGTag = /<svg[^>]*>/i.test(content);
        const hasXMLNamespace = content.includes('xmlns="http://www.w3.org/2000/svg"');
        if (!isSVGByContentType && !(hasSVGTag && hasXMLNamespace)) {
          throw new Error('Content does not appear to be a valid SVG');
        }

        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(content, 'image/svg+xml');
        const parserError = svgDoc.querySelector('parsererror');
        if (parserError) {
          throw new Error('SVG parsing failed');
        }

        // Get the SVG element
        const svgElement = svgDoc.querySelector('svg');
        if (!svgElement) {
          throw new Error('No SVG element found in content');
        }

        // Copy original image attributes to SVG
        const attributes = ['class', 'id', 'width', 'height', 'title', 'aria-label', 'role', 'style'];
        attributes.forEach(attr => {
          if (imgElement.hasAttribute(attr)) {
            svgElement.setAttribute(attr, imgElement.getAttribute(attr));
          }
        });

        // Ensure SVG has width and height if not present
        if (!svgElement.hasAttribute('width') && imgElement.width) {
          svgElement.setAttribute('width', imgElement.width);
        }
        if (!svgElement.hasAttribute('height') && imgElement.height) {
          svgElement.setAttribute('height', imgElement.height);
        }

        // Replace the image with the SVG element
        imgElement.parentNode.replaceChild(svgElement, imgElement);

        return svgElement;
      } catch (error) {
        console.error('Error inlining SVG:', error);
        return null;
      }
    },

    // Force reflow on a given element
    reflow (el) {
      return el.offsetHeight;
    },

    // Triggers a new custom event on the specified element
    triggerEvent (el, eventName, data) {
      if (!eventName) {
        return;
      }
      const event = new CustomEvent(eventName, { bubbles: true, cancelable: true, detail: data || {} });
      (el || window).dispatchEvent(event);
      return event;
    },

    // Returns the selector for a given element, based on the `data-target` or `href` properties
    getSelectorFromElement (el) {
      let selector = el.getAttribute('data-target');
      if (!selector || selector === '#') {
        const hrefAttr = el.getAttribute('href');
        selector = hrefAttr && hrefAttr !== '#' ? hrefAttr.trim() : '';
      }
      try {
        return document.querySelector(selector) ? selector : null;
      } catch (err) {
        return null;
      }
    },

    convertElementToDataObject (element, propertyMappings) {
      const dataObject = {};
      if (!propertyMappings) {
        console.error('No property mappings were provided');
        return dataObject;
      }

      Object.keys(propertyMappings).forEach(propertyName => {
        const propertyConfig = propertyMappings[propertyName];
        let elementSelector = propertyConfig.selector;
        let attribute = propertyConfig.attribute || 'textContent';
        let nestedMappings = propertyConfig.nestedMappings;
        const mappedElements = !elementSelector ? [element] : element.querySelectorAll(elementSelector);

        if (mappedElements.length > 1 || propertyConfig.array === true) {
          dataObject[propertyName] = Array.from(mappedElements, mappedElement => {
            if (nestedMappings) {
              return Util.convertElementToDataObject(mappedElement, nestedMappings);
            } else {
              return mappedElement.getAttribute(attribute) || mappedElement[attribute] || null;
            }
          })
        } else if (mappedElements.length === 1) {
          const mappedElement = mappedElements[0];
          if (nestedMappings) {
            dataObject[propertyName] = Util.convertElementToDataObject(mappedElement, nestedMappings);
          } else {
            dataObject[propertyName] = mappedElement.getAttribute(attribute) || mappedElement[attribute] || null;
          }
        }
      });

      return dataObject;
    },

    // Loads a script asynchronously
    loadScript (scriptUrl) {
      const existingScripts = Array.prototype.filter.call(document.scripts, (script) => script.src === scriptUrl);
      if (existingScripts.length) {
        return existingScripts[0];
      }
      const firstScriptTag = document.head.getElementsByTagName('script')[0];
      const script = document.createElement('script');
      script.src = scriptUrl;
      firstScriptTag.parentNode.insertBefore(script, firstScriptTag);
      return script;
    },

    // Loads a stylesheet asynchronously
    loadStyleSheet (url) {
      return new Promise((resolve, reject) => {
        const existingLink = document.querySelector(`link[href="${url}"]`);

        if (existingLink) {
          // Check if the stylesheet is already loaded
          if (existingLink.sheet) {
            resolve();
          } else {
            // If it's still loading, wait for the load event
            existingLink.addEventListener('load', resolve);
            existingLink.addEventListener('error', () => reject(new Error(`Failed to load style sheet: ${url}`)));
          }
          return;
        }

        // If no existing link, create and append a new one
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = url;
        link.onload = resolve;
        link.onerror = () => reject(new Error(`Failed to load style sheet: ${url}`));

        document.head.appendChild(link);
      });
    },

    async importStyleSheet (name) {
      const cssImports = Theme.css || {};
      if (cssImports[name]) {
        return Util.loadStyleSheet(cssImports[name]);
      }
      return Promise.resolve();
    },

    parsePopularKeywords (keywordsString) {
      const keywords = keywordsString.split(',');
      const baseUrl = `${location.protocol}//${location.hostname}/hc/${Theme.locale}/search?query=`;
      return keywords
        .map(keyword => {
          keyword = keyword.trim()
          return keyword ? { title: keyword, html_url: baseUrl + keyword }: null
        })
        .filter(keyword => keyword);
    },

  };

  return API;

})();

// Extension API
(function(Util) {

  // The number of extension instances that have been created
  let numberExtensions = 0

  // Create the extension constructor
  const Extension = function(el, options) {
    if (!Util.isElement(el)) {
      throw Error('A valid DOM element was not provided.')
    }
    this.el = el
    this.instanceNumber = numberExtensions++
    this.id = 'zp-' + this.instanceNumber
    this.options = this._getOptions(options)
    this.events = Util.extend(this.events, { initialize: 'initialize' })
    this.initialize(this.options)
  }

  let _proto = Extension.prototype

  _proto.initialize = function () {};

  Util.extend(_proto, {
    defaults: {},
    optionTypes: {},
    events: {}
  })

  // Returns the options for the extension instance
  _proto._getOptions = function(options) {
    // Extend defaults with options provided
    let defaults = this.defaults
    options = Util.extend(defaults, options);

    // Extend options with element data attributes
    const dataset = this.el.dataset
    for (let key in dataset) {
      if (dataset.hasOwnProperty(key) && options.hasOwnProperty(key)) {
        let value = dataset[key];

        // Maybe perform value type conversion
        if (value === "true") {
          value = true;
        }
        if (value === "false") {
          value = false;
        }
        if (value === "null") {
          value = null;
        }

        // Only convert to a number if it doesn't change the string
        if (value === +value + "") {
          value = +value;
        }
        options[key] = value;
      }
    }

    // Validate that the options provided are of the correct type
    this._checkOptionTypes(options, this.optionTypes);

    return options;
  }

  // Checks whether each option is of the correct type
  _proto._checkOptionTypes = function(options, optionTypes) {
    for (let property in optionTypes) {
      if (Object.prototype.hasOwnProperty.call(optionTypes, property)) {
        const expectedTypes = optionTypes[property]
        let value = options[property]

        // Maybe convert the string to JSON
        if (typeof value === 'string' && /object|array/g.test(expectedTypes)) {
          options[property] = value = Util.stringToJSON(value);
        }

        const valueType = value && Util.isElement(value) ? 'element' : Util.typeOf(value);
        if (!new RegExp(expectedTypes).test(valueType)) {
          throw new Error(`Option "${property}" provided "${valueType}" but expected "${expectedTypes}"`)
        }
      }
    }
  };

  // Returns the class name with a given identifier
  _proto._getClassName = function(identifier) {
    let className = undefined

    // Options does not include a classNames object
    if (
      !this.options.hasOwnProperty('classNames') ||
      'object' !== Util.typeOf(this.options.classNames) ||
      !this.options.classNames.hasOwnProperty(identifier)
    ) {
      return className
    }

    const classNames = this.options.classNames
    if (typeof classNames[identifier] === 'function') {
      className = classNames[identifier].apply(this, [].slice.call(arguments, 1))
    } else if (typeof classNames[identifier] === 'string') {
      className = classNames[identifier]
    }
    return className
  };

  // Returns an extension constructor function
  Util.createExtension = function(prototype) {
    const extension = function(el, options) {
      Extension.call(this, el, options)
    }

    // Extend the extension prototype
    extension.prototype = Object.create(Extension.prototype)
    for (let key in prototype) {
      if (prototype.hasOwnProperty(key)) {
        extension.prototype[key] = prototype[key]
      }
    }

    Object.defineProperty(extension.prototype, 'constructor', {
      enumerable: false,
      value: extension
    })
    return extension
  };

  // Object storage API using WeakMap for managing extension instances
  window.dataStorage = {

    _storage: new WeakMap(),

    // Stores an object against an element
    put (element, key, obj) {
      if (!this._storage.has(element)) {
        this._storage.set(element, new Map());
      }
      this._storage.get(element).set(key, obj);
    },

    // Retrieves an object associated with an element
    get (element, key) {
      if (this._storage.has(element)) {
        return this._storage.get(element).get(key);
      }
      return undefined;
    },

    // Returns true if an element has an object stored against a given key
    has (element, key) {
      return this._storage.has(element) && this._storage.get(element).has(key);
    },

    // Removes an object stored against an element
    remove (element, key) {
      let ret = this._storage.get(element).delete(key);
      if (!this._storage.get(element).size === 0) {
        this._storage.delete(element);
      }
      return ret
    }
  };

})(Util || {});

// Templating API
(function(Util) {

  const templateSettings = {
    evaluate: /<%([\s\S]+?)%>/g,
    interpolate: /<%=([\s\S]+?)%>/g,
    escape: /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an interpolation, evaluation or
  // escaping regex, we need one that is guaranteed not to match.
  const noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a string literal.
  const escapes = {
    "'": "'",
    '\\': '\\',
    '\r': 'r',
    '\n': 'n',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  const escapeRegExp = /\\|'|\r|\n|\u2028|\u2029/g;

  const escapeChar = (match) => '\\' + escapes[match];

  // List of HTML entities for escaping.
  const escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;'
  };

  // Functions for escaping and un-escaping strings to/from HTML interpolation
  const createEscaper = (map) => {
    const escaper = (match) => map[match];

    // Regexes for identifying a key that needs to be escaped
    const source = '(?:' + Object.keys(map).join('|') + ')';
    const testRegexp = RegExp(source);
    const replaceRegexp = RegExp(source, 'g');
    return function(string) {
      string = string == null ? '' : '' + string;
      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
    }
  }

  const escape = createEscaper(escapeMap);

  // Returns an object based on a JSON formatted string
  Util.stringToJSON = function(string) {
    if (!string || typeof string !== 'string') {
      return {};
    }
    try {
      // Remove backticks
      string = string.replace(/`/g, '"');
      return JSON.parse(string);
    } catch (err) {
      console.error(`Template data string is not valid JSON`);
      return {};
    }
  };

  // Decodes HTML entities
  Util.decodeHTML = function(html) {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  };

  // Compiles a template string into a function that can be evaluated for rendering
  Util.template = function(text, settings = {}) {
    settings = Util.extend(settings, templateSettings);
    text = Util.decodeHTML(text);

    // Combine delimiters into one regular expression via alternation.
    const matcher = RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    let index = 0;
    let source = "__p+='";
    text.replace(matcher, (match, escape, interpolate, evaluate, offset) => {
      source += text.slice(index, offset).replace(escapeRegExp, escapeChar);
      index = offset + match.length;
      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':escape(__t))+\n'";
      } else if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      } else if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }

      // Adobe VMs need the match returned to produce the correct offset.
      return match;
    });

    source += "';\n";

    // If a variable is not specified, place data values in the local scope.
    if (!settings.variable) {
      source = 'with(obj||{}){\n' + source + '}\n';
    }

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + 'return __p;\n';

    let render;
    try {
      render = new Function(settings.variable || 'obj', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    return (data) => render.call(this, data);
  };

  // Returns the template string for a given element and template ID
  Util.getTemplateStringForElement = function(el, templateId) {

    // Check for a template within the current element
    if (el.childNodes.length) {

      // Try and locate the template by ID first
      const template = el.querySelector(`#tmpl-${templateId}[type="text/template"]`);
      if (template && template.innerText) {
        return template.innerText;
      }

      // Otherwise, look for any template within the element
      for (let i = 0; i < el.childNodes.length; i++) {
        const childNode = el.childNodes[i];
        if (childNode.type === 'text/template' && childNode.innerText) {
          return childNode.innerText;
        }
      }
    }

    // Return the global template if one exists
    return Util.getTemplateString(templateId);
  }

  // Returns the template string for a given element and template ID
  Util.getTemplateString = function(templateId) {
    const templates = document.querySelectorAll(`#tmpl-${templateId}[type="text/template"]`);
    const template = templates.length ? templates[templates.length - 1] : null;
    if (template && template.innerText) {
      return template.innerText;
    }
    return '';
  }

  // Compiles a template using the given template string and data
  Util.compileTemplate = function (templateString, templateData) {
    // Provide a reference to the template partial function for use in micro-templates
    templateData.partial = Util.templatePartial;

    // Provide a helper function for safely accessing data properties with a default value
    templateData.get = (key, defaultValue = '') => {
      if (templateData.hasOwnProperty(key)) {
        return templateData[key];
      }
      return defaultValue;
    }

    const compiled = Util.template(Util.decodeHTML(templateString));
    return compiled(templateData).replace(/(^\s+|\s+$)/g,'');
  }

  // A partial helper function that can be used in micro-templates
  Util.templatePartial = function (templateId, templateData) {
    const template = document.getElementById(`tmpl-${templateId}`);
    if (!template || !template.innerText) {
      return '';
    }
    return Util.compileTemplate(template.innerText, templateData);
  }

  // Renders a custom template within the given element
  Util.renderTemplate = function(el, templateId, data = {}, options = {}) {
    options.replaceElement = options.hasOwnProperty('replaceElement') ? options.replaceElement : false;
    options.replaceContent = options.hasOwnProperty('replaceContent') ? options.replaceContent : true;

    if (typeof el === 'string') {
      el = document.querySelector(el);
    }
    if (!el) {
      console.error('A valid HTML element was not specified');
    }

    let templateString = Util.getTemplateStringForElement(el, templateId);

    // Do nothing if there's no template string to render
    if (!templateString) {
      Util.log('No template to render');
      return el;
    }

    const html = Util.compileTemplate(templateString, data);

    el = Util.updateHTML(el, html, options);

    // Trigger render event
    Util.triggerEvent(el, 'template:render', { relatedTarget: el });

    return el;
  };

  // Updates the HTML for a given element
  Util.updateHTML = function(el, html, options = {}) {
    // No HTML to display
    if (!html) {
      if (options.removeEmptyElement === true) {
        el.remove();
      } else {
        // Ensure any loaders are removed
        el.innerHTML = '';
      }
      return
    }

    // Sanitize HTML
    html = Util.sanitizeHTML(html);

    // Replace the existing element
    if (options.replaceElement === true) {
      const div = document.createElement('div');
      div.innerHTML = html;
      const newElement = div.firstChild;
      if (newElement) {
        el.parentNode.replaceChild(newElement, el);
        el = newElement;
      } else {
        el.innerHTML = html;
      }
    }

    // Replace inner HTML
    else if (options.replaceContent === true) {
      el.innerHTML = html;
    }

    // Append content
    else {
      el.insertAdjacentHTML('afterbegin', html);
    }

    return el;
  }

  // Returns a sanitized HTML string
  Util.sanitizeHTML = function(html) {
    return DOMPurify.sanitize(html, {
      ADD_TAGS: ['template', 'use'],
      ADD_ATTR: [
        'target',
        // AlpineJS
        'x-cloak', 'x-data', 'x-ref', 'x-init', 'x-if', 'x-show', 'x-for', 'x-text', 'x-html', 'x-bind', 'x-on',
        'x-on:click', 'x-on:change',
        ':href', ':class', ':id', ':src', ':selected', ':aria-controls', ':aria-expanded', ':aria-selected',
        '@click', '@change',
        // Add specific Alpine event directives with colons
        '@collapse:show', '@collapse:hide',
        /^@[\w\-\:]+$/, // This should match @click, @change, @collapse:show, etc.
        // Wildcard patterns for dynamic bindings and events
        /^x-bind:.*/, // Match dynamic x-bind attributes like x-bind:class
        /^x-on:.*/, // Match dynamic x-on attributes like x-on:mouseover
        /^:.*/, // Match bind directives without a prefix
        /^\@[\w\-\:]+$/
      ],
      ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel|ftp|blob):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i
    });
  }

  // Returns the excerpt of a given string
  Util.getExcerpt = function (str, excerptLength = 120) {
    str = str || '';
    if (excerptLength) {
      str = str.replace(/<[^>]+>/g, '');
      if (str.length > excerptLength) {
        return str.substring(0, excerptLength) + '...';
      }
    }
    return str;
  };

})(Util || {});

// Video API
(function(Util) {

  let youTubeScriptAdded = false;
  let youTubeApiLoaded = false;
  const youTubeCallbacks = [];

  let vimeoScriptAdded = false;
  let vimeoApiLoaded = false;
  const vimeoCallbacks = [];

  let wistiaScriptAdded = false;
  let wistiaApiLoaded = false;
  const wistiaCallbacks = [];

  // Returns the name of the video provider, given a video ID
  function getVideoProvider (videoId) {
    if (videoId.length === 11) {
      return Util.videoProviders.YOUTUBE;
    }
    if (videoId.length <= 10 && /^[0-9]+$/.test(videoId)) {
      return Util.videoProviders.VIMEO;
    }
    if (videoId.length === 10) {
      return Util.videoProviders.WISTIA;
    }
    return null;
  }

  // Adds the YouTube player API script to the page
  function addYouTubeAPIScript() {
    Util.loadScript('https://www.youtube.com/player_api');
    youTubeScriptAdded = true;
  }

  // Executes all callback functions when the YouTube player API is loaded
  function onYouTubeAPILoaded() {
    youTubeApiLoaded = true;
    youTubeCallbacks.forEach(callback => callback());
    youTubeCallbacks.length = 0;
  }

  // Adds the Vimeo player API script to the page
  function addVimeoAPIScript() {
    const script = Util.loadScript('https://player.vimeo.com/api/player.js');
    script.onload = onVimeoAPILoaded;
    vimeoScriptAdded = true;
  }

  // Executes all callback functions when the Vimeo player API is loaded
  function onVimeoAPILoaded() {
    vimeoApiLoaded = true;
    vimeoCallbacks.forEach(callback => callback());
    vimeoCallbacks.length = 0;
  }

  // Adds the Wistia player API script to the page
  function addWistiaAPIScript() {
    const script = Util.loadScript('https://fast.wistia.com/assets/external/E-v1.js');
    script.onload = onWistiaAPILoaded;
    wistiaScriptAdded = true;
  }

  // Executes all callback functions when the Wistia player API is loaded
  function onWistiaAPILoaded() {
    wistiaApiLoaded = true;
    wistiaCallbacks.forEach(callback => callback());
    wistiaCallbacks.length = 0;
  }

  // Executes a callback function when the YouTube player API is loaded
  Util.loadYouTubeAPI = function(callback) {
    if (!youTubeScriptAdded) {
      addYouTubeAPIScript();
      if (!youTubeApiLoaded) {
        if (typeof window.YT === 'undefined') {
          window.onYouTubeIframeAPIReady = onYouTubeAPILoaded;
        } else {
          onYouTubeAPILoaded();
        }
      }
    }
    if (!youTubeApiLoaded) {
      youTubeCallbacks.push(callback);
    } else {
      callback();
    }
  };

  // Executes a callback function when the Vimeo player API is loaded
  Util.loadVimeoAPI = function(callback) {
    if (!vimeoScriptAdded) {
      addVimeoAPIScript();
    }
    if (!vimeoApiLoaded) {
      vimeoCallbacks.push(callback);
    } else {
      callback();
    }
  };

  // Executes a callback function when the Wistia player API is loaded
  Util.loadWistiaAPI = function(callback) {
    if (!wistiaScriptAdded) {
      addWistiaAPIScript();
    }
    if (!callback) {
      return;
    }
    if (!wistiaApiLoaded) {
      wistiaCallbacks.push(callback);
    } else {
      callback();
    }
  };

  // Returns the video data for a given set of video IDs (YouTube, Vimeo and/or Wistia)
  Util.getVideoData = function(videoIds) {
    const videos = videoIds
      .split(',')
      .map(videoId => {
        const id = videoId.trim();
        const provider = getVideoProvider(id);
        return provider ? { id, provider } : null;
      })
      .filter(video => video);

    return Promise.all(videos.map(video => Util[`get${video.provider}Data`](video.id)));
  };

  // Returns the video data for a given YouTube video
  Util.getYouTubeData = async function(videoId) {
    return fetch(`https://www.youtube.com/oembed?url=https://youtube.com/watch?v=${videoId}&format=json`)
      .then(response => response.json())
      .then(json => {
        return {
          id: videoId,
          provider: Util.videoProviders.YOUTUBE,
          title: json.title,
          url: `https://youtube.com/watch?v=${videoId}`,
          thumbnail: json['thumbnail_url'],
          duration: null,
          description: null
        }
      });
  };

  // Returns the video data for a given Vimeo vide
  Util.getVimeoData = async function(videoId) {
    return fetch(`https://vimeo.com/api/oembed.json?url=https://vimeo.com/${videoId}`)
      .then(response => response.json())
      .then(json => {
        return {
          id: videoId,
          provider: Util.videoProviders.VIMEO,
          title: json.title,
          url: `https://vimeo.com/${videoId}`,
          thumbnail: json['thumbnail_url'],
          duration: json['duration'],
          description: json.description
        }
      });
  };

  // Returns the video data for a given Wistia video
  Util.getWistiaData = async function(videoId) {
    return fetch(`https://fast.wistia.com/oembed?url=https://home.wistia.com/medias/${videoId}`)
      .then(response => response.json())
      .then(json => {
        return {
          id: videoId,
          provider: Util.videoProviders.WISTIA,
          title: json.title,
          url: `https://fast.wistia.net/embed/iframe/${videoId}?autoplay=true`,
          thumbnail: json['thumbnail_url'],
          duration: json['duration'],
          description: null
        }
      });
  };

  // Adds a YouTube background video to a hero element
  Util.addHeroBackgroundVideo = function(elementId, videoId) {
    const hero = document.getElementById(elementId);
    if (!hero) {
      return;
    }

    const heroBackground = hero.querySelector('.hero-background');
    const heroBackgroundImage = hero.querySelector('.hero-background-image');
    if (!heroBackground || !heroBackgroundImage) {
      return;
    }

    // Create the video element
    const videoElement = document.createElement('div');
    videoElement.classList.add('absolute', 'top-0', 'left-0', 'w-full', 'h-full', 'hidden');
    videoElement.style.zIndex = '0';

    // Create the background video element
    heroBackgroundImage.classList.add('hero-background-video', 'ratio', 'ratio-16-9');
    heroBackgroundImage.classList.remove('hero-background-image');

    // Handle parallax
    if (heroBackgroundImage.getAttribute('x-data') !== 'parallax') {
      heroBackgroundImage.style.top = '50%';
      heroBackgroundImage.style.left = '50%';
      heroBackgroundImage.style.transform = 'translate3d(-50%, -50%, 0)';
    }

    heroBackgroundImage.insertBefore(videoElement, heroBackgroundImage.firstElementChild);

    // Ensure the YouTube API is available
    Util.loadYouTubeAPI(() => {
      const player = new YT.Player(videoElement, {
        videoId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          showinfo: 0,
          modestbranding: 1,
          loop: 1,
          playlist: videoId
        },
        events: {
          onReady: (event) => {
            event.target.mute();
            event.target.playVideo();
          },
          onStateChange: (event) => {
            const iframe = player.getIframe();
            iframe.classList.remove('hidden');
          }
        }
      });
    });
  }

})(Util || {});

// Query API
(function(Util) {

  const CONFIG = {
    // API pagination limits
    SECTIONS_MAX_PAGES: 10,
    ARTICLES_MAX_PAGES: 15,
    PER_PAGE: 100,

    // Cache configuration
    DATABASE_NAME: 'zenplates-api',
    DATABASE_VERSION: 3,
    SUPPORTED_OBJECTS: ['categories', 'sections', 'articles', 'empty'],
    CACHE_DURATION: 60 * Util.minute,

    // Rate limiting
    MAX_RETRIES: 3,
    RETRY_DELAY: 2500
  };

  const getCacheType = () => {
    const userRole = window.User?.role;

    // If the role is defined, use the specific role name (e.g., 'agent')
    if (userRole) {
      return userRole;
    }

    // Default to 'anonymous' if no user or role is found
    return 'anonymous';
  };

  // Cache for processed results
  const processedCache = new Map();

  // Standardize URLs in an item
  const standardizeUrls = (item) => {
    if (item && item.html_url) {
      item.url = item.html_url;
    }
    return item;
  };

  // Get the current page context
  const getPageContext = () => ({
    pageId: Util.getPageId(),
    pageType: {
      isArticle: Util.isArticlePage(),
      isSection: Util.isSectionPage(),
      isCategory: Util.isCategoryPage()
    }
  });

  // Database management
  const db = {
    async init () {
      if (this.db) {
        return;
      }

      return new Promise((resolve, reject) => {
        const request = indexedDB.open(CONFIG.DATABASE_NAME, CONFIG.DATABASE_VERSION);

        request.onerror = () => reject(request.error);

        request.onupgradeneeded = (event) => {
          const db = event.target.result;

          CONFIG.SUPPORTED_OBJECTS.forEach(store => {
            if (!db.objectStoreNames.contains(store)) {
              if (store === 'empty') {
                const objectStore = db.createObjectStore(store, { keyPath: ['endpoint', 'cacheType'] });
                objectStore.createIndex('timestamp', 'timestamp', { unique: false });
              } else {
                const objectStore = db.createObjectStore(store, { keyPath: ['id', 'cacheType'] });
                objectStore.createIndex('timestamp', 'timestamp', { unique: false });
                objectStore.createIndex('cacheType', 'cacheType', { unique: false });
              }
            }
          });
        };

        request.onsuccess = () => {
          this.db = request.result;
          resolve();
        };
      });
    },

    async get (store, query = {}) {
      const cacheType = getCacheType();

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(store, 'readonly');
        const objectStore = transaction.objectStore(store);

        if (query.ids) {
          Promise.all(query.ids.map(id =>
            new Promise((resolve) => {
              const request = objectStore.get([id, cacheType]);
              request.onsuccess = () => resolve(request.result);
              request.onerror = () => resolve(null);
            })
          )).then(results => {
            const validResults = results
              .filter(item => item && (!item.timestamp || (Date.now() - item.timestamp) < CONFIG.CACHE_DURATION))
              .sort((a, b) => b._originalPosition - a._originalPosition);
            resolve(validResults.length === query.ids.length ? validResults : []);
          }).catch(reject);
        } else {
          const index = objectStore.index('cacheType');
          const request = index.getAll(cacheType);

          request.onsuccess = () => {
            const results = request.result
              .filter(item => !item.timestamp || (Date.now() - item.timestamp) < CONFIG.CACHE_DURATION)
              .sort((a, b) => b._originalPosition - a._originalPosition);

            resolve(results);
          };
          request.onerror = () => reject(request.error);
        }
      });
    },

    async getEmptyResult (endpoint) {
      const cacheType = getCacheType();

      return new Promise((resolve) => {
        const transaction = this.db.transaction('empty', 'readonly');
        const objectStore = transaction.objectStore('empty');
        const request = objectStore.get([endpoint, cacheType]);

        request.onsuccess = () => {
          const result = request.result;
          if (result && (Date.now() - result.timestamp) < CONFIG.CACHE_DURATION) {
            resolve(true);
          } else {
            resolve(false);
          }
        };
        request.onerror = () => resolve(false);
      });
    },

    async set (store, data) {
      const cacheType = getCacheType();

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(store, 'readwrite');
        const objectStore = transaction.objectStore(store);
        const items = Array.isArray(data) ? data : [data];
        const timestamp = Date.now();

        Promise.all(items.map((item, index) =>
          new Promise((resolve, reject) => {
            const enhancedItem = {
              ...standardizeUrls(item),
              cacheType,
              timestamp,
              _originalPosition: index
            };
            const request = objectStore.put(enhancedItem);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
          })
        )).then(resolve).catch(reject);
      });
    },

    async setEmptyResult (endpoint) {
      const cacheType = getCacheType();

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction('empty', 'readwrite');
        const objectStore = transaction.objectStore('empty');
        const request = objectStore.put({
          endpoint,
          cacheType,
          timestamp: Date.now()
        });

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }
  };

  // Request queue for deduplication
  const requestQueue = {
    queue: new Map(),

    add (key, promise) {
      this.queue.set(key, promise);
      return promise.finally(() => this.queue.delete(key));
    },

    get (key) {
      return this.queue.get(key);
    }
  };

  Util.requestHandler = Util.requestHandler || null;

  const api = {
    async request (endpoint, options = {}) {

      // Check for custom request handling function
      if (typeof Util.requestHandler === 'function') {
        try {
          const response = await Util.requestHandler(endpoint, options);
          if (response && typeof response === 'object') {
            return response;
          }
          throw new Error('Invalid response format from custom request handler');
        } catch (error) {
          console.error('Custom request handler error:', error);
          throw error;
        }
      }

      const url = `/api/v2/help_center/${Util.locale}/${endpoint}`;
      const retries = options.retries ?? CONFIG.MAX_RETRIES;

      const makeRequest = async (retriesLeft) => {
        try {
          const fetchOptions = {
            headers: { 'Accept': 'application/json' }
          };

          // Omit credentials for anonymous users
          if (getCacheType() === 'anonymous') {
            fetchOptions.credentials = 'omit';
          }

          const response = await fetch(url, fetchOptions);

          if (response.status === 429) {
            if (retriesLeft > 0) {
              const retryAfter = parseInt(response.headers.get('Retry-After') || CONFIG.RETRY_DELAY);
              await new Promise(resolve => setTimeout(resolve, retryAfter));
              return makeRequest(retriesLeft - 1);
            }
            throw new Error('Rate limit exceeded');
          }

          if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
          }

          return response.json();
        } catch (error) {
          if (retriesLeft > 0 && error.message !== 'Rate limit exceeded') {
            await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY));
            return makeRequest(retriesLeft - 1);
          }
          throw error;
        }
      };

      return makeRequest(retries);
    },

    async fetchPages (endpoint, maxPages = Infinity) {
      // Check empty results cache first
      const isEmptyResult = await db.getEmptyResult(endpoint);
      if (isEmptyResult) {
        Util.log('%cCached empty result', 'color: blue; font-weight: bold;');
        return [];
      }

      const firstPage = await this.request(`${endpoint}?per_page=${CONFIG.PER_PAGE}`);
      const dataKey = Object.keys(firstPage).find(key => Array.isArray(firstPage[key]));
      let results = firstPage[dataKey] || [];

      // Cache empty results
      if (results.length === 0) {
        await db.setEmptyResult(endpoint);
        return results;
      }

      const totalPages = Math.min(firstPage.page_count || 1, maxPages);
      if (totalPages > 1) {
        const pagePromises = Array.from({ length: totalPages - 1 }, (_, i) =>
          this.request(`${endpoint}?page=${i + 2}&per_page=${CONFIG.PER_PAGE}`)
        );

        const pages = await Promise.all(pagePromises);
        results = results.concat(...pages.map(page => page[dataKey] || []));
      }

      return results;
    }
  };

  const fetcher = {
    async getCategories (query = {}) {
      const { ids = [] } = query;

      // Check if categories are already cached
      const allCachedCategories = await db.get('categories');
      if (allCachedCategories.length > 0) {
        Util.log('%cCached response for all categories', 'color: green; font-weight: bold;', `(${allCachedCategories.length})`);

        // Return all categories if no specific IDs are requested
        if (ids.length === 0) {
          return allCachedCategories;
        }

        // Otherwise return specific categories from the cache
        return allCachedCategories.filter(category => ids.includes(category.id));
      }

      // Check empty results cache
      const isEmptyResult = await db.getEmptyResult('categories');
      if (isEmptyResult) {
        Util.log('%cCached response for empty categories', 'color: green; font-weight: bold;');
        return [];
      }

      // Always fetch all categories
      const cacheKey = 'categories-all';
      let categoriesPromise = requestQueue.get(cacheKey);
      if (!categoriesPromise) {
        categoriesPromise = requestQueue.add(
          cacheKey,
          api.fetchPages('categories')
        );
      }

      const categories = await categoriesPromise;
      if (categories.length > 0) {
        await db.set('categories', categories);
      }
      return categories;
    },

    async getSections (query = {}) {
      const { ids = [], categoryId, sectionId } = query;

      // Check cache first for specific section IDs
      if (ids.length > 0) {
        const cachedSections = await db.get('sections', { ids });
        if (cachedSections.length === ids.length) {
          Util.log('%cCached response for specified sections', 'color: green; font-weight: bold;', `(${cachedSections.length})`);
          return cachedSections;
        }
      }

      // Check if all sections are already cached
      const allCachedSections = await db.get('sections');
      if (allCachedSections.length > 0) {
        Util.log('%cCached response for all sections', 'color: green; font-weight: bold;', `(${allCachedSections.length})`);

        // If specific IDs are requested, only return those sections
        if (ids.length > 0) {
          const requestedSections = allCachedSections.filter(section => ids.includes(section.id));
          if (requestedSections.length === ids.length) {
            return requestedSections;
          }
        }

        // If categoryId is specified, filter by category
        if (categoryId) {
          return allCachedSections.filter(section => section.category_id === categoryId);
        }

        // If sectionId is specified, filter by parent section
        if (sectionId) {
          return allCachedSections.filter(section => section.parent_section_id === sectionId);
        }

        // If no specific IDs, category, or section, return all sections
        if (ids.length === 0 && !categoryId && !sectionId) {
          return allCachedSections;
        }
      }

      const getEmptyKey = () => {
        if (categoryId) {
          return `empty-categories/${categoryId}/sections`;
        }
        if (sectionId) {
          return `empty-sections/${sectionId}/sections`;
        }
        return 'empty-sections';
      };

      // Check empty results cache
      const emptyKey = getEmptyKey();
      const isEmptyResult = await db.getEmptyResult(emptyKey);
      if (isEmptyResult) {
        Util.log('%cCached response for empty sections', 'color: green; font-weight: bold;');
        return [];
      }

      // Fetch from API based on query type
      let cacheKey;
      let sectionsPromise;

      if (ids.length > 0) {
        // Fetch specific sections by ID
        cacheKey = `sections-${ids.join(',')}`;
        sectionsPromise = requestQueue.get(cacheKey);
        if (!sectionsPromise) {
          sectionsPromise = requestQueue.add(
            cacheKey,
            Promise.all(ids.map(id =>
              api.request(`sections/${id}`).then(response => response.section)
            ))
          );
        }
      } else if (categoryId) {
        // Fetch sections by category
        cacheKey = `sections-category-${categoryId}`;
        sectionsPromise = requestQueue.get(cacheKey);
        if (!sectionsPromise) {
          sectionsPromise = requestQueue.add(
            cacheKey,
            api.fetchPages(`categories/${categoryId}/sections`, CONFIG.SECTIONS_MAX_PAGES)
          );
        }
      } else {
        // For all other cases (including sectionId), fetch all sections
        cacheKey = 'sections-all';
        sectionsPromise = requestQueue.get(cacheKey);
        if (!sectionsPromise) {
          sectionsPromise = requestQueue.add(
            cacheKey,
            api.fetchPages('sections', CONFIG.SECTIONS_MAX_PAGES)
          );
        }
      }

      const sections = await sectionsPromise;

      // If we have sections, cache them
      if (sections.length > 0) {
        await db.set('sections', sections);
      }

      // If we're querying by sectionId, filter the results
      if (sectionId) {
        return sections.filter(section => section.parent_section_id === sectionId);
      }

      return sections;
    },

    async getArticles (query = {}) {
      const { categoryId, sectionId } = query;

      // Check cache first
      const cachedArticles = await db.get('articles');
      if (cachedArticles.length > 0) {
        Util.log('%cCached response for articles', 'color: green; font-weight: bold;', `(${cachedArticles.length})`);

        // For section-specific queries, verify we have articles for that section
        if (sectionId) {
          const sectionArticles = cachedArticles.filter(article => article.section_id === sectionId);

          // If we don't have any articles for this section, fetch from API
          if (sectionArticles.length === 0) {
            return this.fetchAndCacheArticles(query);
          }
          return sectionArticles;
        }

        // For category-specific queries, verify we have articles for that category
        if (categoryId) {
          const cachedSections = await db.get('sections');
          if (cachedSections.length > 0) {
            const sectionIds = new Set(
              cachedSections
                .filter(section => section.category_id === categoryId)
                .map(section => section.id)
            );
            const categoryArticles = cachedArticles.filter(article => sectionIds.has(article.section_id));

            // If we don't have any articles for this category, fetch from API
            if (categoryArticles.length === 0) {
              return this.fetchAndCacheArticles(query);
            }
            return categoryArticles;
          }
        }

        return cachedArticles;
      }

      return this.fetchAndCacheArticles(query);
    },

    async fetchAndCacheArticles (query) {
      const { categoryId, sectionId } = query;
      let cacheKey;
      let articlesPromise;

      if (categoryId) {
        cacheKey = `articles-category-${categoryId}`;
        articlesPromise = requestQueue.get(cacheKey);
        if (!articlesPromise) {
          articlesPromise = requestQueue.add(
            cacheKey,
            api.fetchPages(`categories/${categoryId}/articles`, CONFIG.ARTICLES_MAX_PAGES)
          );
        }
      } else if (sectionId) {
        cacheKey = `articles-section-${sectionId}`;
        articlesPromise = requestQueue.get(cacheKey);
        if (!articlesPromise) {
          articlesPromise = requestQueue.add(
            cacheKey,
            api.fetchPages(`sections/${sectionId}/articles`, CONFIG.ARTICLES_MAX_PAGES)
          );
        }
      } else {
        cacheKey = 'articles-all';
        articlesPromise = requestQueue.get(cacheKey);
        if (!articlesPromise) {
          articlesPromise = requestQueue.add(
            cacheKey,
            api.fetchPages('articles', CONFIG.ARTICLES_MAX_PAGES)
          );
        }
      }

      const articles = await articlesPromise;

      // Get existing cached articles
      const existingArticles = await db.get('articles');

      // Merge new articles with existing ones, avoiding duplicates
      const mergedArticles = [...existingArticles];
      articles.forEach(newArticle => {
        const existingIndex = mergedArticles.findIndex(article => article.id === newArticle.id);
        if (existingIndex === -1) {
          mergedArticles.push(newArticle);
        } else {
          mergedArticles[existingIndex] = { ...newArticle, timestamp: Date.now() };
        }
      });

      await db.set('articles', mergedArticles);
      return articles;
    }
  };

  const processor = {

    filterFunctions: {
      categories: () => true,
      sections: () => true,
      articles: article => !article.draft // Filter draft articles
    },

    sortingFunctions: {
      manual: Util.sortManually,
      title: Util.sortByNameAscending,
      creation_asc: Util.sortByDateAscending,
      creation_desc: Util.sortByDateDescending
    },

    getCacheKey (categories, sections, articles, query) {
      const pageContext = getPageContext();
      const cacheType = getCacheType();
      return JSON.stringify({
        cacheType,
        categories: categories.map(category => category.id),
        sections: sections.map(section => section.id),
        articles: articles.map(article => article.id),
        query,
        pageContext
      });
    },

    applyFilter (items, type) {
      if (!Array.isArray(items) || items.length === 0) {
        return items;
      }
      return items.filter(this.filterFunctions[type]);
    },

    sortArticles (articles, sortType = 'manual') {
      if (!Array.isArray(articles) || articles.length === 0) {
        return articles;
      }

      let sorted = [...articles];
      const sortFn = this.sortingFunctions[sortType];
      if (sortFn) {
        sorted.sort(sortFn);
      }

      // Always sort promoted articles to the top
      sorted.sort(Util.sortByPromoted);
      return sorted;
    },

    sortSections (sections, parentSection = null) {
      if (!Array.isArray(sections) || sections.length === 0) {
        return sections;
      }

      const sorted = [...sections];
      const sortType = parentSection?.sorting || 'manual';
      const sortFn = this.sortingFunctions[sortType];
      return sortFn ? sorted.sort(sortFn) : sorted;
    },

    sortCategories (categories) {
      if (!Array.isArray(categories) || categories.length === 0) {
        return categories;
      }
      return [...categories].sort(this.sortingFunctions.manual);
    },

    markActiveSectionHierarchy (sectionMap, activeSectionId) {
      let currentSectionId = activeSectionId;

      while (currentSectionId && sectionMap.has(currentSectionId)) {
        const section = sectionMap.get(currentSectionId);
        section.isActive = true;
        currentSectionId = section.parent_section_id;
      }
    },

    structureData (categories, sections, articles, query) {
      const cacheKey = this.getCacheKey(categories, sections, articles, query);
      const cachedResult = processedCache.get(cacheKey);
      if (cachedResult) {
        Util.log('%cCached processed result', 'color: blue; font-weight: bold;', cachedResult)
        return cachedResult;
      }

      // Apply filters to input data
      categories = this.applyFilter(categories, 'categories');
      sections = this.applyFilter(sections, 'sections');
      articles = this.applyFilter(articles, 'articles');

      // Get active items from query or page context
      const pageContext = getPageContext();
      const pageType = pageContext.pageType
      const pageId = pageContext.pageId;
      let { activeCategoryId = null, activeSectionId = null, activeArticleId = null } = query;
      if (!activeCategoryId && pageType.isCategory) {
        activeCategoryId = pageId;
      }
      if (!activeSectionId && pageType.isSection) {
        activeSectionId = pageId;
      }
      if (!activeArticleId && pageType.isArticle) {
        activeArticleId = pageId;
      }

      // Ensure that all active items are properly set
      if (activeArticleId && (!activeSectionId || !activeCategoryId)) {
        const activeArticle = articles.find(article => article.id === activeArticleId);
        if (activeArticle) {
          activeSectionId = activeArticle.section_id;
          const activeSection = sections.find(section => section.id === activeSectionId);
          if (activeSection) {
            activeCategoryId = activeSection.category_id;
          }
        }
      }
      if (activeSectionId && !activeCategoryId) {
        const activeSection = sections.find(section => section.id === activeSectionId);
        if (activeSection) {
          activeCategoryId = activeSection.category_id;
        }
      }

      const result = {
        categories: [],
        sections: [],
        articles: [],
        allSections: [],
        activeCategoryId,
        activeSectionId,
        activeArticleId
      };

      // If specific sections were requested, filter sections accordingly
      if (Array.isArray(query.sections) && query.sections.length > 0) {
        sections = sections.filter(section => query.sections.includes(section.id));
      }

      // Process sections to identify parent-child relationships and sort articles
      const sectionMap = new Map();
      sections.forEach(section => {
        const sectionArticles = articles.filter(article => article.section_id === section.id);

        // Sort articles based on the section sorting method
        const sortMethod = section.sorting || 'manual'
        const sortedArticles = this.sortArticles(sectionArticles, sortMethod)
          .map(article => ({ ...article, isActive: article.id === result.activeArticleId }));

        sectionMap.set(section.id, {
          ...section,
          isActive: section.id === result.activeSectionId,
          sections: [],
          articles: sortedArticles
        });
      });

      // Mark active section and all its ancestors as active
      this.markActiveSectionHierarchy(sectionMap, result.activeSectionId);

      // Build section hierarchy and sort subsections
      const topLevelSections = [];
      sectionMap.forEach(section => {
        if (section.parent_section_id && sectionMap.has(section.parent_section_id)) {
          const parentSection = sectionMap.get(section.parent_section_id);
          parentSection.sections.push(section);
          parentSection.sections = this.sortSections(parentSection.sections, parentSection);
        } else if (!section.parent_section_id) {
          topLevelSections.push(section);
        }
      });

      const sortedTopLevelSections = this.sortSections(topLevelSections);

      // Handle categories
      if (categories.length > 0) {
        // Always process categories with their sections when sections are available
        let processedCategories = categories.map(category => ({
          ...category,
          isActive: category.id === result.activeCategoryId,
          sections: sortedTopLevelSections.filter(section => section.category_id === category.id)
        }));

        // Filter categories if specific IDs are requested
        const requestedCategoryIds = query.categories?.ids ?? []
        if (requestedCategoryIds && requestedCategoryIds.length > 0) {
          processedCategories = categories.filter(category => requestedCategoryIds.includes(category.id));
        }

        result.categories = this.sortCategories(processedCategories);
      }

      // Handle sections
      if (query.sections) {
        if (query.sections.ids) {
          const requestedSections = query.sections.ids
            .map(id => sectionMap.get(id))
            .filter(Boolean);

          result.sections = this.sortSections(requestedSections.filter(section => !section.parent_section_id));
          result.allSections = this.sortSections(requestedSections);
        } else {
          result.sections = sortedTopLevelSections;
          result.allSections = this.sortSections(Array.from(sectionMap.values()));
        }
      }

      // Handle articles
      const shouldIncludeArticles =
        query.articles !== undefined ||
        query.sections?.articles ||
        query.categories?.articles ||
        (Array.isArray(query.categories) && query.categories.some(cat => cat.articles));

      if (shouldIncludeArticles) {
        let sortMethod = 'manual';

        // Get the section to determine the correct sorting method
        if (articles.length > 0 && articles[0].section_id) {
          const section = Array.from(sectionMap.values()).find(section => section.id === articles[0].section_id);
          if (section) {
            sortMethod = section.sorting || 'manual';
          }
        }

        // Sort articles based on the section sorting method
        result.articles = this.sortArticles(
          articles.map(article => ({ ...article, isActive: article.id === result.activeArticleId })),
          sortMethod
        );
      }

      // Cache the processed result
      processedCache.set(cacheKey, result);

      // Clean up old cached results if cache gets too large
      if (processedCache.size > 100) {
        const oldestKey = processedCache.keys().next().value;
        processedCache.delete(oldestKey);
      }

      Util.log('%cProcessed result', 'color: green; font-weight: bold;', result);
      return result;
    }
  };

  Util.query = async function query (query) {
    await db.init();

    try {
      const requirements = {
        categories: {
          fetch: false,
          ids: new Set()
        },
        sections: {
          fetch: false,
          ids: new Set(),
          categoryId: null,
          sectionId: null
        },
        articles: {
          fetch: false,
          categoryId: null,
          sectionId: null
        }
      };

      // Handle category requirements
      if (query.categories !== undefined) {
        requirements.categories.fetch = true;
        if (Array.isArray(query.categories) && query.categories.length > 0) {
          query.categories.forEach(id => requirements.categories.ids.add(id));
        }
      }

      // Handle section requirements
      if (query.sections !== undefined) {
        requirements.sections.fetch = true;

        // If sections is an array, treat it as specific section IDs
        if (Array.isArray(query.sections)) {
          query.sections.forEach(id => requirements.sections.ids.add(id));
        }
        // If sections is an object, check for category_id and section_id
        else if (typeof query.sections === 'object' && query.sections !== null) {
          if (query.sections.category_id) {
            requirements.sections.categoryId = query.sections.category_id;
          }
          if (query.sections.section_id) {
            requirements.sections.sectionId = query.sections.section_id;
          }
          if (Array.isArray(query.sections.ids)) {
            query.sections.ids.forEach(id => requirements.sections.ids.add(id));
          }
        }
      }

      // Handle article requirements
      if (query.articles !== undefined) {
        requirements.articles.fetch = true;

        if (typeof query.articles === 'object' && query.articles !== null) {
          if (query.articles.category_id) {
            requirements.articles.categoryId = query.articles.category_id;
          }
          if (query.articles.section_id) {
            requirements.articles.sectionId = query.articles.section_id;
          }
        }
      }

      // Fetch required data
      const [categories, sections, articles] = await Promise.all([
        requirements.categories.fetch ?
          fetcher.getCategories({
            ids: Array.from(requirements.categories.ids)
          }) :
          [],
        requirements.sections.fetch ?
          fetcher.getSections({
            ids: Array.from(requirements.sections.ids),
            categoryId: requirements.sections.categoryId,
            sectionId: requirements.sections.sectionId
          }) :
          [],
        requirements.articles.fetch ?
          fetcher.getArticles({
            categoryId: requirements.articles.categoryId,
            sectionId: requirements.articles.sectionId
          }) :
          []
      ]);

      // Process and return data
      return processor.structureData(categories, sections, articles, query);
    } catch (error) {
      console.error('Error fetching help center data:', error);
      throw error;
    }
  }

  Util.hasCachedResponse = async function hasCachedResponse(query) {
    if (!db.db) {
      await db.init();
    }

    try {
      // Parse requirements similar to query()
      const requirements = {
        categories: {
          fetch: false,
          ids: []
        },
        sections: {
          fetch: false,
          ids: [],
          categoryId: null,
          sectionId: null
        },
        articles: {
          fetch: false,
          categoryId: null,
          sectionId: null
        }
      };

      // Parse requirements
      if (query.categories !== undefined) {
        requirements.categories.fetch = true;
        if (Array.isArray(query.categories) && query.categories.length > 0) {
          requirements.categories.ids = query.categories;
        }
      }

      if (query.sections !== undefined) {
        requirements.sections.fetch = true;
        if (Array.isArray(query.sections)) {
          requirements.sections.ids = query.sections;
        } else if (typeof query.sections === 'object' && query.sections !== null) {
          requirements.sections.categoryId = query.sections.category_id;
          requirements.sections.sectionId = query.sections.section_id;
          if (Array.isArray(query.sections.ids)) {
            requirements.sections.ids = query.sections.ids;
          }
        }
      }

      if (query.articles !== undefined) {
        requirements.articles.fetch = true;
        if (typeof query.articles === 'object' && query.articles !== null) {
          requirements.articles.categoryId = query.articles.category_id;
          requirements.articles.sectionId = query.articles.section_id;
        }
      }

      // Check categories
      if (requirements.categories.fetch) {
        const allCachedCategories = await db.get('categories');
        if (allCachedCategories.length === 0) {
          const isEmptyResult = await db.getEmptyResult('categories');
          if (!isEmptyResult) return false;
        }

        if (requirements.categories.ids.length > 0) {
          const cachedCategories = await db.get('categories', { ids: requirements.categories.ids });
          if (cachedCategories.length !== requirements.categories.ids.length) return false;
        }
      }

      // Check sections
      if (requirements.sections.fetch) {
        // Check for specific section IDs first
        if (requirements.sections.ids.length > 0) {
          const cachedSections = await db.get('sections', { ids: requirements.sections.ids });
          if (cachedSections.length !== requirements.sections.ids.length) return false;
        } else {
          const allCachedSections = await db.get('sections');

          // If no sections are cached, check empty results
          if (allCachedSections.length === 0) {
            let endpoint = 'sections';
            if (requirements.sections.categoryId) {
              endpoint = `categories/${requirements.sections.categoryId}/sections`;
            } else if (requirements.sections.sectionId) {
              endpoint = `sections/${requirements.sections.sectionId}/sections`;
            }
            const isEmptyResult = await db.getEmptyResult(endpoint);
            if (!isEmptyResult) return false;
          } else if (requirements.sections.categoryId) {
            // Check if we have sections for this category
            const categorySections = allCachedSections.filter(s => s.category_id === requirements.sections.categoryId);
            if (categorySections.length === 0) {
              const isEmptyResult = await db.getEmptyResult(`categories/${requirements.sections.categoryId}/sections`);
              if (!isEmptyResult) return false;
            }
          } else if (requirements.sections.sectionId) {
            // Check if we have sections for this parent section
            const subsections = allCachedSections.filter(s => s.parent_section_id === requirements.sections.sectionId);
            if (subsections.length === 0) {
              const isEmptyResult = await db.getEmptyResult(`sections/${requirements.sections.sectionId}/sections`);
              if (!isEmptyResult) return false;
            }
          }
        }
      }

      // Check articles
      if (requirements.articles.fetch) {
        const allCachedArticles = await db.get('articles');

        if (requirements.articles.sectionId) {
          // Check if we have articles for this section
          const sectionArticles = allCachedArticles.filter(a => a.section_id === requirements.articles.sectionId);
          if (sectionArticles.length === 0) {
            const isEmptyResult = await db.getEmptyResult(`sections/${requirements.articles.sectionId}/articles`);
            if (!isEmptyResult) return false;
          }
        } else if (requirements.articles.categoryId) {
          // For category articles, we need both sections and articles
          const cachedSections = await db.get('sections');
          if (cachedSections.length === 0) return false;

          const sectionIds = new Set(
            cachedSections
              .filter(s => s.category_id === requirements.articles.categoryId)
              .map(s => s.id)
          );

          const categoryArticles = allCachedArticles.filter(a => sectionIds.has(a.section_id));
          if (categoryArticles.length === 0) {
            const isEmptyResult = await db.getEmptyResult(`categories/${requirements.articles.categoryId}/articles`);
            if (!isEmptyResult) return false;
          }
        } else if (allCachedArticles.length === 0) {
          const isEmptyResult = await db.getEmptyResult('articles');
          if (!isEmptyResult) return false;
        }
      }

      return true;

    } catch (error) {
      console.error('Error checking cache:', error);
      return false;
    }
  };

})(Util || {});

// Request API
(function(Util) {

  const CONFIG = {
    MAX_PAGES: 10,
    PER_PAGE: 100,
    CACHE_DURATION: Util.hour,
    DATABASE_NAME: 'zenplates-requests',
    SUPPORTED_OBJECTS: ['requests']
  };

  const db = {
    async init () {
      if (this.db) {
        return;
      }

      return new Promise((resolve, reject) => {
        const request = indexedDB.open(CONFIG.DATABASE_NAME, 1);

        request.onerror = () => reject(request.error);

        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          CONFIG.SUPPORTED_OBJECTS.forEach(store => {
            if (!db.objectStoreNames.contains(store)) {
              const objectStore = db.createObjectStore(store, { keyPath: 'endpoint' });
              objectStore.createIndex('timestamp', 'timestamp', { unique: false });
            }
          });
        };

        request.onsuccess = () => {
          this.db = request.result;
          resolve();
        };
      });
    },

    async get (endpoint) {
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction('requests', 'readonly');
        const objectStore = transaction.objectStore('requests');
        const request = objectStore.get(endpoint);

        request.onsuccess = () => {
          const result = request.result;
          if (result && (Date.now() - result.timestamp) < CONFIG.CACHE_DURATION) {
            resolve(result.data);
          } else {
            resolve(null);
          }
        };
        request.onerror = () => reject(request.error);
      });
    },

    async set (endpoint, data) {
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction('requests', 'readwrite');
        const objectStore = transaction.objectStore('requests');
        const request = objectStore.put({
          endpoint,
          data,
          timestamp: Date.now()
        });

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }
  };

  const requestQueue = {
    queue: new Map(),

    add (key, promise) {
      this.queue.set(key, promise);
      return promise.finally(() => this.queue.delete(key));
    },

    get (key) {
      return this.queue.get(key);
    }
  };

  async function fetchRemainingPages (json, url) {
    const pageCount = json.page_count;

    // Return early if no additional pages needed
    if (!pageCount || pageCount === 1 || json.page > 1) {
      return json;
    }

    const numberPages = Math.min(pageCount, CONFIG.MAX_PAGES);
    const pagePromises = [];

    // Fetch remaining pages
    for (let i = 2; i <= numberPages; i++) {
      const pageUrl = Util.setURLParameter(url, 'page', i);
      pagePromises.push(Util.request(pageUrl, false)); // Don't cache individual pages
    }

    const pages = await Promise.all(pagePromises);

    // Merge all pages
    pages.forEach(page => {
      for (const objectType in page) {
        if (Array.isArray(page[objectType])) {
          json[objectType] = (json[objectType] || []).concat(page[objectType]);
        }
      }
    });

    return json;
  }

  Util.request = async function (url, useCache = true) {
    await db.init();

    // Normalize URL and add per_page parameter
    const adjustedUrl = Util.setURLParameter(url, 'per_page', Util.getURLParameter('per_page', url) || CONFIG.PER_PAGE);

    // Create a unique key for this request that includes user role
    const endpoint = `${adjustedUrl}-${window.User.role}`;

    // Check cache first if enabled
    if (useCache) {
      const cachedData = await db.get(endpoint);
      if (cachedData) {
        return cachedData;
      }
    }

    // Check if there's already a request in progress for this URL
    let requestPromise = requestQueue.get(endpoint);
    if (requestPromise) {
      return requestPromise;
    }

    // Create new request promise
    requestPromise = requestQueue.add(
      endpoint,
      (async () => {
        try {
          const response = await fetch(adjustedUrl);
          if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
          }

          const contentType = response.headers.get('Content-Type');
          if (!contentType?.includes('application/json')) {
            throw new Error('Response is not JSON');
          }

          const json = await response.json();
          const result = await fetchRemainingPages(json, adjustedUrl);

          // Cache the result if caching is enabled
          if (useCache) {
            await db.set(endpoint, result);
          }

          return result;
        } catch (error) {
          console.error('Request error:', error);
          throw error;
        }
      })()
    );

    return requestPromise;
  };

})(Util || {});
