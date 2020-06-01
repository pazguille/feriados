import { $$, html, render } from './html.js';
import {
  today, moveDate, isSameYear, getMonthLongName, leftFillNum, getDatetimeFormat,
  getWeekdayShortName, isNextDay, isCurrentMonth, getNewYear,
} from './dates.js';

let currentDate = today;

const holidaysData = {};
const $timeline = $$('.timeline');

const noDataYearTemplate = (year) => `<li class="nodata">No tengo información para el ${year} :(</li>`;
const noHolidaysTemplate = () => '<li class="nodata">No hay feriados este mes :(</li>';

const monthTemplate = ({ nextHoliday, datetime, day, weekday, feriado }) => (
  `<li class="day ${nextHoliday}">
    <time datetime="${datetime}"><strong>${day}</strong> ${weekday}</time>
    ${feriado.map(item => `<p>${item.motivo}<br/>${item.tipo.toUpperCase()}</p>`).join('<br>')}
  </li>`
);

const yearTemplate = ({ currentMonth, datetime, monthName, month }) => (
  `<li class="month ${currentMonth}">
    <time datetime="${datetime}">${monthName}</time>
    ${Object.keys(month).map(item => '<span></span>').join('')}
  </li>`
);

export function moveMonthTo(moveTo) {
  let newDate = moveTo;

  if (typeof moveTo === 'string') {
    newDate = moveDate(currentDate, moveTo);
  }

  if (newDate.getFullYear() in holidaysData) {
    renderMonth(newDate);
    if (!isSameYear(newDate, currentDate)) {
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
  $$('.calendar-title').firstChild.data = `${getMonthLongName(newDate)} ${newDate.getFullYear()}`;
  $$('.loading').classList[toggletMethod]('hide');
  while ($timeline.lastChild) { $timeline.removeChild($timeline.lastChild); }
}

function renderMonth(newDate) {
  renderEmptyCalendar('sync', newDate);

  if (holidaysData[newDate.getFullYear()] === null) {
    return $timeline.insertAdjacentHTML('beforeend', noDataYearTemplate(newDate.getFullYear()));
  }

  const monthHolidays = holidaysData[[newDate.getFullYear()]][newDate.getMonth()];

  if (Object.keys(monthHolidays).length === 0) {
    return $timeline.insertAdjacentHTML('beforeend', noHolidaysTemplate());
  }

  let nextMarked = false;

  const template = Object.keys(monthHolidays).map(function(day) {
    let feriado = monthHolidays[day];
    feriado = !Array.isArray(feriado) ? feriado = [feriado] : feriado;
    const holidayDate = new Date(newDate.getFullYear(), newDate.getMonth(), day);
    return monthTemplate({
      nextHoliday: !nextMarked && isNextDay(holidayDate) ? (nextMarked = true && 'next') : '',
      datetime: getDatetimeFormat(holidayDate),
      day: leftFillNum(day),
      weekday: getWeekdayShortName(holidayDate).toUpperCase(),
      feriado,
    });
  }).join('');

  $timeline.insertAdjacentHTML('beforeend', template);
}

function renderYear(newDate) {
  const $year = $$('.year');
  while ($year.lastChild) { $year.removeChild($year.lastChild); }
  const yearHolidays = holidaysData[[newDate.getFullYear()]];
  const template = yearHolidays.map(function(month, index) {
    const yearDate = getNewYear(newDate, index);
    return yearTemplate({
      monthName: getMonthLongName(yearDate),
      currentMonth: isCurrentMonth(yearDate) ? 'current' : '',
      datetime: getDatetimeFormat(yearDate),
      month,
    });
    // return html`<li onClick="${() => console.log(monthName)}" class="month ${currentMonth}">
    //           <time datetime="${datetime}">${monthName}</time>
    //           <div ref="${monthName}">
    //             ${Object.keys(month).map(item => '<span></span>').join('')}
    //           </div>
    //         </li>`;
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
  requestIdleCallback(() => {
    renderYear(date);
  });
}
