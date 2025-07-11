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
    errorTextClass: "text-help"
  };
  var PRISTINE_ERROR = "pristine-error";
  var SELECTOR = "input:not([type^=hidden]):not([type^=submit]), select, textarea";
  var ALLOWED_ATTRIBUTES = /* @__PURE__ */ new Set(["required", "min", "max", "minlength", "maxlength", "pattern"]);
  var EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  var MESSAGE_REGEX = /-message(?:-([a-z]{2}(?:_[A-Z]{2})?))?/;
  var currentLocale = "en";
  var validators = {};
  var _ = function(name, validator) {
    validator.name = name;
    if (validator.priority === void 0)
      validator.priority = 1;
    validators[name] = validator;
  };
  _("text", { fn: (val) => true, priority: 0 });
  _("required", { fn: function(val) {
    return this.type === "radio" || this.type === "checkbox" ? groupedElemCount(this) : val !== void 0 && val.trim() !== "";
  }, priority: 99, halt: true });
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
  function Pristine(form, config, live) {
    let self = this;
    init(form, config, live);
    function init(form2, config2, live2) {
      form2.setAttribute("novalidate", "true");
      self.form = form2;
      self.config = mergeConfig(config2 || {}, defaultConfig);
      if (live2 === "live") {
        self.live = "live";
      } else if (live2 === "blur") {
        self.live = "blur";
      } else if (live2 === "hybrid") {
        self.live = "hybrid";
      } else {
        self.live = "off";
      }
      self.fields = Array.from(form2.querySelectorAll(SELECTOR)).map(function(input) {
        let fns = [];
        let params = {};
        let messages = {};
        let overlappingAttributes = /* @__PURE__ */ new Set();
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
              messages[locale][name.slice(0, name.length - messageMatch[0].length)] = attr.value;
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
        if (self.live === "live") {
          input.addEventListener(!~["radio", "checkbox"].indexOf(input.getAttribute("type")) ? "input" : "change", function(e) {
            self.validate(e.target);
          }.bind(self));
        } else if (self.live === "blur") {
          input.addEventListener(!~["radio", "checkbox"].indexOf(input.getAttribute("type")) ? "blur" : "change", function(e) {
            self.validate(e.target);
          }.bind(self));
        } else if (self.live === "hybrid") {
          let touched = false;
          const defaultValue = input.value;
          input.addEventListener(!~["radio", "checkbox"].indexOf(input.getAttribute("type")) ? "blur" : "change", function(e) {
            touched = true;
            self.validate(e.target);
          }.bind(self));
          input.addEventListener(!~["radio", "checkbox"].indexOf(input.getAttribute("type")) ? "input" : "change", function(e) {
            if (touched) {
              self.validate(e.target);
            }
          }.bind(self));
          input.addEventListener("input", function() {
            const changed = type === "checkbox" || type === "radio" ? input.checked !== defaultChecked : input.value !== defaultValue;
            if (changed && !touched) {
              touched = true;
              self.validate(input);
            }
          });
        }
        return input.pristine = { input, validators: fns, params, messages, self };
      }.bind(self));
    }
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
      for (let i = 0; field.validators[i]; i++) {
        let validator = field.validators[i];
        let params = field.params[validator.name] ? field.params[validator.name] : [];
        params[0] = field.input.value;
        const isAsync = validator.fn.constructor.name === "AsyncFunction";
        if (isAsync ? !await validator.fn.apply(field.input, params) : !validator.fn.apply(field.input, params)) {
          valid = false;
          if (typeof validator.msg === "function") {
            errors.push(validator.msg(field.input.value, params));
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
    self.addAsyncValidator = function(elem, fn, msg, priority, halt) {
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
    self.reset = function() {
      for (let i = 0; self.fields[i]; i++) {
        self.fields[i].errorElements = null;
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
    };
    function createClassArray(classString) {
      let cls = classString.split(" ").filter((e) => e);
      if (cls.length) return cls;
      return [];
    }
    self.destroy = function() {
      self.reset();
      self.fields.forEach(function(field) {
        delete field.input.pristine;
      });
      self.fields = [];
    };
    self.setGlobalConfig = function(config2) {
      defaultConfig = config2;
    };
    return self;
  }
  Pristine.addValidator = function(name, fn, msg, priority, halt) {
    _(name, { fn, msg, priority, halt });
  };
  Pristine.addAsyncValidator = function(name, fn, msg, priority, halt) {
    _(name, { fn, msg, priority, halt });
  };
  Pristine.addMessages = function(locale, messages) {
    let langObj = lang.hasOwnProperty(locale) ? lang[locale] : lang[locale] = {};
    Object.keys(messages).forEach(function(key, index) {
      langObj[key] = messages[key];
    });
  };
  Pristine.setLocale = function(locale) {
    currentLocale = locale;
  };
  return __toCommonJS(pristine_exports);
})();
//# sourceMappingURL=pristine.js.map
