/** @typedef {import("pristinejs").PristineConfig} PristineConfig */
/** @typedef {import("pristinejs").Validator} Validator */
/** @typedef {import("pristinejs").Field} Field */


/**
 * @param {HTMLElement} el 
 * @param {string} cls
 * @returns {HTMLElement}
 */
export function findAncestor(el, cls) {
  while ((el = el.parentElement) && !el.classList.contains(cls));
  return el;
}

/**
 * @param {*} o 
 * @returns {Regexp}
 */
export function tmpl(o) {
  return this.replace(/\${([^{}]*)}/g, (a, b) => arguments[b]);
}

/**
 * @param {HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement} value 
 * @returns {number}
 */
export function groupedElemCount(input) {
  return input.pristine.self.form.querySelectorAll('input[name="' + input.getAttribute('name') + '"]:checked').length;
}

/**
 * @param {PristineConfig} obj1 
 * @param {PristineConfig} obj2 
 * @returns {PristineConfig}
 */
export function mergeConfig(obj1, obj2) {
  for (let attr in obj2) {
    if (!(attr in obj1)) {
      obj1[attr] = obj2[attr];
    }
  }
  return obj1;
}

/**
 * @param {*} value 
 * @returns {boolean}
 */
export function parseBool(value) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const val = value.trim().toLowerCase();
    return val === 'true' || val === '1' || val === 'yes' || val === 'on';
  }
  return !!value;
}
