import { $$ } from './html.js';
import {
  today, moveDateYear, getMonthLongName, leftFillNum, getDatetimeFormat,
  getWeekdayShortName, isNextDay, isCurrentMonth, getNewYear,
} from './dates.js';

let loading = true;
let currentDate = new Date();
const holidaysData = {};
let $title;

const noDataYearTemplate = (year) => `<li class="nodata">No tengo información para el ${year} :(</li>`;
const noHolidaysTemplate = () => '<li class="nodata">No hay feriados este mes :(</li>';
const monthTemplate = ({ nextHoliday, datetime, day, weekday, feriado }) => (
  `<li class="day ${nextHoliday}">
    <time datetime="${datetime}">${weekday} <strong>${day}</strong></time>
    ${
      feriado.map(item => `
        <a href="${item.info}" target="_blank" rel="noopener noreferrer" data-js="more-info">
          <p>${item.motivo}<br/><span>${item.tipo}</span></p>
          <button type="button" aria-label="Agregar evento a mi calendario" class="add-calendar-icon" data-js="add-to-calendar" data-ical="${createEvent(datetime.replace(/-/g, ''), item.motivo)}">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 612 612"><path d="M499.641 320.573c-12.207-3.251-25.021-5.011-38.25-5.011-1.602 0-3.189.071-4.781.119-78.843 2.506-142.118 66.556-143.375 145.709-.015.799-.062 1.587-.062 2.391 0 15.85 2.515 31.102 7.119 45.422C339.474 568.835 395.381 612 461.391 612c81.859 0 148.219-66.359 148.219-148.219-.001-68.63-46.656-126.34-109.969-143.208zm-38.25 241.224c-54.133 0-98.016-43.883-98.016-98.016s43.883-98.016 98.016-98.016 98.016 43.883 98.016 98.016-43.884 98.016-98.016 98.016z"/><path d="M475.734 396.844h-33.468v52.594h-52.594v33.468h52.594V535.5h33.468v-52.594h52.594v-33.468h-52.594zM126.703 112.359c9.228 0 16.734-7.507 16.734-16.734V16.734C143.438 7.507 135.931 0 126.703 0h-14.344c-9.228 0-16.734 7.507-16.734 16.734V95.625c0 9.228 7.506 16.734 16.734 16.734h14.344zM389.672 112.359c9.228 0 16.734-7.507 16.734-16.734V16.734C406.406 7.507 398.899 0 389.672 0h-14.344c-9.228 0-16.734 7.507-16.734 16.734V95.625c0 9.228 7.507 16.734 16.734 16.734h14.344z"/><path d="M274.922 494.859c-2.333-11.6-3.572-23.586-3.572-35.859 0-4.021.177-7.999.435-11.953H74.109c-15.845 0-28.688-12.843-28.688-28.688v-229.5h411.188v88.707c3.165-.163 6.354-.253 9.562-.253 11.437 0 22.61 1.109 33.469 3.141V93.234c0-21.124-17.126-38.25-38.25-38.25h-31.078v40.641c0 22.41-18.23 40.641-40.641 40.641h-14.344c-22.41 0-40.641-18.231-40.641-40.641V54.984H167.344v40.641c0 22.41-18.231 40.641-40.641 40.641h-14.344c-22.41 0-40.641-18.231-40.641-40.641V54.984H40.641c-21.124 0-38.25 17.126-38.25 38.25v363.375c0 21.124 17.126 38.25 38.25 38.25h234.281z"/></svg>
          </button>
        </a>`
      ).join('<br>')
    }
  </li>`
);
const yearTemplate = ({ currentMonth, datetime, monthName, month }) => (
  `<li class="month ${currentMonth}">
    <time datetime="${datetime}">${monthName}</time>
    ${Object.keys(month).map(item => '<span></span>').join('')}
  </li>`
);

function callback(entries) {
  entries.forEach(entry => {
    if (entry.intersectionRatio === 1 && !loading) {
      const monthIndex = parseInt(entry.target.getAttribute('data-monthIndex'), 10);
      currentDate.setMonth(monthIndex);
      moveMonthTo(currentDate);
    }
  });
};

const $timeline = $$('[data-js="year-timeline"]');
const observer = new IntersectionObserver(callback, {
  root: $timeline,
  rootMargin: '0px',
  threshold: 1.0
});

export function moveMonthTo(moveTo) {
  let newDate = moveTo;

  if (!$title) {
    $title = $$('[data-js="layout-title"]');
  };

  if (typeof moveTo === 'string') {
    newDate = moveDateYear(currentDate, moveTo);
    renderEmptyCalendar(newDate);
    if (newDate.getFullYear() in holidaysData) {
      renderCalendar(newDate);
    } else {
      fetchNewYear(newDate);
    }
    currentDate = newDate;
    return;

  } else {
    const $month = $timeline.children[newDate.getMonth()];
    $title.firstChild.data = `${$month.getAttribute('data-title')}`;
    $month.scrollIntoView();
    currentDate = newDate;
  }
}

function fetchNewYear(date) {
  fetchData(date.getFullYear());
  renderEmptyCalendar(date);
}

export function fetchData(year = today.getFullYear()) {
  return fetch(`https://nolaborables.com.ar/api/v2/feriados/${year}?formato=mensual&incluir=opcional`)
    .then(res => res.json())
    .then(data => bootCalendar(data))
    .catch(data => bootCalendar(data));
}

function bootCalendar(data) {
  loading = true;

  if (data instanceof Error || data.error) {
    holidaysData[currentDate.getFullYear()] = null;
    renderCanlendar(currentDate);
    return;
  }

  holidaysData[currentDate.getFullYear()] = data;
  setTimeout(() => renderCalendar(currentDate), 500);
}

function renderEmptyCalendar(newDate) {
  $$('.loading').classList.remove('hide');
  while ($timeline.lastChild) { $timeline.removeChild($timeline.lastChild); }
}

function renderMonth(newDate) {
  const title = `${getMonthLongName(newDate)} ${newDate.getFullYear()}`;
  const listTemplate = (temp) => `
    <ol class="timeline" data-js="holiday-selection" data-title="${title}" data-monthIndex="${newDate.getMonth()}">
      ${temp}
    </ol>`;

  if (holidaysData[newDate.getFullYear()] === null) {
    return listTemplate(
      noDataYearTemplate(newDate.getFullYear())
    );
  }

  const monthHolidays = holidaysData[[newDate.getFullYear()]][newDate.getMonth()];

  if (Object.keys(monthHolidays).length === 0) {
    return listTemplate(
      noHolidaysTemplate()
    );
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

  return listTemplate(template);
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
  }).join('');
  $year.insertAdjacentHTML('beforeend', template);
}

function renderCalendar(date) {
  const a = new Date(date);
  const year = new Date(date.getFullYear(), '0');
  const yearHolidays = holidaysData[date.getFullYear()];

  const $template = document.createElement('template');
  yearHolidays.forEach((month, index) => {
    requestIdleCallback(() => {
      year.setMonth(index);
      $template.insertAdjacentHTML('beforeend', renderMonth(year));
    });
  });
  requestIdleCallback(() => {
    [].forEach.call($template.children, (child) => {
      const node = child.cloneNode(true);
      $timeline.appendChild(node);
      observer.observe(node);
    });
  });

  requestIdleCallback(() => {
    loading = false;
    $$('.loading').classList.add('hide');
    moveMonthTo(a);
  });

  requestIdleCallback(() => {
    renderYear(a);
  });
}

function createEvent(datetime, description) {
  return 'data:text/calendar;charset=utf8,' + encodeURIComponent(`BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//feriados.pazguille.me Local Maker
CALSCALE:GREGORIAN
BEGIN:VTIMEZONE
TZID:America/Argentina/Buenos_Aires
TZURL:http://tzurl.org/zoneinfo-outlook/America/Argentina/Buenos_Aires
X-LIC-LOCATION:America/Argentina/Buenos_Aires
BEGIN:STANDARD
TZOFFSETFROM:-0300
TZOFFSETTO:-0300
TZNAME:-03
DTSTART:19700101T000000
END:STANDARD
END:VTIMEZONE
BEGIN:VEVENT
DTSTART;VALUE=DATE:${datetime}
DTEND;VALUE=DATE:${datetime}
SUMMARY:🗓 Feriado!!! 😍
DESCRIPTION:${description}
END:VEVENT
END:VCALENDAR`
  );
}
