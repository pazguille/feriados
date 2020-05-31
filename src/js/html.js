function h(strings, ...args) {
  let result = ``;
  const appends = {};

  for (let i = 0; i < args.length; i++) {
    const a =  Array.isArray(args[i]) ? args[i] : [args[i]];
    result += strings[i];
    a.forEach((b, index) => {
      if (b instanceof DocumentFragment) {
        const id = `id-${i}-${index}`;
        appends[id] = b;
        result += `<div append="${id}"></div>`;
      } else {
        result += b;
      }
    });
  }

  result += strings[strings.length - 1];

  const template = document.createElement(`template`);
  template.innerHTML = result;

  const content = template.content;

  [...content.querySelectorAll(`[onClick]`)].forEach(refNode => {
    const position = args.findIndex((arg, i) => strings[i].includes('onClick') && typeof arg === 'function');
    refNode.addEventListener('click', args[position]);
    refNode.removeAttribute('onClick');
  });

  [...content.querySelectorAll(`[append]`)].forEach(refNode => {
    const newNode = appends[refNode.getAttribute('append')];
    refNode.parentNode.insertBefore(newNode, refNode);
    refNode.parentNode.removeChild(refNode);
  });

  content.collect = ({ attr = 'ref', keepAttribute, to = {} } = {}) => {
    const refElements = content.querySelectorAll(`[${attr}]`);
    return [...refElements].reduce((acc, element) => {
      const propName = element.getAttribute(attr).trim();
      !keepAttribute && element.removeAttribute(attr);
      acc[propName] = acc[propName]
        ? Array.isArray(acc[propName])
          ? [...acc[propName], element]
          : [acc[propName], element]
        : element;
      return acc;
    }, to);
  };

  return content;
}

export function render(parent, node) {
  parent.appendChild(node);
}

export function html(strs, ...keys) {
  return h(strs, ...keys);
};

export const docEl = document.documentElement;

export function $$(selector) {
  return document.querySelector(selector);
}
