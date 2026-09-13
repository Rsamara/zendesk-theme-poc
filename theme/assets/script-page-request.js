(function() {
  'use strict';

  // Submit organization form when a new organization is selected
  const requestOrganisationSelect = document.querySelector('#request-organization select');
  if (requestOrganisationSelect) {
    requestOrganisationSelect.addEventListener('change', () => {
      this.closest('form').submit();
    })
  }

  // Do nothing if the form does not exist on the page
  const form = document.querySelector('form[data-form-type="comment"]');
  if (!form) {
    return;
  }

  // Maybe allow end-users to mark the request as solved
  const solvedButton = form.querySelector('.js-mark-as-solved');
  const solvedCheckbox = form.querySelector('input[type="checkbox"]');
  if (solvedButton && solvedCheckbox) {
    solvedButton.addEventListener('click', () => {
      solvedCheckbox.checked = true;
      form.submit();
    });
  }

})();