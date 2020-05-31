import { $$, docEl } from './html.js';

const userBright = localStorage.getItem('user-bright-env');
const osBright = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark-mode' : 'light-mode';

docEl.setAttribute('data-bright-env', userBright || osBright);
localStorage.setItem('os-bright-env', osBright);

if (userBright && userBright !== osBright) {
  const switchToMode = userBright === 'light-mode' ? 'dark-mode' : 'light-mode';
  docEl.setAttribute('data-bright-env', userBright);
  $$(`#${userBright}`).setAttribute('hidden', 'hidden');
  $$(`#${switchToMode}`).removeAttribute('hidden');
}