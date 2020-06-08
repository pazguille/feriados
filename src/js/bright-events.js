import { $$, docEl } from './html.js';

function toogleDarkMode() {
  const currentMode = docEl.getAttribute('data-bright-env');
  const switchToMode = currentMode === 'light-mode' ? 'dark-mode' : 'light-mode';
  docEl.setAttribute('data-bright-env', switchToMode);
  $$(`#${switchToMode}`).setAttribute('hidden', 'hidden');
  $$(`#${currentMode}`).removeAttribute('hidden');
  localStorage.setItem('user-bright-env', switchToMode);
}

$$('[data-js="bright-toggle"]').addEventListener('click', toogleDarkMode);
