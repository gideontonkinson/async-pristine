var Pristine = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/pristine.js
  var pristine_exports = {};
  __export(pristine_exports, {
    default: () => Pristine
  });

  // src/lang.js
  var lang = {
    en: {
      required: "This field is required",
      email: "This field requires a valid email address",
      number: "This field requires a number",
      integer: "This field requires an integer value",
      url: "This field requires a valid website URL",
      tel: "This field requires a valid telephone number",
      maxlength: "This fields length must be < ${1}",
      minlength: "This fields length must be > ${1}",
      min: "Minimum value for this field is ${1}",
      max: "Maximum value for this field is ${1}",
      filesize: "Maximum file size is ${1}",
      filesizetotal: "Maximum total file size ${1}",
      filetype: "Allowed file types: ${1.split(',').join(' ')}",
      pattern: "Please match the requested format",
      equals: "The two fields do not match",
      default: "Please enter a correct value"
    }
  };

  // src/utils.js
  function findAncestor(el, cls) {
    while ((el = el.parentElement) && !el.classList.contains(cls)) ;
    return el;
  }
  function tmpl(o) {
    return this.replace(/\${([^{}]*)}/g, (a, b) => arguments[b]);
  }
  function groupedElemCount(input) {
    return input.pristine.self.form.querySelectorAll('input[name="' + input.getAttribute("name") + '"]:checked').length;
  }
  function mergeConfig(obj1, obj2) {
    for (let attr in obj2) {
      if (!(attr in obj1)) {
        obj1[attr] = obj2[attr];
      }
    }
    return obj1;
  }

  // src/pristine.js
  var defaultConfig = {
    classTo: "form-group",
    errorClass: "has-danger",
    successClass: "has-success",
    errorTextParent: "form-group",
    errorTextTag: "div",
    errorTextClass: "text-help",
    disableSubmitUntilValid: true,
    validateDefaultValues: true,
    validationStrategy: "off"
  };
  var PRISTINE_ERROR = "pristine-error";
  var SELECTOR = "input:not([type^=hidden]):not([type^=submit]), select, textarea";
  var ALLOWED_ATTRIBUTES = /* @__PURE__ */ new Set(["required", "min", "max", "minlength", "maxlength", "pattern"]);
  var EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@']+(\.[^<>()\[\]\\.,;:\s@']+)*)|('.+'))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  var MESSAGE_REGEX = /-message(?:-([a-z]{2}(?:_[A-Z]{2})?))?/;
  var currentLocale = "en";
  var validators = {};
  var _ = function(name, validator) {
    validator.name = name;
    if (validator.priority === void 0)
      validator.priority = 1;
    validators[name] = validator;
  };
  _("text", { fn: () => true, priority: 0 });
  _("required", {
    fn: function(val) {
      if (this.type === "radio" || this.type === "checkbox") {
        return groupedElemCount(this);
      }
      if (this.type === "file") {
        return this.files && this.files.length > 0;
      }
      return val !== void 0 && val.trim() !== "";
    },
    priority: 99,
    halt: true
  });
  _("email", { fn: (val) => !val || EMAIL_REGEX.test(val) });
  _("number", { fn: (val) => !val || !isNaN(parseFloat(val)), priority: 2 });
  _("integer", { fn: (val) => !val || /^\d+$/.test(val) });
  _("minlength", { fn: (val, length) => !val || val.length >= parseInt(length) });
  _("maxlength", { fn: (val, length) => !val || val.length <= parseInt(length) });
  _("min", { fn: function(val, limit) {
    return !val || (this.type === "checkbox" ? groupedElemCount(this) >= parseInt(limit) : parseFloat(val) >= parseFloat(limit));
  } });
  _("max", { fn: function(val, limit) {
    return !val || (this.type === "checkbox" ? groupedElemCount(this) <= parseInt(limit) : parseFloat(val) <= parseFloat(limit));
  } });
  _("pattern", { fn: (val, pattern) => {
    let m = pattern.match(new RegExp("^/(.*?)/([gimy]*)$"));
    return !val || new RegExp(m[1], m[2]).test(val);
  } });
  _("equals", { fn: (val, otherFieldSelector) => {
    let other = document.querySelector(otherFieldSelector);
    return other && (!val && !other.value || other.value === val);
  } });
  _("filesize", {
    fn: function(_2, size) {
      if (!this.files || this.files.length === 0) return true;
      return Array.from(this.files).every(
        (file) => file.size <= parseInt(size)
      );
    }
  });
  _("filesizetotal", {
    fn: function(_2, size) {
      if (!this.files || this.files.length === 0) return true;
      return Array.from(this.files).reduce((sum, file) => sum + file.size, 0) <= parseInt(size);
    }
  });
  _("filetype", {
    fn: function(_2, types) {
      if (!this.files || this.files.length === 0) return true;
      const allowed = types.split(",").map((t) => t.trim().toLowerCase());
      return Array.from(this.files).every(
        (file) => allowed.includes(file.type.toLowerCase())
      );
    }
  });
  var Pristine = class {
    /**
     * @param {HTMLFormElement} form
     * @param {PristineConfig} [config]
     */
    constructor(form, config) {
      let self = this;
      init(form, config);
      async function init(form2, config2) {
        form2.setAttribute("novalidate", "true");
        self.destroyed = false;
        self.form = form2;
        self.config = mergeConfig(config2 || {}, defaultConfig);
        self.fields = Array.from(form2.querySelectorAll(SELECTOR)).map(
          /** @param {HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement} input */
          function(input) {
            const fns = [];
            const params = {};
            const messages = {};
            const overlappingAttributes = /* @__PURE__ */ new Set();
            let touched = false;
            [].forEach.call(input.attributes, function(attr) {
              if (/^data-pristine-/.test(attr.name)) {
                let name = attr.name.substr(14);
                if (ALLOWED_ATTRIBUTES.has(name)) {
                  overlappingAttributes.add(name);
                } else if (name === "type") {
                  overlappingAttributes.add(attr.value);
                }
              }
            });
            [].forEach.call(input.attributes, function(attr) {
              if (/^data-pristine-/.test(attr.name)) {
                let name = attr.name.substr(14);
                let messageMatch = name.match(MESSAGE_REGEX);
                if (messageMatch !== null) {
                  let locale = messageMatch[1] === void 0 ? "en" : messageMatch[1];
                  if (!messages.hasOwnProperty(locale))
                    messages[locale] = {};
                  let validatorName = name.replace(MESSAGE_REGEX, "");
                  messages[locale][validatorName] = attr.value;
                  return;
                }
                if (name === "type") name = attr.value;
                _addValidatorToField(fns, params, name, attr.value);
              } else if (ALLOWED_ATTRIBUTES.has(attr.name) && !overlappingAttributes.has(attr.name)) {
                _addValidatorToField(fns, params, attr.name, attr.value);
              } else if (attr.name === "type" && !overlappingAttributes.has(attr.value)) {
                _addValidatorToField(fns, params, attr.value);
              }
            });
            fns.sort((a, b) => b.priority - a.priority);
            if (self.config.validationStrategy === "live") {
              _addEventListener(input, !~["radio", "checkbox", "select"].indexOf(input.getAttribute("type")) ? "input" : "change", async function(e) {
                await self.validate(e.target);
              }.bind(self));
            } else if (self.config.validationStrategy === "blur") {
              _addEventListener(input, !~["radio", "checkbox", "select"].indexOf(input.getAttribute("type")) ? "blur" : "change", async function(e) {
                await self.validate(e.target);
              }.bind(self));
            } else if (self.config.validationStrategy === "hybrid") {
              _addEventListener(input, !~["radio", "checkbox", "select"].indexOf(input.getAttribute("type")) ? "blur" : "change", async function(e) {
                touched = true;
                await self.validate(e.target);
              }.bind(self), { once: true });
              _addEventListener(input, !~["radio", "checkbox", "select"].indexOf(input.getAttribute("type")) ? "input" : "change", async function(e) {
                if (touched) {
                  await self.validate(e.target);
                }
              }.bind(self));
            }
            if (self.config.validateDefaultValues) {
              queueMicrotask(async function() {
                const isChanged = input.type === "checkbox" || input.type === "radio" ? input.checked !== input.defaultChecked : input.value !== input.defaultValue;
                const isEmpty = input.value.trim() === "";
                const isRequired = input.hasAttribute("required") || input.hasAttribute("data-pristine-required") !== null;
                if (isChanged || isRequired && !isEmpty) {
                  touched = true;
                  await self.validate(input);
                }
              });
            }
            const pristine = { input, validators: fns, params, messages, touched, self };
            return input.pristine = pristine;
          }.bind(self)
        );
        self.submit = self.form.querySelector("button[type=submit], input[type=submit]");
        if (self.config.disableSubmitUntilValid) {
          let debouncedUpdate = function() {
            clearTimeout(self.debounceTimeout);
            self.debounceTimeout = setTimeout(disableSubmit.bind(self), 50);
          };
          self.debounceTimeout = null;
          _addEventListener(self.form, "input", debouncedUpdate.bind(self));
          _addEventListener(self.form, "change", debouncedUpdate.bind(self));
          queueMicrotask(disableSubmit);
        }
        _addEventListener(self.form, "reset", _reset.bind(self));
      }
      async function disableSubmit() {
        if (!self.submit) return;
        const invalid = !await self.validate(true);
        let changed = false;
        if (self.config.validateDefaultValues) {
          for (let field of self.fields) {
            const input = field.input;
            changed = input.type === "checkbox" || input.type === "radio" ? input.checked !== input.checked : input.value !== input.defaultValue;
            if (changed) {
              break;
            }
          }
        }
        self.submit.disabled = invalid || self.config.validateDefaultValues && !changed;
      }
      ;
      function _addValidatorToField(fns, params, name, value) {
        let validator = validators[name];
        if (validator) {
          fns.push(validator);
          if (value) {
            let valueParams = name === "pattern" ? [value] : value.split(",");
            valueParams.unshift(null);
            params[name] = valueParams;
          }
        }
      }
      self.validate = async function(input, silent) {
        silent = input && silent === true || input === true;
        let fields = self.fields;
        if (input !== true && input !== false) {
          if (input instanceof HTMLElement) {
            fields = [input.pristine];
          } else if (input instanceof NodeList || input instanceof (window.$ || Array) || input instanceof Array) {
            fields = Array.from(input).map((el) => el.pristine);
          }
        }
        let valid = true;
        for (let i = 0; fields[i]; i++) {
          let field = fields[i];
          if (await _validateField(field)) {
            !silent && _showSuccess(field);
          } else {
            valid = false;
            !silent && _showError(field);
          }
        }
        return valid;
      };
      self.getErrors = function(input) {
        if (!input) {
          let erroneousFields = [];
          for (let i = 0; i < self.fields.length; i++) {
            let field = self.fields[i];
            if (field.errors.length) {
              erroneousFields.push({ input: field.input, errors: field.errors });
            }
          }
          return erroneousFields;
        }
        if (input.tagName && input.tagName.toLowerCase() === "select") {
          return input.pristine.errors;
        }
        return input.length ? input[0].pristine.errors : input.pristine.errors;
      };
      async function _validateField(field) {
        let errors = [];
        let valid = true;
        let values = [];
        if (field.input.hasAttribute("multiple")) {
          if (field.input.type = "select") {
            values.push(Array.from(selectElem.selectedOptions).map((opt) => opt.value));
          } else {
            values.push(field.input.split(","));
          }
        } else {
          values.push(field.input.value);
        }
        for (let i = 0; i < values.length; i++) {
          let value = values[i];
          for (let j = 0; field.validators[j]; j++) {
            let validator = field.validators[j];
            let params = field.params[validator.name] ? field.params[validator.name] : [];
            params[0] = value;
            const isAsync = validator.fn.constructor.name === "AsyncFunction";
            if (isAsync ? !await validator.fn.apply(field.input, params) : !validator.fn.apply(field.input, params)) {
              valid = false;
              if (typeof validator.msg === "function") {
                errors.push(validator.msg(value, params));
              } else if (typeof validator.msg === "string") {
                errors.push(tmpl.apply(validator.msg, params));
              } else if (validator.msg === Object(validator.msg) && validator.msg[currentLocale]) {
                errors.push(tmpl.apply(validator.msg[currentLocale], params));
              } else if (field.messages[currentLocale] && field.messages[currentLocale][validator.name]) {
                errors.push(tmpl.apply(field.messages[currentLocale][validator.name], params));
              } else if (lang[currentLocale] && lang[currentLocale][validator.name]) {
                errors.push(tmpl.apply(lang[currentLocale][validator.name], params));
              } else {
                errors.push(tmpl.apply(lang[currentLocale].default, params));
              }
              if (validator.halt === true) {
                break;
              }
            }
          }
          if (!valid) {
            break;
          }
        }
        field.errors = errors;
        return valid;
      }
      self.addValidator = function(elem, fn, msg, priority, halt) {
        if (elem instanceof HTMLElement) {
          elem.pristine.validators.push({ fn, msg, priority, halt });
          elem.pristine.validators.sort((a, b) => b.priority - a.priority);
        } else {
          console.warn("The parameter elem must be a dom element");
        }
      };
      function _getErrorElements(field) {
        if (field.errorElements) {
          return field.errorElements;
        }
        let errorClassElement = findAncestor(field.input, self.config.classTo);
        let errorTextParent = null, errorTextElement = null;
        if (self.config.classTo === self.config.errorTextParent) {
          errorTextParent = errorClassElement;
        } else {
          errorTextParent = errorClassElement.querySelector("." + self.config.errorTextParent);
        }
        if (errorTextParent) {
          errorTextElement = errorTextParent.querySelector("." + PRISTINE_ERROR);
          if (!errorTextElement) {
            errorTextElement = document.createElement(self.config.errorTextTag);
            errorTextElement.className = PRISTINE_ERROR + " " + self.config.errorTextClass;
            errorTextParent.appendChild(errorTextElement);
            errorTextElement.pristineDisplay = errorTextElement.style.display;
          }
        }
        return field.errorElements = [errorClassElement, errorTextElement];
      }
      function _showError(field) {
        let errorElements = _getErrorElements(field);
        let errorClassElement = errorElements[0], errorTextElement = errorElements[1];
        const { input } = field;
        const inputId = input.id || Math.floor((/* @__PURE__ */ new Date()).valueOf() * Math.random());
        const errorId = `error-${inputId}`;
        if (errorClassElement) {
          let errCls = createClassArray(self.config.errorClass);
          let sucCls = createClassArray(self.config.successClass);
          if (sucCls.length) {
            sucCls.forEach((s) => errorClassElement.classList.remove(s));
          }
          ;
          if (errCls.length) {
            errCls.forEach((e) => errorClassElement.classList.add(e));
          }
          ;
          input.setAttribute("aria-describedby", errorId);
          input.setAttribute("aria-invalid", "true");
        }
        if (errorTextElement) {
          errorTextElement.setAttribute("id", errorId);
          errorTextElement.setAttribute("role", "alert");
          errorTextElement.innerHTML = field.errors.join("<br/>");
          errorTextElement.style.display = errorTextElement.pristineDisplay || "";
        }
      }
      self.addError = function(input, error) {
        input = input.length ? input[0] : input;
        input.pristine.errors.push(error);
        _showError(input.pristine);
      };
      function _removeError(field) {
        let errorElements = _getErrorElements(field);
        let errorClassElement = errorElements[0], errorTextElement = errorElements[1];
        const { input } = field;
        if (errorClassElement) {
          let errCls = createClassArray(self.config.errorClass);
          let sucCls = createClassArray(self.config.successClass);
          if (errCls.length) {
            errCls.forEach((e) => errorClassElement.classList.remove(e));
          }
          ;
          if (sucCls.length) {
            sucCls.forEach((s) => errorClassElement.classList.remove(s));
          }
          ;
          input.removeAttribute("aria-describedby");
          input.removeAttribute("aria-invalid");
        }
        if (errorTextElement) {
          errorTextElement.removeAttribute("id");
          errorTextElement.removeAttribute("role");
          errorTextElement.innerHTML = "";
          errorTextElement.style.display = "none";
        }
        return errorElements;
      }
      function _showSuccess(field) {
        let errorClassElement = _removeError(field)[0];
        let sucCls = createClassArray(self.config.successClass);
        if (sucCls.length) {
          errorClassElement && sucCls.forEach((s) => errorClassElement.classList.add(s));
        }
        ;
      }
      function _addEventListener(input, event, handler) {
        input.addEventListener(event, handler);
        if (!input.__pristineListeners) input.__pristineListeners = [];
        input.__pristineListeners.push({ event, handler });
      }
      function _removeEventListener(input) {
        if (!input.__pristineListeners) return;
        for (const { event, handler } of input.__pristineListeners) {
          input.removeEventListener(event, handler);
        }
        input.__pristineListeners = [];
      }
      async function _reset() {
        for (let i = 0; self.fields[i]; i++) {
          self.fields[i].errorElements = null;
          self.fields[i].touched = false;
        }
        if (self.config.disableSubmitUntilValid) {
          await disableSubmit.bind(self);
        }
        Array.from(self.form.querySelectorAll("." + PRISTINE_ERROR)).map(function(elem) {
          elem.parentNode.removeChild(elem);
        });
        Array.from(self.form.querySelectorAll("." + self.config.classTo)).map(function(elem) {
          let errCls = createClassArray(self.config.errorClass);
          let sucCls = createClassArray(self.config.successClass);
          if (errCls.length) {
            sucCls.forEach((s) => elem.classList.remove(s));
          }
          ;
          if (errCls.length) {
            errCls.forEach((e) => elem.classList.remove(e));
          }
          ;
        });
      }
      ;
      self.reset = _reset.bind(self);
      function createClassArray(classString) {
        let cls = classString.split(" ").filter((e) => e);
        if (cls.length) return cls;
        return [];
      }
      self.destroy = async function() {
        if (self.destroyed) return;
        self.destroyed = true;
        if (self.debounceTimeout) {
          clearTimeout(self.debounceTimeout);
          self.debounceTimeout = null;
        }
        await self.reset();
        self.fields.forEach(
          /** @param {Field} field */
          function(field) {
            _removeEventListener(field.input);
            delete field.input.pristine;
          }
        );
        self.fields = [];
        _removeEventListener(self.form);
      };
      self.setGlobalConfig = function(config2) {
        defaultConfig = config2;
      };
      return self;
    }
    /**
     * Adds a global validator
     * @param {string} name => Name of the global validator
     * @param {Validator['fn']} fn => validator function
     * @param {Validator['msg']} [msg] => message to show when validation fails. Supports templating. ${0} for the input's value, ${1} and so on are for the attribute values
     * @param {number} [priority] => priority of the validator function, higher valued function gets called first
     * @param {boolean} [halt] => whether validation should stop for this field after current validation function
     */
    static addValidator(name, fn, msg, priority, halt) {
      _(name, { fn, msg, priority, halt });
    }
    /**
     * Adds a global message for a specific locale
     * @param {string} [locale]
     * @param {string} [message] 
     */
    static addMessages(locale, messages) {
      let langObj = lang.hasOwnProperty(locale) ? lang[locale] : lang[locale] = {};
      Object.keys(messages).forEach(function(key, _2) {
        langObj[key] = messages[key];
      });
    }
    /**
     * Set the local
     * @param {string} [locale]
     */
    static setLocale(locale) {
      currentLocale = locale;
    }
  };
  return __toCommonJS(pristine_exports);
})();
//# sourceMappingURL=pristine.js.map
