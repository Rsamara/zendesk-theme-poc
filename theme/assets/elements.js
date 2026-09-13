// Collapse
(function() {
  'use strict';

  const NAME = Util.extensions.COLLAPSE;

  const ClassName = {
    ACTIVE: Util.classNames.ACTIVE,
    VISIBLE: Util.classNames.VISIBLE,
    COLLAPSE: Util.classNames.COLLAPSE,
    COLLAPSING: Util.classNames.COLLAPSING,
    HIDDEN: Util.classNames.HIDDEN
  };

  const Event = {
    SHOW: `${NAME}:${Util.events.SHOW}`,
    SHOWN: `${NAME}:${Util.events.SHOWN}`,
    HIDE: `${NAME}:${Util.events.HIDE}`,
    HIDDEN: `${NAME}:${Util.events.HIDDEN}`
  };

  const Selector = {
    TOGGLE: Util.selectors.COLLAPSE,
  };

  window.Collapse = Util.createExtension({
    name: NAME,

    defaults: {
      parent: false,
      toggle: true,
    },

    optionTypes: {
      parent: '(string|element|boolean)',
      toggle: 'boolean',
    },

    initialize (options) {
      this._isTransitioning = false;
      this._parent = options.parent ? this._getParent() : null;
      this._triggerArray = [].slice.call(document.querySelectorAll(
        Selector.TOGGLE + '[href="#' + this.el.id + '"],' +
        Selector.TOGGLE + '[data-target="#' + this.el.id + '"]'
      ));

      let _this = this;
      let toggleList = [].slice.call(document.querySelectorAll(Selector.TOGGLE));
      for (let i = 0, len = toggleList.length; i < len; i++) {
        let selector = Util.getSelectorFromElement(toggleList[i]);
        let filterElement = [].slice.call(document.querySelectorAll(selector))
          .filter((el) => el === _this.el);
        if (selector !== null && filterElement.length > 0) {
          this._selector = selector;
        }
      }

      if (!options.parent) {
        this._addAriaAndCollapsedClass(this.el, this._triggerArray);
      }
      if (options.toggle) {
        this.toggle();
      }
    },

    _getTargetFromElement (element) {
      const selector = Util.getSelectorFromElement(element);
      return selector ? document.querySelector(selector) : null;
    },

    _getParent () {
      let parent;

      if (Util.isElement(this.options.parent)) {
        parent = this.options.parent;
      } else if (this.options.parent.startsWith('#')) {
        parent = document.getElementById(this.options.parent.slice(1));
      } else {
        parent = document.querySelector(this.options.parent);
      }

      if (parent) {
        const selector = `${Selector.TOGGLE}[data-parent="${this.options.parent}"]`;
        const children = [].slice.call(parent.querySelectorAll(selector));
        for (let i = 0; i < children.length; i++) {
          this._addAriaAndCollapsedClass(this._getTargetFromElement(children[i]), [children[i]]);
        }
      }
      return parent;
    },

    _addAriaAndCollapsedClass (el, triggers) {
      const isOpen = el.classList.contains(ClassName.VISIBLE);
      if (triggers.length) {
        triggers.forEach(function(trigger) {
          trigger.classList.toggle(ClassName.ACTIVE, isOpen);
          trigger.classList.toggle(ClassName.HIDDEN, !isOpen);
          trigger.setAttribute('aria-expanded', isOpen);
        })
      }
    },

    _setTransitioning (isTransitioning) {
      this._isTransitioning = isTransitioning;
    },

    toggle () {
      if (this.el.classList.contains(ClassName.VISIBLE)) {
        this.hide();
      } else {
        this.show();
      }
    },

    show () {
      if (this._isTransitioning || this.el.classList.contains(ClassName.VISIBLE)) {
        return;
      }
      const options = this.options;
      let actives;
      if (this._parent) {
        actives = [].slice.call(this._parent.querySelectorAll(`.${ClassName.VISIBLE}`, `.${ClassName.COLLAPSING}`))
          .filter((el) => {
            if (typeof options.parent === 'string') {
              return el.getAttribute('data-parent') === options.parent;
            }
            return el.classList.contains(ClassName.COLLAPSE);
          })

        if (actives.length === 0) {
          actives = null;
        }
      }

      const startEvent = Util.triggerEvent(this.el, Event.SHOW, { relatedTargets: this._triggerArray });
      if (startEvent && startEvent.defaultPrevented) {
        return;
      }

      if (actives) {
        actives.forEach((el) => {
          const instance = dataStorage.get(el, NAME);
          if (!instance) {
            dataStorage.put(el, NAME, new Collapse(el));
          } else {
            instance.hide();
          }
        })
      }

      this.el.classList.remove(ClassName.COLLAPSE);
      this.el.classList.add(ClassName.COLLAPSING);
      this.el.style.height = '0px';

      if (this._triggerArray.length) {
        this._triggerArray.forEach((el) => {
          const customActiveClass = el.getAttribute('data-active-class');
          el.classList.add(ClassName.ACTIVE);
          if (customActiveClass) {
            el.classList.add.apply(el.classList, customActiveClass.split(' '));
          }
          el.classList.remove(ClassName.HIDDEN);
          el.setAttribute('aria-expanded', 'true');
        })
      }

      this._setTransitioning(true);

      let complete = function() {
        this.el.classList.remove(ClassName.COLLAPSING);
        this.el.classList.add(ClassName.COLLAPSE);
        this.el.classList.add(ClassName.VISIBLE);
        this.el.style.height = '';

        this._setTransitioning(false);

        Util.triggerEvent(this.el, Event.SHOWN, { relatedTargets: this._triggerArray });
      }.bind(this);

      Util.onTransitionEnd(this.el, complete);

      this.el.style.height = this.el.scrollHeight + 'px';
    },

    hide () {
      if (this._isTransitioning || !this.el.classList.contains(ClassName.VISIBLE)) {
        return;
      }

      let startEvent = Util.triggerEvent(this.el, Event.HIDE, { relatedTargets: this._triggerArray });
      if (startEvent && startEvent.defaultPrevented) {
        return;
      }

      this.el.style.height = this.el.getBoundingClientRect().height + 'px';
      this.el.classList.add(ClassName.COLLAPSING);
      this.el.classList.remove(ClassName.COLLAPSE);
      this.el.classList.remove(ClassName.VISIBLE);

      if (this._triggerArray.length > 0) {
        for (let i = 0; i < this._triggerArray.length; i++) {
          const trigger = this._triggerArray[i];
          const selector = Util.getSelectorFromElement(trigger);
          if (selector !== null) {
            [].slice.call(document.querySelectorAll(selector)).forEach((el) => {
              if (!el.classList.contains(ClassName.VISIBLE)) {
                trigger.classList.add(ClassName.HIDDEN);
                trigger.classList.remove(ClassName.ACTIVE);

                const customActiveClass = trigger.getAttribute('data-active-class');
                if (customActiveClass) {
                  trigger.classList.remove.apply(trigger.classList, customActiveClass.split(' '));
                }
                trigger.setAttribute('aria-expanded', 'false');
              }
            })
          }
        }
      }

      this._setTransitioning(true);

      let complete = function() {
        this._setTransitioning(false);
        this.el.classList.remove(ClassName.COLLAPSING);
        this.el.classList.add(ClassName.COLLAPSE);
        Util.triggerEvent(this.el, Event.HIDDEN, { relatedTargets: this._triggerArray });
      }.bind(this);

      Util.onTransitionEnd(this.el, complete);

      this.el.style.height = '';
    }
  });

  Util.toggleCollapse = function (selector, parent = document) {
    parent.querySelectorAll(selector).forEach(el => {
      const instance = dataStorage.get(el, NAME);
      if (!instance) {
        dataStorage.put(el, NAME, new Collapse(el));
      } else {
        instance.toggle();
      }
    });
  }

  document.addEventListener('click', function(e) {
    let trigger = e.target;
    if (!trigger.matches(Selector.TOGGLE)) {
      trigger = trigger.closest(Selector.TOGGLE);
      if (!trigger) {
        return;
      }
    }

    if (trigger.tagName === 'A') {
      e.preventDefault();
    }

    const selector = Util.getSelectorFromElement(trigger);
    Util.toggleCollapse(selector);
  }, false);

})();

// Scrollspy
(function() {
  'use strict';

  const NAME = Util.extensions.SCROLLSPY;

  const ClassName = {
    ACTIVE: Util.classNames.ACTIVE
  };

  const Event = {
    ACTIVE: `${NAME}:${Util.events.ACTIVE}`,
    INACTIVE: `${NAME}:${Util.events.INACTIVE}`
  };

  const Selector = Util.selectors.SCROLLSPY;

  window.Scrollspy = Util.createExtension({
    name: NAME,

    defaults: {
      offset: 0,
      updateURL: true,
      scrollElement: null,
      activeClass: ClassName.ACTIVE
    },

    optionTypes: {
      offset: '(string|number)',
      updateURL: 'boolean',
      scrollElement: '(string|element|null)',
      activeClass: 'string'
    },

    initialize () {
      const links = this.el.querySelectorAll("a[href^='#']");
      if (!links.length) {
        Util.log('The scrollspy element does not contain any links to anchor elements.')
        return;
      }

      if (typeof this.options.offset === 'string') {
        this.options.offset = parseInt(this.options.offset, 10);
      }

      const scrollElement = this._getScrollElement();
      this._scrollElement = scrollElement.tagName === 'BODY' ? window : scrollElement;
      this._links = Array.prototype.slice.call(links);
      this._targets = this._getTargets();
      this._activeTarget = null;

      this._addEventListeners();
      this._onScroll();
    },

    _getScrollElement () {
      const scrollElement = this.options.scrollElement;
      if (!scrollElement) {
        return window;
      }
      if (Util.isElement(scrollElement)) {
        return scrollElement;
      }
      if (typeof scrollElement === 'string') {
        return document.querySelector(scrollElement) || window;
      }
      return window;
    },

    _getTargets () {
      const scrollElement = this._scrollElement === window ? document : this._scrollElement;
      return this._links

        // Find elements in the scroll element
        .map((el) => {
          const href = el.getAttribute('href').trim();
          let target;
          try {
            target = scrollElement.querySelector(href);
          } catch (err) {
            target = document.getElementById(href.substring(1));
          }
          return target;
        })
        .filter((item) => item)

        // Sort based on top position
        .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
    },

    _addEventListeners () {
      this._scrollElement.addEventListener('scroll', this._onScroll.bind(this));
      this._links.forEach(link => {
        link.addEventListener('click', this._onClick.bind(this));
      });
    },

    _onClick (e) {
      const el = e.target.closest('a');
      const href = el.href || '';
      const elementId = href.substring(href.indexOf('#') + 1);
      const targetElement = document.getElementById(elementId);

      // Scroll the element into view
      if (targetElement) {
        Util.scrollIntoView(targetElement, this.options.offset, this._scrollElement);
        if (targetElement.id && this.options.updateURL === true) {
          try {
            history.pushState(null, null,`#${targetElement.id}`);
          } catch (err) {
            // Couldn't push history state
          }
        }
      }
      e.preventDefault();
    },

    _getScrollTop () {
      return this._scrollElement === window ? this._scrollElement.pageYOffset : this._scrollElement.scrollTop;
    },

    _getScrollHeight () {
      return this._scrollElement.scrollHeight || Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
    },

    _getOffsetHeight () {
      return this._scrollElement === window ? window.innerHeight : this._scrollElement.getBoundingClientRect().height;
    },

    _onScroll () {
      const scrollTop = this._getScrollTop() + this.options.offset;
      const scrollHeight = this._getScrollHeight();
      const maxScroll = this.options.offset + scrollHeight - this._getOffsetHeight();

      // Identify active target
      let activeTarget = null;
      if (scrollTop >= maxScroll) {
        activeTarget = this._targets[this._targets.length - 1];
      } else {
        const scrollElementTop = this._scrollElement === window ? 0 : this._scrollElement.getBoundingClientRect().top;
        for (let i = 0; i < this._targets.length; i++) {
          let target = this._targets[i];
          if ((target.getBoundingClientRect().top - scrollElementTop - (this.options.offset + 1)) > 0) {
            if (activeTarget === null) {
              activeTarget = target;
            }
            break;
          }
          activeTarget = target;
        }
      }

      // Do nothing if the active target hasn't changed
      if (this._activeTarget === activeTarget) {
        return;
      }

      const previousActiveTarget = this._activeTarget;
      this._activeTarget = activeTarget;

      // Update link class names
      const activeClassNames = this.options.activeClass;
      this._links.forEach(link => {
        link.classList.remove.apply(link.classList, activeClassNames.split(' '));
      })

      let previousActiveLink = this._links.filter((link) => previousActiveTarget && link.getAttribute('href') === (`#${previousActiveTarget.id}`))[0] || null;
      let activeLink = this._links.filter((link) => activeTarget && link.getAttribute('href') === (`#${activeTarget.id}`))[0] || null;

      const el = this.el;

      // Maybe trigger event on previous active link
      if (previousActiveLink) {
        Util.triggerEvent(previousActiveLink, Event.INACTIVE, { relatedTargets: el });
      }

      if (activeLink === null) {
        return;
      }

      // Trigger event on active link
      activeLink.classList.add.apply(activeLink.classList, activeClassNames.split(' '));
      Util.triggerEvent(activeLink, Event.ACTIVE, { relatedTargets: el });
    }

  });

  document.addEventListener('DOMContentLoaded', () => {
    const elements = document.querySelectorAll(Selector);
    elements.forEach(el => {
      new Scrollspy(el);
    });
  });

})();

// Sticky
(function() {
  'use strict';

  const NAME = Util.extensions.STICKY;

  const ClassName = {
    STICKY: Util.classNames.STICKY,
    STUCK: Util.classNames.STUCK,
    UNSTUCK: Util.classNames.UNSTUCK,
    HIDDEN: Util.classNames.HIDDEN
  };

  const Event = {
    INITIALIZE: `${NAME}:${Util.events.INITIALIZE}`,
    STUCK: `${NAME}:${Util.events.STUCK}`,
    UNSTUCK: `${NAME}:${Util.events.UNSTUCK}`,
    HIDDEN: `${NAME}:${Util.events.HIDDEN}`,
    SHOWN: `${NAME}:${Util.events.SHOWN}`,
  };

  const Selector = Util.selectors.STICKY;

  window.Sticky = Util.createExtension({
    name: NAME,

    defaults: {
      scrollElement: window,
      offset: 0,
      tolerance: 8,
      hide: false,
      classNames: {

        // The class name(s) to apply to the element when the extension is initialized
        sticky: ClassName.STICKY,

        // The class name(s) to apply to the element when it is stuck
        stuck: ClassName.UNSTUCK,

        // The class name(s) to apply to the element when it is not stuck
        unstuck: ClassName.UN_STUCK,

        // The class name(s) to apply to the element when it is hidden (if applicable)
        hidden: ClassName.HIDDEN
      }
    },

    optionTypes: {
      scrollElement: '(window|element|string)',
      offset: 'number',
      tolerance: 'number',
      hide: 'boolean',
      classNames: '(object|string)'
    },

    initialize (options) {

      // Do nothing if the browser does not support position:sticky
      if (!this._supportsSticky()) {
        return;
      }

      if (typeof this.options.classNames === 'string') {
        this.options.classNames = Util.stringToJSON(this.options.classNames);
      }

      const stickyClassNames = this._getClassName('sticky');
      if (stickyClassNames) {
        this.el.classList.add.apply(this.el.classList, stickyClassNames.split(' '));
      }

      this.scrollElement = (typeof options.scrollElement === 'string' ? document.querySelector(options.scrollElement) : options.scrollElement) || window;
      this.lastScrollTop = (this.scrollElement === window) ? window.scrollY || window.pageYOffset : this.scrollElement.scrollTop;
      this.scrolling = false;

      this._addEventListeners();

      // Set the initial state
      this._onScroll();

      Util.triggerEvent(this.el, Event.INITIALIZE);
    },

    _supportsSticky () {
      const prefix = ['', '-o-', '-webkit-', '-moz-', '-ms-'];
      let test = document.head.style;
      for (let i = 0; i < prefix.length; i += 1) {
        test.position = prefix[i] + 'sticky';
      }
      const supportsSticky = !!test.position;
      test.position = '';
      return supportsSticky;
    },

    _addEventListeners () {
      this.scrollElement.addEventListener('scroll', this._onScroll.bind(this));
    },

    _getTopPosition (el) {
      return el.getBoundingClientRect().top + (this.scrollElement.pageYOffset || document.documentElement.scrollTop);
    },

    _onScroll () {
      if (!this.scrolling) {
        requestAnimationFrame(this._updateClassNames.bind(this));
        this.scrolling = true;
      }
    },

    _updateClassNames() {
      const options = this.options;
      const lastScrollTop = this.lastScrollTop;
      const scrollTop = (this.scrollElement === window) ? (window.scrollY || window.pageYOffset) : this.scrollElement.scrollTop;
      const elementTop = this._getTopPosition(this.el);
      const parentTop = this._getTopPosition(this.el.parentElement);
      const elementOffset = elementTop - parentTop;

      let isStuck
      if (elementOffset) {
        isStuck = scrollTop >= (elementTop - options.offset);
      } else {
        isStuck = scrollTop > (parentTop - options.offset);
      }

      if (options.hide === true) {
        const hiddenClassNames = this._getClassName('hidden');
        if (scrollTop > (lastScrollTop + options.tolerance)) {
          if (hiddenClassNames) {
            this.el.classList.add.apply(this.el.classList, hiddenClassNames.split(' '));
          }
          Util.triggerEvent(this.el, Event.HIDDEN);
        } else if (scrollTop < this.lastScrollTop || scrollTop <= 0) {
          if (hiddenClassNames) {
            this.el.classList.remove.apply(this.el.classList, hiddenClassNames.split(' '));
          }
          Util.triggerEvent(this.el, Event.SHOWN);
        }
      }

      this.lastScrollTop = scrollTop;

      // Do nothing if the state is unchanged
      if (typeof this.isStuck !== 'undefined' && this.isStuck === isStuck) {
        this.scrolling = false;
        return;
      }

      this.isStuck = isStuck;

      const stuckClassNames = this._getClassName('stuck');
      const unStuckClassNames = this._getClassName('unstuck');
      if (isStuck) {
        if (unStuckClassNames) this.el.classList.remove.apply(this.el.classList, unStuckClassNames.split(' '));
        if (stuckClassNames) this.el.classList.add.apply(this.el.classList, stuckClassNames.split(' '));
      } else {
        if (stuckClassNames) this.el.classList.remove.apply(this.el.classList, stuckClassNames.split(' '));
        if (unStuckClassNames) this.el.classList.add.apply(this.el.classList, unStuckClassNames.split(' '));
      }

      Util.triggerEvent(this.el, (isStuck ? Event.STUCK : Event.UNSTUCK));
      this.scrolling = false;
    }

  });

  document.addEventListener('data:loaded', () => {
    const elements = document.querySelectorAll(Selector);
    elements.forEach(el => {
      new Sticky(el);
      el.removeAttribute('data-element');
    });
  });

})();

// Tab
(function() {
  'use strict';

  const NAME = Util.extensions.TAB

  const ClassName = {
    ACTIVE: Util.classNames.ACTIVE,
    DISABLED: Util.classNames.DISABLED,
    SHOWN: Util.classNames.SHOWN
  };

  const Event = {
    SHOW: `${NAME}:${Util.events.SHOW}`,
    SHOWN: `${NAME}:${Util.events.SHOWN}`,
    HIDE: `${NAME}:${Util.events.HIDE}`,
    HIDDEN:`${NAME}:${Util.events.HIDDEN}`
  };

  const Selector = {
    NAV: Util.selectors.NAV,
    ACTIVE: `.${ClassName.ACTIVE}`,
    DATA_TOGGLE: Util.selectors.TAB
  };

  window.Tab = Util.createExtension({

    show () {
      if (
        this.el.parentNode &&
        this.el.parentNode.nodeType === Node.ELEMENT_NODE &&
        this.el.classList.contains(ClassName.ACTIVE) ||
        this.el.classList.contains(ClassName.DISABLED)
      ) {
        return;
      }

      const nav = this.el.closest(Selector.NAV) || this.el.parentNode;
      const selector = Util.getSelectorFromElement(this.el);
      let previous;
      let target;
      let hideEvent;

      if (nav) {
        previous = nav.querySelector(Selector.ACTIVE);
      }
      if (previous) {

        // Do nothing if a transition is underway on the previous element
        const previousSelector = Util.getSelectorFromElement(previous);
        const previousTarget = document.querySelector(previousSelector);

        if (
          previousTarget &&
          Util.getTransitionDuration(previousTarget) &&
          !previousTarget.classList.contains(ClassName.SHOWN)
        ) {
          return;
        }
        hideEvent = Util.triggerEvent(previous, Event.HIDE, { relatedTarget: this.el });
      }

      let showEvent = Util.triggerEvent(this.el, Event.SHOW, { relatedTarget: previous });
      if (showEvent.defaultPrevented || (hideEvent && hideEvent.defaultPrevented)) {
        return;
      }

      this._activate(this.el, nav);

      /**
       * Trigger `hidden` and `shown` events.
       */
      let complete = function() {
        if (previous) {
          Util.triggerEvent(previous, Event.HIDDEN, { relatedTarget: this.el });
        }
        Util.triggerEvent(this.el, Event.SHOWN, { relatedTarget: previous });
      }.bind(this);

      if (selector) {
        target = document.querySelector(selector);
      }
      if (target) {
        this._activate(target, target.parentNode, complete);
      } else {
        complete();
      }
    },

    _activate (el, container, callback) {
      let active;
      if (container === el.parentNode) {
        active = Array.prototype.filter.call(container.children, (el) => el.matches(Selector.ACTIVE))[0] || null;
      } else {
        active = container.querySelector(Selector.ACTIVE);
      }

      let onActivated = function() {
        return this._transitionComplete(el, active, callback);
      }.bind(this)

      if (active) {
        Util.onTransitionEnd(active, onActivated);
        active.classList.remove(ClassName.SHOWN);
      } else {
        onActivated();
      }
    },

    _transitionComplete (el, active, callback) {
      let customActiveClass;
      if (active) {

        // Remove active class names
        active.classList.remove(ClassName.ACTIVE);
        customActiveClass = active.getAttribute('data-active-class');
        if (customActiveClass) {
          active.classList.remove.apply(active.classList, customActiveClass.split(' '));
        }
        if (active.getAttribute('role') === 'tab') {
          active.setAttribute('aria-selected', false);
        }
      }

      // Add active class names
      el.classList.add(ClassName.ACTIVE);
      customActiveClass = el.getAttribute('data-active-class');
      if (customActiveClass) {
        el.classList.add.apply(el.classList, customActiveClass.split(' '));
      }
      if (el.getAttribute('role') === 'tab') {
        el.setAttribute('aria-selected', true);
      }
      Util.reflow(el);
      el.classList.add(ClassName.SHOWN);
      if (callback) {
        callback();
      }
    }
  });

  document.addEventListener('click', function(e) {
    let el = e.target;
    if (!el.matches(Selector.DATA_TOGGLE)) {
      el = el.closest(Selector.DATA_TOGGLE);
      if (!el) {
        return;
      }
    }

    if (el.tagName === 'A') {
      e.preventDefault();
    }
    let instance = dataStorage.get(el, NAME);
    if (!instance) {
      instance = new Tab(el);
      dataStorage.put(el, NAME, instance);
    }
    instance.show();
  }, false);

})();

// Tabs
(function() {
  'use strict';

  const NAME = Util.extensions.TABS

  const Event = {
    RENDER: `${NAME}:${Util.events.RENDER}`
  };

  const Selector = Util.selectors.TABS;

  window.Tabs = Util.createExtension({
    name: NAME,

    defaults: {
      initial: 0,
      activeClass: 'text-brand',
      template: 'tabs',
      templateData: {}
    },

    optionTypes: {
      initial: 'number',
      activeClass: 'string',
      template: '(string|null)',
      templateData: 'object',
    },

    initialize (options) {
      if (this.el.children.length) {
        this.render(options);
      }
    },

    _generateTemplateString (activeClass) {
      return `
      <% if (children.length) { %>
        <div class="tabs">
          <nav class="nav nav-tabs overflow-hidden sm:overflow-visible" id="<%= id %>" role="tablist">
            <% children.forEach((child, index) => { %>
              <a
                class="nav-link text-inherit font-semibold<% if (initial === index ) { %> ${activeClass}<% } %> hover:text-brand"
                id="tab-<%= child.id %>"
                href="#<%= child.id %>"
                role="tab"
                data-toggle="tab"
                data-active-class="${activeClass}"
                aria-selected="<%= initial === index %>">
                <%= child.title %>
              </a>
            <% }); %>
          </nav>
          <% children.forEach((child, index) => { %>
            <div
              class="tab p-5 bg-base<% if (initial === index ) { %> ${Util.classNames.ACTIVE}<% } %>"
              id="<%= child.id %>"
              role="tab-panel"
              aria-labelledby="tab-<%= child.id %>">
              <%= child.innerHTML %>
            </div>
          <% }); %>
        </div>
      <% } %>`;
    },

    render (options) {
      let id = this.id;
      let ids = [];

      let children = Array.prototype.slice.call(this.el.children).map((el, i) => {

        // Default tab heading and ID
        let title = `Tab ${i}`;
        let tabId = `${el.id || id}-${i}`;

        // Get the custom tab heading and ID, if available
        if (el.hasAttribute('title')) {
          title = el.getAttribute('title');
        } else if (el.hasAttribute('data-title')) {
          title = el.getAttribute('data-title');
        } else {
          const heading = el.querySelector('.tab-heading');
          if (heading) {
            title = heading.textContent;
            if (heading.id) {
              tabId = heading.id;
            }
          }
        }

        ids.push(tabId);
        return {
          innerHTML: el.innerHTML,
          title,
          id: tabId
        };
      });

      // Check for a reference to a specific tab in the URL
      let hash = window.location.hash.substring(1);
      let index = ids.indexOf(hash);
      let scrollToEl = false;
      if (index !== -1 && index >= 0 && index < children.length) {
        options.initial = index;
        scrollToEl = true;
      }

      let activeClass = Util.classNames.ACTIVE;
      if (options.activeClass) {
        activeClass += ' ' + options.activeClass;
      }

      // let dataAttributes = 'data-toggle="tab"';
      // if (options.activeClass) {
      //   dataAttributes += ` data-active-class="${options.activeClass}"`;
      // }

      const templateData = options.templateData;
      const data = Util.extend(templateData, {
        id: id,
        children: children,
        items: children,
        initial: options.initial,
        // dataAttributes: dataAttributes,
        activeClass: activeClass,
        options: options
      });

      let templateString = Util.getTemplateStringForElement(this.el, this.options.template);
      if (!templateString) {
        templateString = this._generateTemplateString(activeClass); // , dataAttributes);
      }

      const html = Util.compileTemplate(templateString, data);

      this.el = Util.updateHTML(this.el, html, { replaceElement: true });

      Util.triggerEvent(this.el, Event.RENDER, { relatedTarget: this.el });
      Util.triggerEvent(document, 'template:render', { relatedTarget: this.el });

      if (scrollToEl) {
        setTimeout(() => { el.scrollIntoView() }, 25)
      }
    }
  });

  function createTabs (container) {
    const elements = (container || document).querySelectorAll(Selector);
    elements.forEach(el => {
      if (!el.parentElement.closest(Selector)) {
        el.removeAttribute('data-element');
        el.classList.remove('js-tabs');
        new Tabs(el);
      }
    });
  }

  document.addEventListener('data:loaded', () => {
    createTabs(document);
  });

  document.addEventListener('template:render', event => {
    createTabs(event.detail.relatedTarget);
  });

})();

// Toggles
(function() {
  'use strict';

  const NAME = Util.extensions.TOGGLES;

  const Event = {
    RENDER: `${NAME}:${Util.events.RENDER}`
  };

  const Selector = Util.selectors.TOGGLES;

  window.Toggles = Util.createExtension({
    name: NAME,

    defaults: {

      // The index of the toggle to open on initialization
      initial: -1,

      // True if the toggles should behave as an accordion
      accordion: false,

      activeClass: 'text-brand',

      // The ID of the custom template to use when generating HTML
      template: 'toggles',

      // Additional data to expose to the template
      templateData: {}
    },

    optionTypes: {
      initial: 'number',
      activeClass: 'string',
      accordion: 'boolean',
      template: '(string|null)',
      templateData: 'object'
    },

    initialize (options) {
      if (this.el.children.length) {
        this.render(options);
      }
    },

    _generateTemplateString(activeClass) {
      return `
      <% if (children.length) { %>
        <div class="content-element-toggles toggles bg-base border border-radius" id="<%= id %>">
          <% children.forEach((child, index) => { %>
            <% var isActive = (initial === index); %>
            <% var isLastChild = (index === (children.length - 1)); %>
            <div class="toggle<% if (!isLastChild) { %> border-bottom<% } %>" x-data="collapse({ id: '<%= child.id %>', isExpanded: <%= isActive %> })">
              <a class="toggle-link flex align-items-center justify-content-between py-4 px-5 font-semibold text-inherit<% if (isActive) { %> ${activeClass}<% } %> hover:no-underline hover:text-brand" :class="{ '${activeClass}': (isExpanding || isExpanded) }" href="#<%= child.id %>" x-bind="trigger">
                <%= child.title %>
                <svg class="svg-icon" aria-hidden="true" :class="{ 'rotate-180': isExpanding || isExpanded }">
                  <use xlink:href="#icon-chevron-down" />
                </svg>
              </a>
              <div class="toggle-content collapse<% if (isActive) { %> is-visible<% } %>" x-bind="collapse">
                <div class="px-5 py-4 border-top">
                  <%= child.innerHTML %>
                </div>
              </div>
            </div>
          <% }) %>
        </div>
      <% } %>`
    },

    render (options) {
      let id = this.id;
      let ids = [];

      let children = Array.prototype.slice.call(this.el.children).map((el, i) => {

        // Default toggle heading and ID
        let title = `Toggle ${i}`;
        let toggleId = `${el.id || id}-${i}`;

        if (el.hasAttribute('title')) {
          title = el.getAttribute('title');
        } else if (el.hasAttribute('data-title')) {
          title = el.getAttribute('data-title');
        } else {
          let heading = el.querySelector('.toggle-heading');
          if (heading) {
            title = heading.textContent;
            if (heading.id) {
              toggleId = heading.id;
            }
          }
        }

        ids.push(toggleId);
        return {
          innerHTML: el.innerHTML,
          title: title,
          id: toggleId
        };
      });

      // Check for a reference to a specific tab in the URL
      let hash = window.location.hash.substring(1);
      let index = ids.indexOf(hash);
      let scrollToEl = false;
      if (index !== -1 && index >= 0 && index < children.length) {
        options.initial = index;
        scrollToEl = true;
      }

      const activeClass = options.activeClass ? options.activeClass : '';
      const templateData = options.templateData;
      const data = Util.extend(templateData, {
        id: id,
        children: children,
        items: children,
        accordion: options.accordion,
        parent: options.accordion ? '#' + this.id : null,
        initial: options.initial,
        activeClass
      });

      let templateString = Util.getTemplateStringForElement(this.el, this.options.template);
      if (!templateString) {
        templateString = this._generateTemplateString(activeClass);
      }

      const html = Util.compileTemplate(templateString, data);

      this.el = Util.updateHTML(this.el, html, { replaceElement: true });

      Util.triggerEvent(this.el, Event.RENDER, { relatedTarget: this.el });
      Util.triggerEvent(document, 'template:render', { relatedTarget: this.el });

      if (scrollToEl) {
        document.addEventListener('DOMContentLoaded', () => {
          this.el.scrollIntoView();
        })
      }
    }

  });

  function createToggles (container) {
    const elements = (container || document).querySelectorAll(Selector);
    elements.forEach(el => {
      if (!el.parentElement.closest(Selector)) {
        el.removeAttribute('data-element');
        el.classList.remove('js-toggles');
        new Toggles(el);
      }
    });
  }

  document.addEventListener('data:loaded', () => {
    createToggles(document);
  });

  document.addEventListener('template:render', event => {
    createToggles(event.detail.relatedTarget);
  });

})();

// Carousels
(function() {
  'use strict';

  const NAME = Util.extensions.CAROUSEL;

  const Event = {
    INITIALIZE: `${NAME}:${Util.events.INITIALIZE}`,
    RENDER: `${NAME}:${Util.events.RENDER}`,
    NEXT: `${NAME}:${Util.events.NEXT}`,
    PREVIOUS: `${NAME}:${Util.events.PREVIOUS}`
  };

  const Selector = Util.selectors.CAROUSEL;

  window.Carousel = Util.createExtension({
    name: NAME,

    defaults: {

      // The index of the page to open on initialization
      initial: 0,

      // Selectors
      children: '.carousel-item',
      previousButton: '.js-previous',
      nextButton: '.js-next',

      // The 'Next' title
      nextTitle: 'Next',

      // The 'Previous' title
      previousTitle: 'Previous',

      scrollToTop: false,

      // The ID of the custom template to use when generating HTML
      template: 'carousel',

      // Additional data to expose to the template
      templateData: {}
    },

    optionTypes: {
      initial: 'number',
      children: 'string',
      previousButton: 'string',
      nextButton: 'string',
      nextTitle: 'string',
      previousTitle: 'string',
      scrollToTop: 'boolean',
      template: '(string|null)',
      templateData: 'object'
    },

    initialize (options) {
      if (!this.el.children.length) {
        return;
      }

      this.childrenIds = [];

      this.render(this._getData(options));

      this.children = this.childrenIds.map(id => this.el.querySelector(`#${id}`)).filter(child => child);
      this.previousButton = this.el.querySelector(`#${this.id}-previous${options.previousButton}`);
      this.nextButton = this.el.querySelector(`#${this.id}-next${options.nextButton}`);

      const initial = options.initial;
      this._activate(initial >= 0 && initial < this.children.length ? initial : 0);
      this._addEventListeners();

      Util.triggerEvent(this.el, Event.INITIALIZE, { relatedTarget: this.el });
    },

    _getData (options) {

      let children = Array.prototype
        .slice.call(this.el.children)
        .map((child, index) => {
          let title = `Item ${index}`;
          let id = `${child.id || this.id}-${index}`;

          if (child.hasAttribute('data-title')) {
            title = child.getAttribute('data-title');
          } else {
            let heading = child.querySelector('.carousel-heading');
            if (heading) {
              title = heading.textContent;
            }
          }

          this.childrenIds.push(id);

          return {
            innerHTML: child.innerHTML,
            title: title,
            id
          };
        });

      const data = {
        id: this.id,
        items: children,
        children: children,
        nextTitle: options.nextTitle,
        previousTitle: options.previousTitle,
        initial: options.initial
      }

      let templateData = options.templateData;

      return Util.extend(templateData, data);

    },

    render (data) {
      let templateString = Util.getTemplateStringForElement(this.el, this.options.template);
      if (!templateString) {
        templateString = `
        <% if (children.length) { %>
          <div class="carousel border border-radius bg-base">
            <% children.forEach((child, index) => { %>
              <div class="carousel-item" id="<%= child.id %>">
                <%= child.innerHTML %>
              </div>
            <% }); %>
            <div class="mt-5">
              <% if (previousTitle) { %>
                <button class="button button-outline-brand mr-2 js-previous" id="<%= id %>-previous">
                  <%= previousTitle %>
                </button>
              <% } %>
              <% if (nextTitle) { %>
                <button class="button button-brand js-next" id="<%= id %>-next">
                  <%= nextTitle %>
                </button>
              <% } %>
            </div>
          </div>
        <% } %>`;
      }

      const html = Util.compileTemplate(templateString, data);

      this.el = Util.updateHTML(this.el, html, { replaceElement: true });

      Util.triggerEvent(this.el, Event.RENDER, { relatedTarget: this.el });
      Util.triggerEvent(this.el, 'template:render', { relatedTarget: this.el });
    },

    _addEventListeners () {
      this.previousButton.addEventListener('click', this._onClick.bind(this));
      this.previousButton.addEventListener('keypress', this._onClick.bind(this));
      this.nextButton.addEventListener('click', this._onClick.bind(this));
      this.nextButton.addEventListener('keypress', this._onClick.bind(this));
    },

    _onClick (e) {
      if (e.type === "keypress" && e.which !== 13) {
        return;
      }
      this[e.currentTarget === this.previousButton ? 'previous' : 'next'].call(this);
      e.preventDefault();
    },

    _activate (index) {
      const isFirst = (index === 0);
      const isLast = (index === (this.children.length - 1));
      const visibleClassName = Util.classNames.VISIBLE;
      const disabledClassName = Util.classNames.DISABLED;

      Array.prototype.forEach.call(this.children, function(child, i) {
        if (i === index) {
          child.style.display = 'block';
          child.classList.add(visibleClassName);
        } else {
          child.style.display = 'none';
          child.classList.remove(visibleClassName);
        }
      })

      if (isFirst) {
        this.previousButton.classList.add(disabledClassName);
        this.previousButton.setAttribute('disabled', 'true');
      } else {
        this.previousButton.classList.remove(disabledClassName);
        this.previousButton.removeAttribute('disabled');
      }

      if (isLast) {
        this.nextButton.classList.add(disabledClassName);
        this.nextButton.setAttribute('disabled', 'true');
      } else {
        this.nextButton.classList.remove(disabledClassName );
        this.nextButton.removeAttribute('disabled');
      }

      this.active = index;
    },

    _maybeScroll (el) {
      if (!this.options.scrollToTop) {
        return;
      }
      const rect = el.getBoundingClientRect();
      if (rect.top < 0 || rect.bottom > (window.innerHeight || document.documentElement.clientHeight)) {
        el.scrollIntoView({ block: "start",  inline: "nearest",  behavior: "smooth" });
      }
    },

    previous () {
      if (this.previousButton.classList.contains(Util.classNames.DISABLED) || this.active === 0) {
        return;
      }
      this._activate(this.active - 1);
      this._maybeScroll(this.el.parentNode);
      Util.triggerEvent(this.el, Event.PREVIOUS, { relatedTarget: this.children[this.active] });
    },

    next () {
      if (this.nextButton.classList.contains(Util.classNames.DISABLED) || this.active === (this.children.length - 1)) {
        return;
      }
      this._activate(this.active + 1);
      this._maybeScroll(this.el.parentNode);
      Util.triggerEvent(this.el, Event.NEXT, { relatedTarget: this.children[this.active] });
    }

  });

  function createCarousels(container) {
    const elements = (container || document).querySelectorAll(`:not(${Selector}) ${Selector}`);
    elements.forEach(el => {
      el.removeAttribute('data-element');
      el.classList.remove('js-carousel');
      new Carousel(el);
    });
  }

  document.addEventListener('data:loaded', () => {
    createCarousels(document);
  });

  document.addEventListener('template:render', event => {
    createCarousels(event.detail.relatedTarget);
  });

})();

// Table of Contents
(function() {
  'use strict';

  const NAME = Util.extensions.TABLE_OF_CONTENTS;

  const Event = {
    RENDER: `${NAME}:${Util.events.RENDER}`,
  };

  const Selector = Util.selectors.TABLE_OF_CONTENTS;

  window.TableOfContents = Util.createExtension({
    name: NAME,

    defaults: {
      parentElement: null,
      heading: '',
      selector: '.content h2',
      anchorLinks: true,
      generateIds: true,

      // The ID of the custom template to use when generating HTML
      template: 'table-of-contents',

      // Additional data to expose to the template
      templateData: {}
    },

    optionTypes: {
      parentElement: '(window|element|string|null)',
      heading: 'string',
      selector: 'string',
      anchorLinks: 'boolean',
      generateIds: 'boolean',
      template: '(string|null)',
      templateData: 'object'
    },

    initialize (options) {
      // Validate header selector
      const selector = options.selector;
      if (typeof selector !== 'string') {
        throw new TypeError('Selectors must be a string');
      }

      let parentElement = this._getParentElement();
      let headings = Array.prototype.slice.call(parentElement.querySelectorAll(this.options.selector));
      if (!headings) {
        return;
      }

      let validTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
      let target = null;

      // Only include <h1> - <h6> headings
      let filteredHeadings = headings.filter((heading) => {
        if (options.generateIds === false && !heading.id) {
          return false;
        }
        return validTags.indexOf(heading.tagName.toLowerCase()) !== -1;
      });

      let existingHeadingIds = filteredHeadings
        .map(heading => heading.id)
        .filter((heading, index, arr) => heading && arr.indexOf(heading) === index);

      let headingNumber = 1;
      filteredHeadings.forEach((heading) => {
        if (heading.id) {
          headingNumber ++;
        } else {
          if (options.generateIds === true) {
            let id = `heading-${headingNumber++}`;
            while (existingHeadingIds.indexOf(id) !== -1) {
              id = `heading-${headingNumber++}`;
            }
            heading.id = id;
          } else {
            headingNumber ++;
          }
        }

        if (heading.id && window.location.hash === (`#${heading.id}`)) {
          target = heading;
        }

        // Maybe add an anchor link
        this._maybeAddAnchorLink(heading);
      });

      this.render(this._structureItems(filteredHeadings));

      // Scroll the target into view if it's a dynamic element
      if (target) {
        setTimeout(() => { Util.scrollIntoView(target, 50) }, 50);
      }
    },

    _maybeAddAnchorLink (heading) {
      if (this.options.anchorLinks === true && heading.querySelectorAll('a').length === 0) {
        heading.appendChild(this.getAnchorLink(heading));
      }
    },

    getAnchorLink (heading) {

      // Look for a custom micro-template
      const anchorLinkTemplate = document.querySelector('#tmpl-anchor-link');
      if (anchorLinkTemplate && anchorLinkTemplate.innerHTML) {
        const compiled = Util.template(anchorLinkTemplate.innerHTML);
        const data = { heading };
        const html = compiled(data).replace(/(^\s+|\s+$)/g, '');
        const el = this.createHTMLNodeFromHTMLString(html);
        if (el.tagName === 'A') {
          return el;
        }
      }

      // Return the default micro-template
      const a = document.createElement('A');
      a.className = 'link-anchor';
      a.href = '#' + heading.id;
      a.innerHTML = `
        <svg class="fill-current" width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M14.4833094,12.7886331 C14.0159137,12.3212374 13.2557698,12.3212374 12.7883741,12.7886331 C11.3861871,14.1908201 9.10109353,14.1908201 7.69873381,12.7886331 L3.45906475,8.54896403 C2.77920863,7.86910791 2.40621583,6.96733813 2.40621583,6.00423022 C2.40621583,5.0411223 2.77919137,4.13935252 3.45906475,3.4594964 C4.8612518,2.05730935 7.14159712,2.05730935 8.54870504,3.4594964 L11.1548201,6.06561151 C11.6222158,6.53300719 12.3823597,6.53300719 12.8497554,6.06561151 C13.3171511,5.59821583 13.3171511,4.83807194 12.8497554,4.37067626 L10.2436403,1.76456115 C7.90661871,-0.572460432 4.10119424,-0.572460432 1.76421583,1.76456115 C0.631122302,2.89765468 0.00789928058,4.39899281 0.00789928058,6.00423022 C0.00789928058,7.60471942 0.631122302,9.11080576 1.76421583,10.2438993 L6.00388489,14.4835683 C7.1747482,15.6497266 8.70915108,16.2351367 10.243554,16.2351367 C11.7779568,16.2351367 13.3123597,15.6497266 14.483223,14.4835683 C14.9506187,14.0161727 14.9506187,13.2560288 14.483223,12.7886331 L14.4833094,12.7886331 Z"></path>
          <path d="M22.2353957,13.7564029 L17.9957266,9.51673381 C15.658705,7.17971223 11.8532806,7.17971223 9.51630216,9.51673381 C9.04890647,9.9841295 9.04890647,10.7442734 9.51630216,11.2116691 C9.98369784,11.6790647 10.7438417,11.6790647 11.2112374,11.2116691 C12.6134245,9.80948201 14.8937698,9.80948201 16.3008777,11.2116691 L20.5405468,15.4513381 C21.2204029,16.1311942 21.5933957,17.032964 21.5933957,17.9960719 C21.5933957,18.9591799 21.2204201,19.8609496 20.5405468,20.5408058 C19.1808345,21.900518 16.8107914,21.900518 15.4509065,20.5408058 L12.8494964,17.9346906 C12.3821007,17.467295 11.6219568,17.467295 11.1545612,17.9346906 C10.6871655,18.4020863 10.6871655,19.1622302 11.1545612,19.6296259 L13.7606763,22.231036 C14.8937698,23.3641295 16.3998561,23.9873525 18.0003453,23.9873525 C19.6008345,23.9873525 21.1069209,23.3641295 22.2400144,22.231036 C23.3731079,21.0979424 23.9963309,19.5918561 23.9963309,17.9913669 C23.9916095,16.3908777 23.3684029,14.8895396 22.2353094,13.756446 L22.2353957,13.7564029 Z"></path>
        </svg>`;
      return a;
    },

    createHTMLNodeFromHTMLString (htmlString) {
      const range = document.createRange();
      const fragment = range.createContextualFragment(htmlString);
      return fragment.firstChild;
    },

    _structureItems (headings) {
      let data = { allItems: [], items: [] };
      let lastObj = undefined;
      const tagsToReplace = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;'
      };

      headings.forEach((heading, index) => {
        let level = heading.outerHTML.match(/<h([\d]).*>/)[1];
        let name = Array.prototype.slice.call(heading.childNodes)
          .map((child) => {
            if (child.nodeType === 8) return null
            let childText = child.textContent.trim()
            return childText.replace(/[&<>]/g, (tag) => tagsToReplace[tag] || tag)
          })
          .filter((text) => text && text !== '#')
          .join(' ');

        let obj = {
          id: heading.id,
          level,
          name,
          html_url: `#${heading.id}`,
          parent: null,
          children: []
        };

        data.allItems.push(obj);

        // First heading
        if (index === 0) {
          data.items.push(obj);
          lastObj = obj;
        }

        else {
          if (obj.level === lastObj.level) {
            obj.parent = lastObj.parent;
            if (obj.parent) {
              obj.parent.children.push(obj);
            } else {
              data.items.push(obj);
            }
            lastObj = obj;
          } else if (obj.level > lastObj.level) {
            obj.parent = lastObj;
            obj.parent.children.push(obj);
            lastObj = obj;
          } else {
            while (1) {
              if (lastObj.level < obj.level) {
                lastObj.children.push(obj);
                lastObj = obj;
                break;
              }
              if (lastObj.level === obj.level) {
                obj.parent = lastObj.parent;
                if (obj.parent) {
                  obj.parent.children.push(obj);
                } else {
                  data.items.push(obj);
                }
                lastObj = obj;
                break;
              }
              lastObj = lastObj.parent;
              if (lastObj === null) {
                data.items.push(obj);
                lastObj = obj;
                break;
              }
            }
          }
        }
      });
      return data;
    },

    _getParentElement () {
      const parentElement = this.options.parentElement;
      if (!parentElement) {
        return document;
      }
      if (Util.isElement(parentElement)) {
        return parentElement;
      }
      if (typeof parentElement === 'string') {
        return document.querySelector(parentElement) || document;
      }
      return document;
    },

    render (data) {
      const options = this.options;
      const el = this.el;

      data = Util.extend(options, this.options.templateData, data);

      Util.renderTemplate(el, options.template, data);
      Util.triggerEvent(el, Event.RENDER, { relatedTarget: el });
    }

  });

  document.addEventListener('data:loaded', () => {
    const elements = document.querySelectorAll(Selector);
    elements.forEach(el => {
      const id = el.id || null;
      const options = id && Util.isObject(Theme.elements[id]) ? Theme.elements[id] : {};
      new TableOfContents(el, options);
      el.removeAttribute('data-element');
    });
  });

})();

// Notifications
(function() {
  'use strict';

  const NAME = Util.extensions.NOTIFICATION;

  window.Notifications = Util.createExtension({
    name: NAME,

    defaults: {
      // Content
      content: '',
      labels: '',

      // Style
      color_scheme: 'success', // success, warning, danger,
      icon: 'far fa-circle-check',

      // Functionality
      dismissible: false,

      template: 'notifications',
      templateData: {}
    },

    optionTypes: {
      content: 'string',
      labels: 'string',
      color_scheme: 'string',
      icon: 'string',
      dismissible: 'boolean',
      template: '(string|null)',
      templateData: 'object'
    },

    sessionStorageKey (id) {
      return `notification_${id}:dismissed`
    },

    isDismissed (id) {
      return window.sessionStorage.getItem(this.sessionStorageKey(id)) === 'true';
    },

    async initialize (options) {
      const elementId = this.el.id
      options.id = elementId
      if (options.dismissible && !elementId) {
        console.error('Dismissible notifications must be given a valid ID');
        options.dismissible = false;
      }

      // Maybe get content from an existing article using labels
      if (options.labels) {
        const articles = await Util.request(`/api/v2/help_center/articles/search.json?label_names=${options.labels}`).then(json => json.results);
        let targetArticle = null;
        if (articles.length) {
          if (options.dismissible) {
            targetArticle = articles.find(article => !this.isDismissed(article.id));
          } else {
            targetArticle = articles[0];
          }
        }
        if (!targetArticle) {
          console.warn(`No valid articles could be found for labels ${options.labels}`);
        } else {
          options.content = targetArticle.body;
        }
      }

      // Hide the notification is there's no content to display
      if (!options.content || options.content === '#') {
        this.el.classList.add('hidden');
        return;
      }

      this.render(options);
    },

    render (options) {
      const { template, templateData } = options;

      let templateString = Util.getTemplateStringForElement(this.el, template);
      if (!templateString) {
        console.warn('No notification template was provided');
        return;
      }

      options.content_plain = (options.content || '').replace(/(<([^>]+)>)/gi, '');
      const data = Util.extend(templateData, options);
      Util.renderTemplate(this.el, template, data)

      if (options.dismissible) {

        // Maybe hide the notification
        if (this.isDismissed(options.id)) {
          this.el.remove();
          return;
        }

        // Add the required button event listener
        const buttons = this.el.querySelectorAll('.js-close');
        if (buttons.length) {
          buttons.forEach(button => {
            button.addEventListener('click', this.dismiss.bind(this), { once: true});
          })
        }
      }
    },

    dismiss () {
      const el = this.el;
      const id = this.el.id;
      Util.onTransitionEnd(el, function() { el.remove(); });
      el.classList.remove('opacity-100');
      Util.reflow(el);
      el.classList.add('opacity-0');

      // Mark the notification as dismissed
      window.sessionStorage.setItem(this.sessionStorageKey(id), 'true');
    }

  });

  document.addEventListener('data:loaded', () => {
    const notifications = document.querySelectorAll('.js-notification');
    if (notifications.length) {
      notifications.forEach(el => {
        const id = el.id || null;
        const options = id && Util.isObject(Theme.elements[id]) ? Theme.elements[id] : {};
        new Notifications(el, options);
        el.classList.remove('js-notification');
      });
    }
  });

})();

// System Status
(function() {
  'use strict';

  const NAME = Util.extensions.SYSTEM_STATUS;

  const Event = {
    RENDER: `${NAME}:${Util.events.RENDER}`,
  };

  const Selector = Util.selectors.SYSTEM_STATUS;

  window.SystemStatus = Util.createExtension({
    name: NAME,

    defaults: {
      subdomain: 'zenplates',
      service: 'statuspage.io',
      template: null,
      templateData: {}
    },

    optionTypes: {
      subdomain: 'string',
      service: 'string',
      template: '(string|null)',
      templateData: 'object'
    },

    initialize (options) {
      if (!options.subdomain) {
        console.error('No subdomain specified');
        return;
      }

      if (options.service === 'statuspage.io') {
        this.getStatuspage(options).then(this.render.bind(this));
      } else {
        console.error('Invalid service specified');
      }
    },

    getStatuspage (options) {
      let url = `https://${options.subdomain}.statuspage.io/api/v2/status.json`;
      return fetch(url)
        .then((response) => response.json())
        .then((json) => json.status);
    },

    render (status) {

      let templateString = Util.getTemplateStringForElement(this.el, this.options.template);
      if (!templateString) {
        if (this.options.service === 'statuspage.io') {
          templateString = `
            <% if (indicator) { %>
              <a class="nav-link inline-flex align-items-center" href="https://<%= subdomain %>.statuspage.io" target="_blank">
                <% if (indicator === "critical") { %><span class="w-3 h-3 flex-shrink-0 bg-red-500 circle"></span><% } %>
                <% if (indicator === "major") { %><span class="w-3 h-3 flex-shrink-0 bg-orange-500 circle"></span><% } %>
                <% if (indicator === "minor") { %><span class="w-3 h-3 flex-shrink-0 bg-orange-500 circle"></span><% } %>
                <% if (indicator === "none") { %><span class="w-3 h-3 flex-shrink-0 bg-green-500 circle"></span><% } %>
                <% if (["critical", "major", "minor", "none"].indexOf(indicator) === -1) { %><span class="w-3 h-3 flex-shrink-0 bg-gray-500 circle"></span><% } %>
                <span class="ml-3"><%= description %></span>
              </a>
            <% } %>`;
        }
      }

      const templateData = this.options.templateData;
      const data = Util.extend(templateData, {
        subdomain: this.options.subdomain,
        indicator: status.indicator,
        description: status.description
      });

      const html = Util.compileTemplate(templateString, data);

      this.el = Util.updateHTML(this.el, html, { replaceElement: true });

      Util.triggerEvent(this.el, Event.RENDER, { relatedTarget: this.el });
      Util.triggerEvent(document, 'template:render', { relatedTarget: this.el });
    }
  });

  document.addEventListener('data:loaded', () => {
    const elements = document.querySelectorAll(Selector);
    elements.forEach(el => {
      new SystemStatus(el);
      el.removeAttribute('data-element');
    });
  });

})();

// Elements
(function(Util) {
  'use strict';

  const PROPERTY_MAPPINGS = {
    breadcrumbs: {
      label: { selector: 'nav', attribute: 'aria-label' },
      links: {
        array: true,
        selector: 'a',
        nestedMappings: {
          title: { attribute: 'textContent' },
          current: { attribute: 'aria-current' },
          html_url: { attribute: 'href' }
        }
      }
    },
    pagination: {
      links: {
        array: true,
        selector: '.pagination-list li',
        nestedMappings: {
          class_name: { selector: '', attribute: 'className' },
          title: { selector: 'span[class$="-text"]', attribute: 'textContent' },
          icon: { selector: 'span[class$="-icon"]', attribute: 'textContent' },
          html_url: { selector: 'a', attribute: 'href' }
        }
      }
    },
    sharing: {
      heading: 'h4',
      links: {
        array: true,
        selector: 'a',
        nestedMappings: {
          title: { attribute: 'aria-label' },
          description: { selector: 'svg', attribute: 'aria-label' },
          html_url: { attribute: 'href' },
          icon: { selector: 'svg', attribute: 'outerHTML' }
        }
      }
    },
    'related-articles': {
      heading: { selector: '.related-articles-title' },
      articles: {
        array: true,
        selector: 'li',
        nestedMappings: {
          title: { selector: 'a' },
          html_url: { selector: 'a', attribute: 'href' }
        }
      }
    },
    'recently-viewed-articles': {
      heading: { selector: '.recent-articles-title' },
      articles: {
        array: true,
        selector: 'li',
        nestedMappings: {
          title: { selector: 'a' },
          html_url: { selector: 'a', attribute: 'href' }
        }
      }
    },
    'recent-activity': {
      heading: { selector: '.recent-activity-header' },
      activities: {
        array: true,
        selector: '.recent-activity-item',
        nestedMappings: {
          title: { selector: '.recent-activity-item-link' },
          html_url: { selector: '.recent-activity-item-link', attribute: 'href' },
          date: { selector: '.recent-activity-item-time' },
          comment_count: { selector: '.recent-activity-comment-icon', attribute: 'data-comment-count' },
          comment_text: { selector: '.recent-activity-accessibility-label' },
          parent: {
            selector: 'h3',
            nestedMappings: {
              title: { selector: 'a' },
              html_url: { selector: 'a', attribute: 'href' }
            }
          }
        }
      },
      empty: { selector: '.recent-activity-no-activities' },
    }
  };
  const BG_COLOR_VARIABLE = '--bg-color';

  function hasBackgroundColor (element) {
    if (!element) {
      return false;
    }
    const bgColor = window.getComputedStyle(element).backgroundColor;
    return bgColor && bgColor !== 'rgba(0, 0, 0, 0)';
  }

  function findBackgroundElement (element) {
    if (!element) {
      return null;
    }

    if (hasBackgroundColor(element)) {
      return element;
    }

    for (let depth = 0; depth < 2; depth++) {
      // Do nothing if there's no element
      if (!element) {
        return null;
      }

      const children = element.children;
      for (let child of children) {
        if (hasBackgroundColor(child)) {
          return child;
        }
      }

      // Move one level deeper
      element = children.length ? children[0] : null;
    }
    return null;
  }

  function mergeData (target, source) {
    if (typeof target !== 'object' || target === null) {
      return source
    }
    if (typeof source !== 'object' || source === null) {
      return target
    }

    // Extend arrays, like "blocks"
    if (Array.isArray(target) && Array.isArray(source)) {
      return [...target, ...source]
    }

    const merged = { ...target }
    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        merged[key] = mergeData(target[key], source[key])
      }
    }

    return merged
  }

  function updateFixedHeader () {
    const header = document.querySelector('.header.fixed-header');
    if (!header) {
      return;
    }

    const pageContainer = document.getElementById('page-container');
    const firstElement = pageContainer?.firstElementChild ?? null;
    if (firstElement && firstElement.classList.contains('offset-fixed-header')) {
      header.classList.add('is-fixed', 'fixed-header', 'absolute-top', 'transition-none');
      document.documentElement.classList.add('has-fixed-header');
      Util.reflow(header);
    } else {
      header.classList.remove('fixed-header');
    }
  }

  function loadAlpineComponents () {

    Alpine.magic('theme', () => ({
      // Returns true if a theme image asset exists
      hasImage (id) {
        return !!(window.Theme && window.Theme.images && window.Theme.images[id]);
      },
      // Returns a theme image URL
      image (id, defaultSrc = '') {
        if (this.hasImage(id)) {
          return window.Theme.images[id];
        }
        return defaultSrc;
      },
      // Returns true if an SVG symbol with the given ID exists
      hasSymbol (id) {
        return !!document.getElementById(id);
      },
      // Returns an SVG symbol href
      symbol (id) {
        return '#' + id;
      },
    }));

    //
    // Helpers
    //

    Alpine.data('inlineSVG', (options = {}) => ({
      init () {
        this.$nextTick(() => {
          try {
            Util.replaceWithSVG(this.$el);
          } catch (err) {
            console.error('Could not replace image with inline SVG', err);
          }
        });
      }
    }));

    Alpine.data('parallax', (options = {}) => ({
      offset: 0,

      // Cache transform property with vendor prefix detection
      transformProperty: (function() {
        const el = document.createElement('div');
        const prefixes = ['transform', 'webkitTransform', 'mozTransform'];
        for (const prefix of prefixes) {
          if (prefix in el.style) return prefix;
        }
        return 'transform';
      })(),

      init () {
        // Early return if reduced motion is preferred
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          return;
        }

        // Set initial styles
        this.$el.style.height = '150%';
        this.$el.style.willChange = 'transform';

        // Setup initial dimensions
        this.onResize();

        // Bind methods to preserve context and avoid recreation
        this.boundOnResize = this.onResize.bind(this);
        this.scrollScheduled = false;
        this.boundOnScroll = () => {
          if (!this.scrollScheduled) {
            this.scrollScheduled = true;
            requestAnimationFrame(() => {
              this.onScroll();
              this.scrollScheduled = false;
            });
          }
        };

        // Add event listeners
        window.addEventListener('scroll', this.boundOnScroll, { passive: true });

        Util.onImagesLoaded().then(this.boundOnResize);

        new ResizeObserver(this.boundOnResize).observe(this.$el);
      },

      destroy () {
        window.removeEventListener('scroll', this.boundOnScroll);
      },

      onResize () {
        this.offset = Math.round(this.$el.getBoundingClientRect().height) * 0.75;
        this.$el.style.top = `-${this.offset}px`;
        this.onScroll();
      },

      onScroll () {
        const rect = this.$el.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        // Calculate how far the element has moved into view (0 when bottom of screen, 1 when fully in view)
        const progress = 1 - (rect.top + rect.height) / (windowHeight + rect.height);

        // You can tweak the parallax factor (e.g. 50px max movement)
        const maxParallax = this.offset; // already set to 75% of element height
        const y = progress * maxParallax;

        this.$el.style[this.transformProperty] = `translate3d(0px, ${y}px, 0px)`;
      }
    }));

    //
    // Basic
    //

    Alpine.data('link', (options  = {}) => ({
      isExternal: null,

      init () {
        const host = this.$el.host
        this.isExternal = host && host !== window.location.host;
        if (this.isExternal) {
          this.$el.target = '_blank';
        }
      }
    }));

    Alpine.data('toggle', (options  = {}) => ({
      isOpen: false,

      toggle () {
        if (this.isOpen) {
          this.close();
        } else {
          this.open();
        }
      },

      open () {
        this.isOpen = true;
      },

      close () {
        this.isOpen = false;
      }
    }));

    Alpine.data('navTabs', (options  = {}) => ({
      hiddenItems: [],
      isLoading: true,
      isResizing: false,

      init () {
        const observer = new MutationObserver(this.calculateTabs.bind(this));
        observer.observe(this.$refs.nav, { childList: true, subtree: true });

        window.addEventListener('resize', this.calculateTabs.bind(this));
      },

      calculateTabs () {
        this.isResizing = true;
        this.hiddenItems = [];

        this.$nextTick(() => {
          const $nav = this.$refs.nav;
          const $menu = $nav.nextElementSibling;
          const width = $nav.parentElement.clientWidth;
          let totalWidth = $menu.offsetWidth;

          [...$nav.children].forEach(child => {
            totalWidth += child.offsetWidth;
            if (totalWidth > width) {
              this.hiddenItems.push(child.id);
            }
          });

          this.$nextTick(() => {
            this.isLoading = false;
            this.isResizing = false;
          });
        });

      }
    }));

    Alpine.data('collapsibleNav', (options  = {}) => ({
      classNames: {
        EXPANDED: Util.classNames.EXPANDED
      },

      init () {
        this.$el.addEventListener('click', this.toggle.bind(this));
      },

      toggle (event) {
        const $el = this.$el;
        const maxHeight = window.getComputedStyle($el).maxHeight;
        if (maxHeight === 'none') {
          return;
        }
        let isExpanded = $el.getAttribute('aria-expanded') === 'true';
        let navLink = event.target;

        if (isExpanded) {

          // Close the nav if the clicked link is selected
          if (navLink.getAttribute('aria-selected') === 'true') {
            $el.setAttribute('aria-expanded', 'false');
            $el.classList.remove(this.classNames.EXPANDED);
            navLink.setAttribute('aria-selected', 'false');
            event.preventDefault();
          }
        } else {

          // Open the nav if it's closed
          $el.setAttribute('aria-expanded', 'true');
          $el.classList.add(this.classNames.EXPANDED);
          navLink.setAttribute('aria-selected', 'true');
          event.preventDefault();
        }
      }
    }));

    Alpine.data('darkModeSwitch', (options  = {}) => ({
      darkMode: false,

      init () {
        // Set initial state
        const sessionStorage = window.sessionStorage.getItem('dark-mode');
        if (sessionStorage === null) {
          const matchMedia = window.matchMedia("(prefers-color-scheme: dark)");
          const prefersDarkMode = matchMedia.matches;
          this.darkMode = prefersDarkMode;
          window.sessionStorage.setItem('dark-mode', prefersDarkMode ? 'true' : 'false');
        } else {
          this.darkMode = sessionStorage === 'true';
        }

        document.addEventListener('dark-mode', (event) => {
          if (event.detail?.enabled === true) {
            if (!this.darkMode) {
              this.enableDarkMode();
            }
          } else if (this.darkMode) {
            this.disableDarkMode();
          }
        });
      },

      toggleDarkMode () {
        if (this.darkMode) {
          this.disableDarkMode();
        } else {
          this.enableDarkMode();
        }
      },

      enableDarkMode () {
        this.darkMode = true;
        window.sessionStorage.setItem('dark-mode', 'true');
        document.documentElement.classList.add('dark-mode');
        Util.triggerEvent(document, 'dark-mode', { enabled: true });
      },

      disableDarkMode () {
        this.darkMode = false;
        window.sessionStorage.setItem('dark-mode', 'false');
        document.documentElement.classList.remove('dark-mode');
        Util.triggerEvent(document, 'dark-mode', { enabled: false });
      }
    }));

    //
    // Elements
    //

    Alpine.data('header', (options  = {}) => ({
      definition: {},

      // Header state
      isFixed: false,
      isSticky: false,
      hideOnScroll: false,
      isStuck: null,
      isUnstuck: null,

      // Menu state
      isOpen: false,
      isTransitioning: false,

      // Default transitions
      transitions: {
        'standard': {
          'x-transition.opacity': true
        },
        'slide-in': {
          'x-transition:enter': 'translate-x-full',
          'x-transition:enter-start': 'translate-x-full',
          'x-transition:enter-end': 'translate-x-0',
          'x-transition:leave': 'translate-x-0',
          'x-transition:leave-start': 'translate-x-0',
          'x-transition:leave-end': 'translate-x-full'
        },
        'zoom-in': {
          'x-transition:enter': 'opacity-0 scale-95',
          'x-transition:enter-start': 'opacity-0 scale-95',
          'x-transition:enter-end': 'opacity-100 scale-100',
          'x-transition:leave': 'opacity-100 scale-100',
          'x-transition:leave-start': 'opacity-100 scale-100',
          'x-transition:leave-end': 'opacity-0 scale-95',
        },
        ...(options.transitions || {})
      },

      // Bindings
      trigger: {
        [':aria-expanded']() {
          return this.isOpen;
        },
        ['@click'](event) {
          this.toggle(event);
        },
      },

      menu: {
        ['x-ref']: 'menu',
        ['x-show']() {
          return this.isOpen;
        },
        ['@transitionend'](event) {
          this.onTransitionEnd(event);
        },
        [':class']() {
          return this.navClasses();
        },
        ['x-bind']() {
          return this.transitions[this.definition.style || ''] || {};
        }
      },

      get isMenuOpen () {
        const style = this.definition.style || 'standard';
        if (style === 'slide-in') {
          return this.isOpen || this.isTransitioning;
        }
        return this.isOpen;
      },

      init () {
        this.definition = Util.getProperty(Theme, 'elements.header') || {};
        const { fixed = false, sticky = 'none', breakpoint = '', style = '' } = this.definition;

        const $el = this.$el;

        document.documentElement.classList.add(`nav-style-${style}`);

        // Maybe set up fixed header
        this.isFixed = fixed && $el.classList.contains('fixed-header');

        // Maybe set up sticky header
        const isSticky = ['always', 'on-scroll-up'].includes(sticky);
        if (isSticky) {
          this.applyStickyHeader(sticky, breakpoint);
        }

        $el.classList.remove('transition-none');

        this.addEventListeners();
      },

      applyStickyHeader (stickyBehavior, breakpoint) {
        const $el = this.$el;
        $el.classList.add('sticky-header', 'sticky-top', 'transition');
        document.documentElement.classList.add('has-sticky-header');

        const hideOnScroll = stickyBehavior === 'on-scroll-up';
        if (hideOnScroll) {
          document.documentElement.classList.add('hide-on-scroll');
        }

        // Create a new Sticky instance
        new Sticky($el, {
          hide: hideOnScroll,
          tolerance: 20,
          classNames: {
            hidden: `${breakpoint}:translate-y-full`
          }
        });

        this.isSticky = true;

        $el.addEventListener('sticky:stuck', this.onStuck.bind(this));
        $el.addEventListener('sticky:unstuck', this.onUnstuck.bind(this));
      },

      addEventListeners () {
        window.addEventListener('keydown', (event) => {
          if (event.key === 'Escape') {
            this.close();
          }
        });
        window.addEventListener('resize', Util.debounce(this.close.bind(this), 500));
      },

      navClasses () {
        const { layout = '', breakpoint = 'md', style = 'standard' } = this.definition;
        const infix = `${breakpoint}:`
        const justification = layout === 'links-left' ? 'start' : layout === 'links-center' ? 'center' : 'end';

        // Menu-related class names
        const classNames = [
          'nav', 'menu', `menu-${style}`, `menu-${layout}`,

          // Responsive class names
          `${infix}flex`, `${infix}align-items-center`, `${infix}menu-expanded`, `${infix}justify-content-${justification}`
        ];
        return classNames.join(' ');
      },

      toggle () {
        if (this.isOpen) {
          this.close();
        } else {
          this.open();
        }
      },

      open () {
        if (!this.isOpen) {
          this.isTransitioning = true;
          this.isOpen = true;
          this.setTransitionFallback();
        }
      },

      close () {
        if (this.isOpen) {
          this.isTransitioning = true;
          this.isOpen = false;
          this.setTransitionFallback();
        }
      },

      onTransitionEnd () {
        this.isTransitioning = false;
      },

      setTransitionFallback () {
        if (this.transitionTimeout) {
          clearTimeout(this.transitionTimeout);
        }
        this.transitionTimeout = setTimeout(() => {
          this.onTransitionEnd();
        }, 350);
      },

      onStuck () {
        this.isStuck = true;
        this.isUnstuck = false;
      },

      onUnstuck () {
        this.isStuck = false;
        this.isUnstuck = true;
      }
    }));

    Alpine.data('headerSearch', (options  = {}) => ({
      isVisible: false,

      showSearch () {
        this.isVisible = true;
        this.$nextTick(() => {
          const $overlay = this.$refs.overlay
          const searchField = $overlay ? $overlay.querySelector('.search input[type="search"]') : null;
          if (searchField) {
            searchField.focus();
          }
        });
      },

      hideSearch () {
        this.isVisible = false;
        this.$nextTick(() => {
          const $root = this.$root;
          const searchButton = $root.querySelector('.search-button');
          if (searchButton) {
            searchButton.focus();
          }
        });
      }
    }));

    Alpine.data('hero', (options  = {}) => ({
      alignment: '', // left, center
      imageStyle: '', // standard, parallax, overlay, overlay-pattern, gradient
      gradient: '', // linear, radial, conic

      init () {
        if (document.readyState === 'loading') {
          document.addEventListener('elements:init', this.loadData.bind(this))
        } else {
          this.loadData();
        }
      },

      loadData () {
        const $el = this.$el;
        const elementId = $el.id || null;
        const allElementData = window.Theme.elements;
        const elementData = allElementData[elementId] || allElementData['hero'] || {};

        if (elementData.alignment) {
          this.alignment = elementData.alignment;
        }
        if (elementData.imageStyle) {
          this.imageStyle = elementData.imageStyle;
        }
        if (elementData.gradient) {
          this.gradient = elementData.gradient;
        }

        if (this.imageStyle === 'parallax') {
          const imageEl = $el.querySelector('.hero-background-image');
          if (imageEl) {
            imageEl.setAttribute('x-data', 'parallax()');
            Alpine.initTree(imageEl);
          }
        }
      }
    }));

    Alpine.data('dropdown', (options  = {}) => ({
      isExpanded: false,

      wrapper: {
        ['@keydown.window.escape'](event) {
          if (this.isExpanded) {
            this.close(event);
          }
        },
        ['@click.away'](event) {
          if (this.isExpanded) {
            this.close(event);
          }
        }
      },

      trigger: {
        ['x-ref']: 'toggle',
        ['@click'](event) {
          this.toggle(event);
        },
        ['@keydown'](event) {
          this.toggleKeyHandler(event);
        },
        ['x-bind:aria-expanded']() {
          return this.isExpanded;
        },
        ['aria-has-haspopup']: 'true'
      },

      menu: {
        ['x-ref']: 'menu',
        ['x-show']() {
          return this.isExpanded;
        },
        ['@keydown'](event) {
          this.menuKeyHandler(event);
        },
        ['role']: 'menu'
      },

      get focusableElements () {
        return [...this.dropdownMenu.querySelectorAll('a[href], button, input, textarea, select, details,[tabindex]:not([tabindex="-1"])')]
          .filter(el => !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden'));
      },

      get dropdownMenu () {
        return this.$refs.menu;
      },

      toggle () {
        if (this.isExpanded) {
          this.close();
        } else {
          this.open();
        }
      },

      open () {
        this.isExpanded = true;
        this.setPosition();
        this.updatePosition();
      },

      close () {
        const menu = this.dropdownMenu;
        if (menu) {
          menu.style.top = menu.style.left = menu.style.bottom = menu.style.maxHeight = null;
          menu.classList.remove('block', 'overflow-auto');
          menu.classList.add('hidden', 'invisible');
          this.isExpanded = false;
        }
      },

      setPosition () {
        const menu = this.dropdownMenu
        if (menu) {
          menu.style.top = menu.style.left = '0px';
          menu.classList.remove('hidden');
          menu.classList.add('block', 'invisible', 'fixed');
        }
      },

      updatePosition () {
        const menu = this.dropdownMenu;
        const gap = 20;

        // Window properties
        const windowInnerWidth = document.documentElement.clientWidth;
        const windowInnerHeight = document.documentElement.clientHeight;
        const elClientBoundingRect = this.$el.getBoundingClientRect();

        // Get computed style
        let menuComputedStyle = window.getComputedStyle(menu);
        let marginTop = parseInt(menuComputedStyle.getPropertyValue('margin-top'), 0);
        let marginBottom = parseInt(menuComputedStyle.getPropertyValue('margin-bottom'), 0);
        let marginLeft = parseInt(menuComputedStyle.getPropertyValue('margin-left'), 0);
        let marginRight = parseInt(menuComputedStyle.getPropertyValue('margin-right'), 0);
        let borderTopWidth = parseInt(menuComputedStyle.getPropertyValue('border-top-width'), 0);
        let borderBottomWidth = parseInt(menuComputedStyle.getPropertyValue('border-bottom-width'), 0);
        let borderLeftWidth = parseInt(menuComputedStyle.getPropertyValue('border-left-width'), 0);
        let borderRightWidth = parseInt(menuComputedStyle.getPropertyValue('border-right-width'), 0);
        let menuScrollWidth = menu.scrollWidth + marginLeft + marginRight + borderLeftWidth + borderRightWidth;
        let menuScrollHeight = menu.scrollHeight + marginTop + marginBottom + borderTopWidth + borderBottomWidth;

        // Hide the menu
        menu.classList.add('hidden', 'invisible');
        menu.classList.remove('block');

        // Menu extends beyond left edge of screen
        if (elClientBoundingRect.x < gap) {
          let difference = Math.abs(Math.round(gap - elClientBoundingRect.x));

          // Set the left position
          let left = Math.abs(difference);
          menu.style.left = left + 'px';

          // Maybe adjust the maximum width
          if ((left + menuScrollWidth) > windowInnerWidth) {
            menu.style.maxWidth = windowInnerWidth + 'px';
          }
        }

        // Menu extends beyond right edge of screen
        else if ((elClientBoundingRect.x + menuScrollWidth) > (windowInnerWidth - gap)) {
          let difference = Math.abs(Math.round((windowInnerWidth - gap) - (elClientBoundingRect.x + menuScrollWidth)));
          if (elClientBoundingRect.x - difference >= 0) {
            menu.style.left = '-' + difference + 'px';
          } else {
            menu.style.left = '-' + elClientBoundingRect.x + 'px';
            menu.style.maxWidth = 'calc(100vw - ' + (elClientBoundingRect.x * 2) + 'px)';
          }
        }

        // Extends beyond bottom edge of screen
        if ((elClientBoundingRect.bottom + menuScrollHeight) >= windowInnerHeight) {
          let elMidpoint = elClientBoundingRect.top + (elClientBoundingRect.height / 2);
          let windowMidpoint = windowInnerHeight / 2;

          // More space below element
          if (elMidpoint <= windowMidpoint) {

            // Adjust maximum height
            menu.style.top = '100%';
            menu.style.bottom = null;
            menu.style.maxHeight = 'calc(100vh - ' + (elClientBoundingRect.bottom + marginTop + borderTopWidth) + 'px)';
          }

          // More space above element
          else {

            // Adjust maximum height
            menu.style.top = null;
            menu.style.bottom = '100%';
            menu.style.maxHeight = 'calc(100vh - ' + ((windowInnerHeight - elClientBoundingRect.top) + marginBottom + borderBottomWidth) + 'px)';
          }
        } else {

          // Undo initial placement
          menu.style.top = '100%';
          menu.style.bottom = null;
          menu.style.maxHeight = null;
        }

        // Show menu
        menu.classList.remove('hidden', 'invisible', 'fixed');
        menu.classList.add('block', 'overflow-auto');
        menu.style.position = null;
      },

      focusNextMenuItem (currentItem) {
        if (!this.focusableElements.length) {
          return;
        }
        let currentIndex = this.focusableElements.indexOf(currentItem);
        let nextIndex = currentIndex === this.focusableElements.length - 1 || currentIndex < 0 ? 0 : currentIndex + 1;
        this.focusableElements[nextIndex].focus();
      },

      focusPreviousMenuItem (currentItem) {
        if (!this.focusableElements.length) {
          return;
        }
        let currentIndex = this.focusableElements.indexOf(currentItem);
        let previousIndex = currentIndex <= 0 ? this.focusableElements.length - 1 : currentIndex - 1;
        this.focusableElements[previousIndex].focus();
      },

      toggleKeyHandler (event) {
        switch (event.keyCode) {
          case Util.keys.ENTER:
          case Util.keys.SPACE:
          case Util.keys.DOWN:
            event.preventDefault()
            if (!this.isExpanded) {
              this.open();
            }
            this.focusNextMenuItem();
            break;
          case Util.keys.UP:
            event.preventDefault();
            if (!this.isExpanded) {
              this.open();
            }
            this.focusPreviousMenuItem();
            break;
          case Util.keys.ESCAPE:
            this.close();
            if (this.$refs.toggle) {
              this.$refs.toggle.focus();
            }
            break;
        }
      },

      menuKeyHandler (event) {
        let firstItem = this.focusableElements[0];
        let lastItem = this.focusableElements[this.focusableElements.length - 1];
        let currentElement = event.target;

        switch (event.keyCode) {
          case Util.keys.ESCAPE:
            this.close();
            if (this.$refs.toggle) {
              this.$refs.toggle.focus();
            }
            break;
          case Util.keys.DOWN:
            event.preventDefault();
            this.focusNextMenuItem(currentElement);
            break;
          case Util.keys.UP:
            event.preventDefault();
            this.focusPreviousMenuItem(currentElement);
            break;
          case Util.keys.TAB:
            if (event.shiftKey) {
              if (currentElement === firstItem) {
                this.close();
              } else {
                event.preventDefault();
                this.focusPreviousMenuItem(currentElement);
              }
            } else if (currentElement === lastItem) {
              this.close();
            } else {
              event.preventDefault();
              this.focusNextMenuItem(currentElement);
            }
            break;
        }
      }
    }));

    Alpine.data('sidebar', (options  = {}) => ({

      init () {
        const targetNode = this.$el;
        const config = {
          childList: true,
          attributes: true,
          subtree: true
        };
        const observer = new MutationObserver(this.updateMaxHeight.bind(this));
        observer.observe(targetNode, config);
      },

      updateMaxHeight () {
        const rowHeight = this.$el.parentElement.offsetHeight;
        const sidebarHeight = this.$el.scrollHeight;
        if (sidebarHeight > rowHeight) {
          this.$el.style.maxHeight = '100%';
        }
      }
    }));

    Alpine.data('commentField', (options  = {}) => ({
      isVisible: false,

      show () {
        this.isVisible = true;
        this.$nextTick(() => {
          const commentField = this.$root.querySelector('textarea') || null;
          if (commentField) {
            commentField.click();
          }
        });
      }
    }));

    //
    // Extensions
    //

    // Scrollspy extension wrapper for use with AlpineJS
    Alpine.data('scrollspy', (options = {}) => ({
      offset: 0,
      activeElement: null,

      init () {
        this.addEventListeners();
        this.offset = options.offset || 0;
        new Scrollspy(this.$el, { offset: this.offset });
      },

      addEventListeners () {
        const $el = this.$el;
        $el.addEventListener('scrollspy:active', (event) => {
          this.activeElement = event.target;
        });
      }
    }));

    // Collapse extension wrapper for use with AlpineJS
    Alpine.data('collapse', (options = {}) => ({
      isExpanding: false,
      isCollapsing: false,
      isExpanded: false,
      id: null,
      breakpoint: null,

      trigger: {
        ['x-bind:data-toggle']() { return 'collapse' },
        ['x-bind:data-target']() { return `#${this.id}` },
        ['x-bind:aria-controls']() { return this.id },
        ['x-bind:aria-expanded']() { return this.isExpanded }
      },

      collapse: {
        ['x-bind:id']() { return this.id }
      },

      init () {
        this.id = options.id || Util.generateId();

        const breakpoint = options.breakpoint || null;
        const displayClass = options.displayClass || 'block';
        if (breakpoint) {
          const collapse = this.$el.querySelector('.collapse');
          if (collapse) {
            collapse.classList.add(`${breakpoint}:expand`, `${breakpoint}:${displayClass}`);
          }
        }

        this.breakpoint = breakpoint;

        this.addEventListeners();
      },

      addEventListeners () {
        this.$el.addEventListener('collapse:show', this.onShow.bind(this));
        this.$el.addEventListener('collapse:shown', this.onShown.bind(this));
        this.$el.addEventListener('collapse:hide', this.onHide.bind(this));
        this.$el.addEventListener('collapse:hidden', this.onHidden.bind(this));
      },

      onShow(event) { this.isExpanding = true; event.stopImmediatePropagation() },
      onShown(event) { this.isExpanded = true; this.isExpanding = false; event.stopImmediatePropagation() },
      onHide(event) { this.isCollapsing = true; event.stopImmediatePropagation() },
      onHidden(event) { this.isCollapsing = false; this.isExpanded = false; event.stopImmediatePropagation() }

    }));

    // SwiperJS wrapper for use with AlpineJS
    Alpine.data('slider', (options = {}) => ({
      hasSlides: false,
      isLoading: true,

      init () {
        this.hasSlides = !!document.querySelectorAll('.swiper-slide').length;
        if (this.hasSlides) {
          this.initializeSwiper();
        }
      },

      async initializeSwiper () {
        const swiperContainer = this.$el.querySelector('.swiper-container');
        const { numberSlides = 3, spaceBetween = 32 } = options;
        if (swiperContainer) {
          // Load the Swiper JavaScript and CSS
          const { default: Swiper } = await import('swiper');
          await Util.importStyleSheet('swiper');

          // Create the Swiper instance
          new Swiper(swiperContainer, {
            loop: false,
            threshold: 10,
            breakpoints: {
              0: {
                slidesPerView: 1,
                spaceBetween
              },
              768: {
                slidesPerView: numberSlides >= 2 ? 2 : 1,
                spaceBetween
              },
              960: {
                slidesPerView: numberSlides,
                spaceBetween
              }
            },
            pagination: {
              el: '.swiper-pagination'
            },
            navigation: {
              nextEl: '.swiper-next',
              prevEl: '.swiper-prev',
              disabledClass: 'opacity-0',
              hiddenClass: 'invisible'
            }
          });
          this.isLoading = false;
        }
      }
    }));

    Alpine.data('backToTop', (options = {}) => ({
      threshold: 250,
      isHidden: true,

      init () {
        this.threshold = options.threshold ? parseInt(options.threshold) : 250;
        if (this.threshold === 0) {
          this.isHidden = false;
        } else {
          this.addScrollListener()
        }
        this.addClickListener();
      },

      addClickListener () {
        this.$el.addEventListener('click', this.scrollToTop);
      },

      addScrollListener () {
        let lastScrollY = 0;
        const checkScroll = () => {
          if (window.scrollY !== lastScrollY) {
            lastScrollY = window.scrollY;
            this.toggleVisibility();
          }
          this.scrollTimeout = null;
        };

        window.addEventListener('scroll', () => {
          if (!this.scrollTimeout) {
            this.scrollTimeout = requestAnimationFrame(checkScroll);
          }
        });

        checkScroll();
      },

      toggleVisibility () {
        this.isHidden = window.scrollY < this.threshold;
      },

      scrollToTop (event) {
        window.scrollTo({top: 0, behavior: 'smooth'});
        event.preventDefault();
      }
    }));

    //
    // Data
    //

    // Provides category information for the specified section or article
    Alpine.data('category', (options = {}) => ({
      sectionId: null,
      categoryId: null,
      category: null,
      isLoading: true,

      async init () {
        this.categoryId = options.activeCategoryId || null;
        this.sectionId = options.activeSectionId || null;

        const pageId = Util.getPageId()
        if (pageId) {
          if (!this.categoryId && Util.isCategoryPage()) {
            this.categoryId = pageId;
          }
          if (!this.sectionId && Util.isSectionPage()) {
            this.sectionId = pageId;
          }
        }

        if (!this.categoryId && !this.sectionId) {
          console.error('No category or section ID provided');
          return;
        }

        try {
          const query = { categories: [], sections: [] }
          const collection = await Util.query(query);
          const { categories = [], allSections = [] } = collection;

          if (this.categoryId) {
            this.category = categories.find(category => category.id === this.categoryId);
          } else if (this.sectionId) {
            let activeSection = allSections.find(section => section.id === this.sectionId);
            if (activeSection) {
              this.category = categories.find(category => category.id === activeSection['category_id']);
            }
          }
        } catch (err) {
          console.error('Error loading category and section data', err);
        } finally {
          this.isLoading = false;
        }
      }
    }));

    // Supports the creation of dynamic navigation elements
    Alpine.data('navigation', (options = {}) => ({
      categories: [],
      sections: [],
      allSections: [],
      articles: [],

      loading: true,
      expandedItems: new Set(),
      loadingItems: new Set(),
      loadedItems: new Set(),

      rootId: null,
      templateCache: {},

      async init () {
        try {
          const response = await Util.query(options)
          const {
            categories = [], sections = [], allSections = [], articles = [],
            activeCategoryId = null, activeArticleId = null
          } = response;

          this.categories = categories
          this.sections = sections
          this.allSections = allSections
          this.articles = articles

          this.rootId = this.$root.id || Util.generateId();
          this.rootEl = this.$root.parentElement;

          // All categories are loaded by default
          categories.forEach(category => {
            this.loadedItems.add(category.id);
          });

          // If the articles for a specific section are loaded, mark the section as loaded
          if (Util.isObject(options.articles) && options.articles.section_id) {
            this.loadedItems.add(options.articles.section_id);
          }

          // Ensure that the active category, section and article are expanded
          if (activeCategoryId) {
            this.markItemAsExpanded(activeCategoryId);
          }
          if (activeArticleId) {
            this.markItemAsExpanded(activeArticleId);
          }

          const cachedSections = [];
          const uncachedSections = [];
          allSections.forEach(section => {
            if (section.isActive) {
              if (!this.loadedItems.has(section.id)) {
                if (Util.hasCachedResponse(section.id)) {
                  cachedSections.push(section.id);
                } else {
                  uncachedSections.push(section.id);
                }
              }
              this.markItemAsExpanded(section.id);
            }
          });

          // Load cached sections
          if (cachedSections.length) {
            await Promise.all(cachedSections.map(sectionId => this.loadSection(sectionId)));
          }

          this.loading = false;

          this.$nextTick(this.onRender.bind(this));

          // Load the uncached sections after initial load
          if (uncachedSections.length) {
            await Promise.all(uncachedSections.map(sectionId => this.loadSection(sectionId)));
          }

          this.addEventListeners();

        } catch (err) {
          this.error = err.message;
          console.error('Error loading help center data:', err);
        } finally {
          this.loading = false;
        }
      },

      addEventListeners() {
        this.$el.addEventListener('collapse:show', (e) => this.markItemAsExpanded(parseInt(e.target.id, 10)));
        this.$el.addEventListener('collapse:hide', (e) => this.markItemAsCollapsed(parseInt(e.target.id, 10)));
      },

      onRender () {
        // Ensure that collapsible elements associated with expanded items are visible
        const collapsibleElements = this.$el.querySelectorAll('.collapse');
        if (collapsibleElements.length) {
          collapsibleElements.forEach(el => {
            const itemId = el.id ? parseInt(el.id, 10) : null;
            if (itemId && this.isVisible(itemId)) {
              el.classList.add('is-visible');
            }
          });
        }
      },

      async renderTemplate (templateId, templateData) {
        if (!this.templateCache[templateId]) {
          this.templateCache[templateId] = Util.getTemplateStringForElement(this.rootEl, templateId);
        }
        return Util.compileTemplate(this.templateCache[templateId], templateData);
      },

      async loadSection (sectionId) {
        // Do nothing if the section is already loading
        if (this.loadingItems.has(sectionId)) {
          return;
        }

        try {
          const query = { articles: { section_id: sectionId } };

          // Only mark section as loading if there's no cached response
          const hasCachedResponse = await Util.hasCachedResponse(query);
          if (!hasCachedResponse) {
            this.loadingItems.add(sectionId);
          }

          const response = await Util.query(query);

          const updateSection = (sections) => {
            for (let section of sections) {
              if (section.id === sectionId) {
                section.articles = response.articles || [];
                return true;
              }
              if (section.sections?.length) {
                if (updateSection(section.sections)) {
                  return true;
                }
              }
            }
            return false;
          };

          this.categories.forEach(category => {
            if (category.sections?.length) {
              updateSection(category.sections);
            }
          });

          // Record that the section has been loaded
          this.loadedItems.add(sectionId);

          // Expand the section
          this.expandedItems.add(sectionId);

          Util.toggleCollapse(`[id="${sectionId}"]`, this.rootEl);

        } catch (err) {
          console.error(`Error loading articles for section ${sectionId}`, err);
        } finally {
          this.loadingItems.delete(sectionId);
        }
      },

      async toggleItem ($event, itemId) {
        $event.preventDefault();

        // Do nothing if the item is loading
        if (this.loadingItems.has(itemId)) {
          return;
        }

        // Collapse the item if it's already expanded
        if (this.isVisible(itemId)) {
          this.markItemAsCollapsed(itemId)
          this.toggleCollapse(itemId);
          return;
        }

        // Maybe load the section
        const sectionNotLoaded = itemId !== this.rootId && !this.loadedItems.has(itemId)
        if (sectionNotLoaded) {
          await this.loadSection(itemId);
        }

        // Expand the item
        this.markItemAsExpanded(itemId);

        // Maybe toggle the collapsible element
        this.toggleCollapse(itemId, sectionNotLoaded);
      },

      markItemAsExpanded (itemId) {
        this.expandedItems.add(itemId);
      },

      markItemAsCollapsed (itemId) {
        this.expandedItems.delete(itemId);
      },

      toggleCollapse (itemId, force = false) {
        const el = this.rootEl.querySelector(`[id="${itemId}"]`);
        if (el && el.classList.contains('collapse')) {
          if (force) {
            el.classList.add('is-visible');
          } else {
            Util.toggleCollapse(`[id="${itemId}"]`, this.rootEl);
          }
        }
      },

      hasItems (arr) {
        return Array.isArray(arr) && arr.length > 0;
      },

      isLoading (itemId) {
        if (itemId) {
          return this.loadingItems.has(itemId);
        }
        return this.loading;
      },

      isLoaded (itemId) {
        return this.loadedItems.has(itemId);
      },

      isVisible (itemId) {
        return this.expandedItems.has(itemId);
      }

    }));

    // Supports the creation of dynamic previous and next article navigation elements
    Alpine.data('articleNavigation', (options = {}) => ({
      previousArticle: null,
      previousTitle: '',
      nextArticle: null,
      nextTitle: '',
      activeArticleId: null,
      activeSectionId: null,
      loading: true,

      async init () {
        if (!options.articleId) {
          console.error('An article ID must be specified')
          return
        }
        if (!options.sectionId) {
          console.error('A section ID must be specified')
          return
        }

        try {
          const articleId = options.articleId
          const sectionId = options.sectionId

          const response = await Util.query({
            categories: [],
            sections: [],
            articles: { section_id: sectionId }
          })
          const { articles = [] } = response;

          const activeArticleIndex = articles.findIndex(article => article.id === articleId)
          const previousArticle = articles[activeArticleIndex - 1] || null
          const nextArticle = articles[activeArticleIndex + 1] || null

          this.previousArticle = previousArticle
          this.nextArticle = nextArticle
        } catch (err) {
          this.error = err.message;
          console.error('Error loading help center data:', err);
        } finally {
          this.loading = false;
        }

        document.addEventListener('data:loaded', this.getTitles.bind(this), { once: true });
        this.getTitles();
      },

      getTitles () {
        const elementData = window.Theme?.elements ?? {};
        const elementId = this.$el.id;
        if (elementId && elementId in elementData) {
          this.previousTitle = elementData[elementId]?.previous_article_title ?? '';
          this.nextTitle = elementData[elementId]?.next_article_title ?? '';
        }
      }
    }));

    Alpine.data('articlesByLabel', (options = {}) => ({
      labels: null,
      category: null,
      articles: [],
      loading: false,
      error: null,

      async init() {
        this.labels = options.labels || null;
        this.category = options.category || null;

        if (!this.labels) {
          this.error = 'No labels provided';
          console.error(this.error);
          return;
        }

        await this.fetchArticles();
      },

      async fetchArticles() {
        this.loading = true;
        this.error = null;

        try {
          const params = new URLSearchParams({
            label_names: this.labels
          });

          if (this.category) {
            params.append('category', this.category);
          }

          const response = await Util.request(`/api/v2/help_center/articles/search?${params}`);
          this.articles = response?.results ?? [];
        } catch (err) {
          this.error = 'Failed to load articles';
          console.error('Error loading articles:', err);
          this.articles = [];
        } finally {
          this.loading = false;
        }
      }
    }));

    // Allows request information to be presented in the UI
    Alpine.data('requests', () => ({
      count: null,

      async init () {
        const $el = this.$el;
        $el.style.display = this.count ? '' : 'none';
        this.$watch('count', count => {
          $el.style.display = count ? '' : 'none';
        });

        // Load the request count
        try {
          const response = await Util.request('/api/v2/requests.json?status=new,open');
          this.count = response?.count ?? null;
        } catch (err) {
          console.error('Error loading request count', err);
        }
      }
    }));
  }

  function loadElementData () {
    const scriptElement = document.querySelector('#page-builder-data');
    const scriptContent = scriptElement ? scriptElement.textContent.trim() : '';
    if (scriptContent) {
      // Parse the JSON data (custom element, animation and transition data)
      let customData = {};
      try {
        // Remove unnecessary trailing commas
        const sanitizedContent = scriptContent.replace(/,\s*([\]}])/g, '$1')
        customData = JSON.parse(sanitizedContent);
      } catch (err) {
        console.warn('Could not parse element JSON data', err);
      }

      // Maybe extend the theme object
      if (Object.keys(customData).length !== 0) {
        window.Theme = window.Theme || {}

        // Deep merge elements, animations, transitions, and notifications
        window.Theme.elements = mergeData(window.Theme.elements || {}, customData.elements || {})
        window.Theme.animations = mergeData(window.Theme.animations || {}, customData.animations || {})
        window.Theme.transitions = mergeData(window.Theme.transitions || {}, customData.transitions || {})
        window.Theme.notifications = mergeData(window.Theme.notifications || {}, customData.notifications || {})
      }
    }

    const event = new Event('data:loaded');
    document.dispatchEvent(event);
  }

  function renderHelper (el, helperType) {
    const elementId = el.id || null;
    const dataset = el.dataset;
    const templateId = dataset.template || helperType;
    const templateString = Util.getTemplateStringForElement(el, templateId);
    if (!templateString) {
      Util.log(`No template could be found for ${helperType}`);
      return;
    }

    const getHelperHTML = function() {
      let templateData = Util.convertElementToDataObject(el, PROPERTY_MAPPINGS[helperType]);
      const elementData = window.Theme.elements;
      if (elementData[elementId] || elementData[helperType]) {
        templateData = Util.extend(templateData, elementData[elementId] || elementData[helperType]);
      }
      if (dataset.templateData) {
        templateData = Util.extend(templateData, Util.stringToJSON(dataset.templateData));
      }
      return Util.sanitizeHTML(Util.compileTemplate(templateString, templateData));
    }

    const html = getHelperHTML();

    if (html) {
      el.innerHTML = html;
      Util.triggerEvent(el, 'template:render', { relatedTarget: el });
    } else {
      Util.log(`No HTML returned from template ${templateId} for ${helperType}`);

      // Wait for changes to the element before rendering
      const observer = new MutationObserver((mutationList, observer) => {
        const html = getHelperHTML();
        if (html) {
          el.innerHTML = html;
          Util.triggerEvent(el, 'template:render', { relatedTarget: el });
          observer.disconnect();
        }
      });

      const config = { attributes: false, childList: true, subtree: true };
      observer.observe(el, config);
    }

    el.classList.remove(`js-${helperType}`);
  }

  function loadElements () {
    const container = document;

    // Ensure the latest element data is loaded
    loadElementData();

    const elementData = window.Theme?.elements ?? {};

    // Render content-related helpers
    const contentHelperTypes = [
      'breadcrumbs', 'sharing', 'pagination',
      'recent-activity', 'related-articles', 'recently-viewed-articles'
    ];
    contentHelperTypes.forEach(helperType => {
      const elements = container.querySelectorAll(`.js-${helperType}`);
      elements.forEach(el => {
        renderHelper(el, helperType);
      });
    });

    // Render inline micro-templates
    const templates = container.querySelectorAll('[data-element="template"]');
    templates.forEach(el => {
      const templateName = el.getAttribute('data-template') || null;
      const templateData = el.getAttribute('data-template-data');
      Util.renderTemplate(el, templateName, Util.stringToJSON(templateData), el.dataset);
      el.removeAttribute('data-element');
    });

    // Render subscribe and actions buttons
    const subscribeAndActionElements = container.querySelectorAll('.js-subscribe, .js-actions');
    subscribeAndActionElements.forEach(el => {
      const transitionClassName = 'transition-none'

      // Update class names on the Section, Article, Topic, Post, Requests and Subscriptions pages
      const classNames = (el.dataset.class || 'button button-primary') + ` ${transitionClassName}`;
      let buttons = el.querySelectorAll('button');

      function applyClassNames () {
        buttons.forEach(button => {
          button.className = classNames;
          button.offsetHeight;
          button.classList.remove(transitionClassName);
        });
      }

      if (buttons.length) {
        applyClassNames();
      } else {
        const observer = new MutationObserver((mutationList, observer) => {
          buttons = el.querySelectorAll('button');
          if (buttons.length) {
            applyClassNames();
            observer.disconnect();
          }
        });

        const config = { attributes: false, childList: true, subtree: true };
        observer.observe(el, config);
      }
    });

    // Render elements
    const elementTypes = [
      'popular-keywords',
      'custom-blocks', 'content-blocks', 'category-list', 'contact-blocks',
      'promoted-articles', 'promoted-videos',
      'call-to-action'
    ];
    elementTypes.forEach(elementType => {
      const elements = container.querySelectorAll(`.js-${elementType}`);
      elements.forEach(async (el) => {
        const elementId = el.id || null;
        const dataset = el.dataset;
        const templateId = dataset.template || elementType;

        let templateData = elementData[elementId] || elementData[elementType] || {};
        templateData = Util.extend(templateData, { id: elementId });
        if (dataset.templateData) {
          templateData = Util.extend(templateData, Util.stringToJSON(dataset.templateData));
        }

        // Special case for promoted videos
        if (elementType === 'promoted-videos') {
          templateData.videos = await Util.getVideoData(templateData.video_ids || '');
        }

        Util.renderTemplate(el, templateId, templateData);
        el.classList.remove(`js-${elementType}`, 'is-loading');
      });
    });

    // Update background color for shape divider elements
    const shapeDividers = container.querySelectorAll('.shape-divider');
    shapeDividers.forEach(shapeDivider => {
      // Check for specified background color
      if (shapeDivider.style.getPropertyValue(BG_COLOR_VARIABLE)) {
        return;
      }

      // Compute a background color value
      const targets = shapeDivider.getAttribute('data-target');
      const selectors = targets ? targets.split(',').map(selector => selector.trim()) : [];
      let el = null;

      // Try and find an element based on the targets, if defined
      if (selectors.length) {
        const matchingElements = document.querySelectorAll(selectors.join(','));
        if (matchingElements.length) {
          el = matchingElements[0];
        }
      }

      // Otherwise use the next element sibling
      if (!el) {
        el = shapeDivider.nextElementSibling;
      }

      // Find an element with a specified background color
      const backgroundElement = findBackgroundElement(el);

      // Apply the background color
      const setBackgroundColor = function() {
        let computedStyle;
        let backgroundColor;
        if (backgroundElement) {
          // Use the background color of the element, if found
          computedStyle = window.getComputedStyle(backgroundElement);
          backgroundColor = computedStyle.backgroundColor || computedStyle.getPropertyValue(BG_COLOR_VARIABLE).trim();
        } else {
          // Otherwise use the --bg-color-body variable value
          backgroundColor = 'var(--bg-color-body)';
        }

        shapeDivider.style.setProperty(BG_COLOR_VARIABLE, backgroundColor);
      }

      setBackgroundColor();
      document.addEventListener('dark-mode', setBackgroundColor);
    });
  }

  //  Update the header immediately
  updateFixedHeader();

  document.addEventListener('alpine:init', loadAlpineComponents);
  document.addEventListener('elements:init', loadElements);

  // Load lightboxes on page load
  document.addEventListener('DOMContentLoaded', async () => {
    const { Fancybox } = await import('fancybox');
    await Util.importStyleSheet('fancybox');
    Fancybox.bind('[data-fancybox]');
  })

})(Util || {});