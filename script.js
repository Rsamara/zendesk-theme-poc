(function(Util) {
  'use strict';

  function saveFocus () {
    const activeElementId = document.activeElement.getAttribute('id');
    sessionStorage.setItem('returnFocusTo', `#${activeElementId}`);
  }

  function returnFocus () {
    const returnFocusTo = sessionStorage.getItem(Util.ids.FOCUS);
    if (returnFocusTo) {
      sessionStorage.removeItem(Util.ids.FOCUS);
      const returnFocusToEl = document.querySelector(returnFocusTo);
      returnFocusToEl && returnFocusToEl.focus && returnFocusToEl.focus();
    }
  }

  function maybeScroll () {
    let smoothScroll = Util.getURLParameter('smooth-scroll', window.location);
    if (smoothScroll === 'true' && window.location.hash) {
      let offset = Util.getURLParameter('offset', window.location);
      let target = document.getElementById(window.location.hash.substring(1).split("?")[0]);
      Util.scrollIntoView(target, offset);
    }
  }

  function appendClearSearchButton (input, form) {
    const button = document.createElement('button');
    button.setAttribute('type', 'button');
    button.setAttribute('aria-controls', input.id);
    button.classList.add('button-clear', 'absolute', 'right-0', 'w-5', 'h-5', 'mx-2');
    button.innerHTML = (
    `<svg class="pointer-events-none" xmlns='http://www.w3.org/2000/svg' width="12" height="12" focusable="false" viewBox="0 0 12 12" aria-label="${window.Theme.l18n.clearSearch}">
      <path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M3 9l6-6m0 6L3 3"/>
    </svg>`);
    button.addEventListener('click', clearSearchInput);
    button.addEventListener('keyup', clearSearchInputOnKeypress);

    form.append(button);
    if (input.value.length > 0) {
      form.classList.add(Util.classNames.FILLED);
    }
  }

  function clearSearchInput (event) {
    const button = event.target;
    const searchForm = button.closest(Util.selectors.SEARCH_FORM);
    const searchField = searchForm.querySelector(Util.selectors.SEARCH_FIELD);

    searchForm.classList.remove(Util.classNames.FILLED);
    searchField.value = '';
    searchField.focus();
  }

  function clearSearchInputOnKeypress (event) {
    const searchInputDeleteKeys = ['Delete', 'Escape'];
    if (searchInputDeleteKeys.includes(event.key)) {
      clearSearchInput(event);
    }
  }

  const toggleClearSearchButtonAvailability = Util.debounce((event) => {
    const form = event.target.closest(Util.selectors.SEARCH_FORM);
    form.classList.toggle(Util.classNames.FILLED, event.target.value.length > 0);
  }, 200);

  function onPageLoaded () {

    // Maybe preserve focus after page reload
    returnFocus();

    // Maybe scroll the page
    maybeScroll();

    // Replace images with inline SVG
    const inlineSVGs = document.querySelectorAll('[data-inline-svg]');
    inlineSVGs.forEach(Util.replaceWithSVG);

    // Handle status and organization field changes on the Requests page
    const selects = document.querySelectorAll("#request-status-select, #request-organization-select");
    selects.forEach((element) => {
      element.addEventListener('change', (event) => {
        event.stopPropagation();
        saveFocus();
        element.form.submit();
      });
    });

    // Submit requests filter form on search in the request list page
    const quickSearch = document.querySelector("#quick-search");
    if (quickSearch) {
      quickSearch.addEventListener('keyup', (event) => {
        if (event.keyCode === Util.keys.ENTER) {
          event.stopPropagation();
          saveFocus();
          quickSearch.form.submit();
        }
      });
    }

    // Add clear button to search forms
    const searchForms = document.querySelectorAll('form[role="search"]');
    const searchInputs = Array.prototype.map.call(searchForms,(form) => form.querySelector('input[type="search"]'));
    const searchQuery = Util.getURLParameter('query');

    searchInputs.forEach((input) => {
      appendClearSearchButton(input, input.closest(Util.selectors.SEARCH_FORM));
      input.addEventListener('keyup', clearSearchInputOnKeypress);
      input.addEventListener('keyup', toggleClearSearchButtonAvailability);

      if (searchQuery && !input.value) {
        input.value = searchQuery;
      }
    });

    // Open sharing links in a new window
    const sharingLinks = document.querySelectorAll('.share a')
    sharingLinks.forEach((anchor) => {
      anchor.addEventListener('click', (event) => {
        event.preventDefault();
        window.open(anchor.href, '', 'height = 500, width = 500');
      })
    });
    
  /* 
    //get user tags
    if (HelpCenter.user.tags=="brite-pay-access"){
			$("div.ticket-access").show();
		};
  }
  */
  
   fetch('/api/v2/users/me.json')
    .then(function(res) { return res.json();})
    .then(function(data) {
      if (data.user && data.user.user_fields && data.user.user_fields.brite_pay_pilot === true) {
        var link = document.getElementById('brite-pay-nav-link');
        if (link) link.style.display = '';
      } 
  	});

 

  // Add event listeners
  window.addEventListener('hashchange', maybeScroll, false);
  document.addEventListener('DOMContentLoaded', onPageLoaded, false);

  
  
  // console.info(`%c
  //                      _       _
  //                     | |     | |
  //  _______ _ __  ____ | | __ _| |_ ___  ___
  // |_  / _ \\ '_ \\| '_ \\| |/ _\` | __/ _ \\/ __|
  //  / /  __/ | | | |_) | | (_| | ||  __/\\__ \\
  // /___\\___|_| |_| .__/|_|\\__,_|\\__\\___||___/
  //               | |
  //               |_|
  //
  // Premium Zendesk help center themes and apps available at https://www.zenplates.co
  // Theme version ${Theme.version}
  // `, "color: #2b2c2d");

  
}(Util || {});

var tagsToRemove = ['32069875224212'];  //special form ID 

function removeTagsWeDontWant() {
  $('.nesty-panel').on('DOMNodeInserted', function(e){
  for(var i in tagsToRemove) {
  	$('li#' + tagsToRemove[i]).remove();
  	}
	});
};
removeTagsWeDontWant();
})
