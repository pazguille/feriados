import { $$ } from './html.js';
import { moveMonthTo } from './calendar.js';

const touchPassiveListener = { passive: true, capture: false };
let startOffsetX = 0;
let startOffsetY = 0;
let currentOffsetX = 0;
let scrolling = false;

function resetTouchFn(eve) {
  if (typeof eve.touches === 'undefined') {
    return;
  }
  currentOffsetX = 0;
  startOffsetX = eve.touches[0].pageX;
  startOffsetY = eve.touches[0].pageY;
}

function onTouchEndFn() {
  if (!scrolling && currentOffsetX !== 0) {
    requestIdleCallback(() => {
      if (this.scrollLeft <= 0) {
        moveMonthTo('prevYear');
      } else if (this.scrollLeft >= (this.scrollWidth - this.clientWidth)) {
        moveMonthTo('nextYear');
      }
    });
    return;
  }
  scrolling = false;
  return;
};

function onTouchMoveFn(eve) {
  if (scrolling || typeof eve.touches === 'undefined') {
    return;
  }

  var dif_x = eve.touches[0].pageX - startOffsetX;

  var dif_y = eve.touches[0].pageY - startOffsetY;
  var touchAngle = (Math.atan2(Math.abs(dif_y), Math.abs(dif_x)) * 180) / Math.PI;
  var isScrolling = touchAngle > 45;

  if (isScrolling) {
    scrolling = true;
    return;
  }

  if (eve.cancelable) {
    eve.preventDefault();
  }
  eve.stopPropagation();

  if (Math.abs(dif_x) > 20) {
    currentOffsetX = dif_x
  }
};

const $timeline = $$('.timeline-mask');
$timeline.addEventListener('touchstart', resetTouchFn, touchPassiveListener);
$timeline.addEventListener('touchmove', onTouchMoveFn, touchPassiveListener);
$timeline.addEventListener('touchend', onTouchEndFn, touchPassiveListener);
