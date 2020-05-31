import { $$, docEl } from './html.js';
import { moveMonthTo } from './calendar.js';

function toggleLayout() {
  const currentView = docEl.getAttribute('data-view');
  const switchToView = currentView === 'year' ? 'timeline' : 'year';
  docEl.setAttribute('data-view', switchToView);

  currentView === 'year' ?
    $$('[data-js="year-selection"]').setAttribute('data-hidden', 'true') :
    $$('[data-js="year-selection"]').removeAttribute('data-hidden');

  $$(`#${switchToView}-view`).setAttribute('hidden', 'hidden');
  $$(`#${currentView}-view`).removeAttribute('hidden');
}

$$('[data-js="layout-title"]').addEventListener('click', () => toggleLayout());
$$('[data-js="layout-toggle"]').addEventListener('click', () => toggleLayout());

$$('[data-js="year-selection"]').addEventListener('click', (eve) => {
  const selected = eve.target.firstElementChild.getAttribute('datetime');
  const date = new Date(`${selected}T00:00:00`);
  moveMonthTo(date);
  toggleLayout();
});