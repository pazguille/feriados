import { $$ } from './html.js';
import { stringToDate } from './dates.js';
import { moveMonthTo } from './calendar.js';

let $yearSelection = null;
let activeLayoutView = 'timeline';

function toggleLayout() {
  const currentView = activeLayoutView;
  activeLayoutView = currentView === 'year' ? 'timeline' : 'year';

  if (!$yearSelection) {
    $yearSelection = $$('[data-js="year-selection"]');
  }

  currentView === 'year' ?
    $yearSelection.setAttribute('data-hidden', 'true') :
    $yearSelection.removeAttribute('data-hidden');

  requestIdleCallback(() => {
    $$(`#${activeLayoutView}-view`).setAttribute('hidden', 'hidden');
    $$(`#${currentView}-view`).removeAttribute('hidden');
  })
}

$$('[data-js="layout-title"]').addEventListener('click', toggleLayout);
$$('[data-js="layout-toggle"]').addEventListener('click', toggleLayout);
$$('[data-js="year-selection"]').addEventListener('click', (eve) => {
  const target = eve.target.firstElementChild;
  if (target.nodeName === 'TIME') {
    const selected = stringToDate(target.getAttribute('datetime'));
    moveMonthTo(selected);
    requestIdleCallback(() => {
      toggleLayout();
    });
  }
});
