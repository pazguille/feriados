import { $$, html, render } from './html.js';

const holidaysData = {};
const today = new Date();
let currentDate = new Date();

const $timeline = $$('.timeline');

export function moveMonthTo(moveTo) {
  let newDate = moveTo;

  if (typeof moveTo === 'string') {
    const moveToNum = moveTo === 'next' ? 1 : -1;
    newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + moveToNum, 1);
  }

  if (newDate.getFullYear() in holidaysData) {
    renderMonth(newDate);
    if (newDate.getFullYear() !== currentDate.getFullYear()) {
      renderYear(newDate);
    }
  } else {
    fetchNewYear(newDate);
  }

  currentDate = newDate;
}

function fetchNewYear(date) {
  fetchData(date.getFullYear());
  renderEmptyCalendar('async', date);
}

export function fetchData(year = today.getFullYear()) {
  return fetch(`https://nolaborables.com.ar/api/v2/feriados/${year}?formato=mensual&incluir=opcional`)
    .then(res => res.json())
    .then(data => bootCalendar(data))
    .catch(data => bootCalendar(data));
}

function bootCalendar(data) {
  if (data instanceof Error || data.error) {
    holidaysData[currentDate.getFullYear()] = null;
    renderCanlendar(currentDate);
    return;
  }
  holidaysData[currentDate.getFullYear()] = data;
  setTimeout(() => renderCalendar(currentDate), 500);
}

function renderEmptyCalendar(mode, newDate) {
  const toggletMethod = mode === 'async' ? 'remove' : 'add';
  const currentFormated = new Intl.DateTimeFormat('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    month: 'long',
  }).format(newDate);
  $$('.loading').classList[toggletMethod]('hide');
  $$('.calendar-title').firstChild.data = `${currentFormated} ${newDate.getFullYear()}`;
  while ($timeline.lastChild) { $timeline.removeChild($timeline.lastChild); }
}

function leftFillNum(day) {
  const n = parseInt(day);
  if (n < 10) {
    return day.padStart(2, '0');
  }
  return day;
}

function renderMonth(newDate) {
  renderEmptyCalendar('sync', newDate);

  if (holidaysData[newDate.getFullYear()] === null) {
    return $timeline.insertAdjacentHTML('beforeend',
    `<li class="nodata">No tengo información para el ${newDate.getFullYear()} :(</li>`);
  }

  const monthHolidays = holidaysData[[newDate.getFullYear()]][newDate.getMonth()];

  if (Object.keys(monthHolidays).length === 0) {
    return $timeline.insertAdjacentHTML('beforeend',
    '<li class="nodata">No hay feriados este mes :(</li>');
  }

  let nextMarked = false;

  const template = Object.keys(monthHolidays).map(function(day) {
    let feriado = monthHolidays[day];
    feriado = !Array.isArray(feriado) ? feriado = [feriado] : feriado;

    const holidayDate = new Date(newDate.getFullYear(), newDate.getMonth(), day);
    const datetime = holidayDate.toISOString().replace(/T.+/, '');
    const weekday = new Intl.DateTimeFormat('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires', weekday: 'short'
    }).format(holidayDate);

    const nextHolidayClass = !nextMarked && (parseInt(day, 10) >= today.getDate() && newDate.getMonth() === today.getMonth() && newDate.getFullYear() === today.getFullYear()) ? (nextMarked = true && 'next') : '';

    return `<li class="day ${nextHolidayClass}">
              <time datetime="${datetime}"><strong>${leftFillNum(day)}</strong> ${weekday.toUpperCase()}</time>
              ${feriado.map(item => `<p>${item.motivo}<br/>${item.tipo.toUpperCase()}</p>`).join('<br>')}
            </li>`;
  }).join('');

  $timeline.insertAdjacentHTML('beforeend', template);
}

function renderYear(newDate) {
  const $year = $$('.year');
  while ($year.lastChild) { $year.removeChild($year.lastChild); }
  const yearHolidays = holidaysData[[newDate.getFullYear()]];
  const template = yearHolidays.map(function(month, index) {
    const yearDate = new Date(newDate.getFullYear(), index, 1);
    const datetime = yearDate.toISOString().replace(/T.+/, '');
    const monthName = new Intl.DateTimeFormat('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires', month: 'long'
    }).format(yearDate);

    const todayHolidayClass = yearDate.getMonth() === today.getMonth() && yearDate.getFullYear() === today.getFullYear() ? 'current' : '';

    // return html`<li onClick="${() => console.log(monthName)}" class="month ${todayHolidayClass}">
    //           <time datetime="${datetime}">${monthName}</time>
    //           <div ref="${monthName}">
    //             ${Object.keys(month).map(item => '<span></span>').join('')}
    //           </div>
    //         </li>`;
    return `<li ref=${monthName} class="month ${todayHolidayClass}">
              <time datetime="${datetime}">${monthName}</time>
              ${Object.keys(month).map(item => '<span></span>').join('')}
            </li>`;
  // });
  }).join('');
  $year.insertAdjacentHTML('beforeend', template);

  // var list = html`<ol class="year" data-hidden data-js="year-selection" onClick="${(eve) => console.log(eve)}">
  //   ${template}
  // </ol>`;
  // console.log(list.collect());
  // render(document.body, list);
}

function renderCalendar(date) {
  renderMonth(date);
  renderYear(date);
}
