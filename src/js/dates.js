export const today = new Date();

export function moveDate(date, moveTo) {
  const to = moveTo === 'next' ? 1 : -1;
  return new Date(date.getFullYear(), date.getMonth() + to, 1);
}

export function isSameYear(dateA, dateB) {
  return dateA.getFullYear() === dateB.getFullYear();
}

export function getMonthLongName(date) {
  return new Intl.DateTimeFormat('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    month: 'long',
  }).format(date);
}

export function getWeekdayShortName(date) {
  return new Intl.DateTimeFormat('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    weekday: 'short'
  }).format(date);
}

export function getDatetimeFormat(date) {
  return date.toISOString().replace(/T.+/, '');
}

export function leftFillNum(day) {
  const n = parseInt(day);
  if (n < 10) {
    return day.padStart(2, '0');
  }
  return day;
}

export function isNextDay(date) {
  return date.getDate() >= today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
}

export function isCurrentMonth(date) {
  return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
}

export function stringToDate(dateString) {
  return new Date(dateString.replace(/-/g, '/'));
}

export function getNewYear(date, month) {
  return new Date(date.getFullYear(), month, 1);
}
