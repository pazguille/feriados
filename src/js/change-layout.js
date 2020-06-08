import { $$ } from './html.js';
import { stringToDate } from './dates.js';
import { moveMonthTo } from './calendar.js';

let $yearSelection = null;
let $arrow = null;
let activeLayoutView = 'timeline';

function toggleLayout() {
  const currentView = activeLayoutView;
  activeLayoutView = currentView === 'year' ? 'timeline' : 'year';

  if (!$yearSelection) {
    $yearSelection = $$('[data-js="year-selection"]');
  }

  if (!$arrow) {
    $arrow = $$('[data-js="layout-icon"]');
  }

  if (currentView === 'year') {
    $yearSelection.setAttribute('data-hidden', 'true')
    $arrow.classList.remove('arrow-down');
  } else {
    $yearSelection.removeAttribute('data-hidden')
    $arrow.classList.add('arrow-down');
  }

  requestIdleCallback(() => {
    $$(`#${activeLayoutView}-view`).setAttribute('hidden', 'hidden');
    $$(`#${currentView}-view`).removeAttribute('hidden');
  })
}

function yearSelection(target) {
  if (target.nodeName === 'TIME') {
    const selected = stringToDate(target.getAttribute('datetime'));
    moveMonthTo(selected);
    requestIdleCallback(() => {
      toggleLayout();
    });
  }
}

function holidaySelection(target) {
  if (target.nodeName === 'BUTTON') {
    eve.preventDefault();
    window.location.href = target.getAttribute('data-ical');
  }
}

$$('[data-js="layout-title"]').addEventListener('click', toggleLayout);
$$('[data-js="layout-icon"]').addEventListener('click', toggleLayout);
$$('[data-js="layout-toggle"]').addEventListener('click', toggleLayout);
$$('[data-js="year-selection"]').addEventListener('click', (eve) => {
  yearSelection(eve.target.firstElementChild);
});
$$('[data-js="holiday-selection"]').addEventListener('click', (eve) => {
  holidaySelection(eve.target);
});
