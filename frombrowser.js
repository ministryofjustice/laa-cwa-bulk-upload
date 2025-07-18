function isSupported(t = document.body) {
  return !!t && t.classList.contains("govuk-frontend-supported")
}

function isObject(t) {
  return !!t && "object" == typeof t && !function (t) {
    return Array.isArray(t)
  }(t)
}

function formatErrorMessage(t, e) {
  return `${t.moduleName}: ${e}`
}

class GOVUKFrontendError extends Error {
  constructor(...t) {
    super(...t), this.name = "GOVUKFrontendError"
  }
}

class SupportError extends GOVUKFrontendError {
  constructor(t = document.body) {
    const e = "noModule" in HTMLScriptElement.prototype
        ? 'GOV.UK Frontend initialised without `<body class="govuk-frontend-supported">` from template `<script>` snippet'
        : "GOV.UK Frontend is not supported in this browser";
    super(t ? e
        : 'GOV.UK Frontend initialised without `<script type="module">`'), this.name = "SupportError"
  }
}

class ConfigError extends GOVUKFrontendError {
  constructor(...t) {
    super(...t), this.name = "ConfigError"
  }
}

class ElementError extends GOVUKFrontendError {
  constructor(t) {
    let e = "string" == typeof t ? t : "";
    if ("object" == typeof t) {
      const {component: o, identifier: s, element: n, expectedType: i} = t;
      e = s, e += n ? ` is not of type ${null != i ? i : "HTMLElement"}`
          : " not found", e = formatErrorMessage(o, e)
    }
    super(e), this.name = "ElementError"
  }
}

class InitError extends GOVUKFrontendError {
  constructor(t) {
    super("string" == typeof t ? t : formatErrorMessage(t,
        "Root element (`$root`) already initialised")), this.name = "InitError"
  }
}

class Component {
  get $root() {
    return this._$root
  }

  constructor(t) {
    this._$root = void 0;
    const e = this.constructor;
    if ("string" != typeof e.moduleName) {
      throw new InitError(
          "`moduleName` not defined in component");
    }
    if (!(t instanceof e.elementType)) {
      throw new ElementError({
        element: t,
        component: e,
        identifier: "Root element (`$root`)",
        expectedType: e.elementType.name
      });
    }
    this._$root = t, e.checkSupport(), this.checkInitialised();
    const o = e.moduleName;
    this.$root.setAttribute(`data-${o}-init`, "")
  }

  checkInitialised() {
    const t = this.constructor, e = t.moduleName;
    if (e && function (t, e) {
      return t instanceof HTMLElement && t.hasAttribute(`data-${e}-init`)
    }(this.$root, e)) {
      throw new InitError(t)
    }
  }

  static checkSupport() {
    if (!isSupported()) {
      throw new SupportError
    }
  }
}

Component.elementType = HTMLElement;
const t = Symbol.for("configOverride");

class ConfigurableComponent extends Component {
  [t](t) {
    return {}
  }

  get config() {
    return this._config
  }

  constructor(e, o) {
    super(e), this._config = void 0;
    const s = this.constructor;
    if (!isObject(s.defaults)) {
      throw new ConfigError(formatErrorMessage(s,
          "Config passed as parameter into constructor but no defaults defined"));
    }
    const n = function (t, e) {
      if (!isObject(t.schema)) {
        throw new ConfigError(formatErrorMessage(t,
            "Config passed as parameter into constructor but no schema defined"));
      }
      const o = {}, s = Object.entries(t.schema.properties);
      for (const n of s) {
        const [s, i] = n, r = s.toString();
        r in e && (o[r] = normaliseString(e[r], i)), "object" === (null == i
            ? void 0 : i.type) && (o[r] = extractConfigByNamespace(t.schema, e,
            s))
      }
      return o
    }(s, this._$root.dataset);
    this._config = mergeConfigs(s.defaults, null != o ? o : {}, this[t](n), n)
  }
}

function normaliseString(t, e) {
  const o = t ? t.trim() : "";
  let s, n = null == e ? void 0 : e.type;
  switch (n || (["true", "false"].includes(o) && (n = "boolean"), o.length > 0
  && isFinite(Number(o)) && (n = "number")), n) {
    case"boolean":
      s = "true" === o;
      break;
    case"number":
      s = Number(o);
      break;
    default:
      s = t
  }
  return s
}

function mergeConfigs(...t) {
  const e = {};
  for (const o of t) {
    for (const t of Object.keys(o)) {
      const s = e[t], n = o[t];
      isObject(s) && isObject(n) ? e[t] = mergeConfigs(s, n) : e[t] = n
    }
  }
  return e
}

function extractConfigByNamespace(t, e, o) {
  const s = t.properties[o];
  if ("object" !== (null == s ? void 0 : s.type)) {
    return;
  }
  const n = {[o]: {}};
  for (const [i, r] of Object.entries(e)) {
    let t = n;
    const e = i.split(".");
    for (const [s, n] of e.entries()) {
      isObject(t) && (s < e.length - 1
          ? (isObject(t[n]) || (t[n] = {}), t = t[n]) : i !== o
          && (t[n] = normaliseString(r)))
    }
  }
  return n[o]
}

function createAll(t, e, o) {
  let s, n = document;
  var i;
  "object" == typeof o && (n = null != (i = o.scope) ? i : n, s = o.onError);
  "function" == typeof o && (s = o), o instanceof HTMLElement && (n = o);
  const r = n.querySelectorAll(`[data-module="${t.moduleName}"]`);
  return isSupported() ? Array.from(r).map((o => {
    try {
      return void 0 !== e ? new t(o, e) : new t(o)
    } catch (n) {
      return s ? s(n, {element: o, component: t, config: e}) : console.log(
          n), null
    }
  })).filter(Boolean) : (s ? s(new SupportError, {component: t, config: e})
      : console.log(new SupportError), [])
}

const version = "5.1.3";

class AddAnother extends Component {
  constructor(t) {
    super(t), this.$root.addEventListener("click",
        this.onRemoveButtonClick.bind(this)), this.$root.addEventListener(
        "click", this.onAddButtonClick.bind(this));
    this.$root.querySelectorAll(
        ".moj-add-another__add-button, moj-add-another__remove-button").forEach(
        (t => {
          t instanceof HTMLButtonElement && (t.type = "button")
        }))
  }

  onAddButtonClick(t) {
    const e = t.target;
    if (!(e && e instanceof HTMLButtonElement && e.classList.contains(
        "moj-add-another__add-button"))) {
      return;
    }
    const o = this.getItems(), s = this.getNewItem();
    if (!(s && s instanceof HTMLElement)) {
      return;
    }
    this.updateAttributes(s, o.length), this.resetItem(s);
    const n = o[0];
    this.hasRemoveButton(n) || this.createRemoveButton(n), o[o.length
    - 1].after(s);
    const i = s.querySelector("input, textarea, select");
    i && i instanceof HTMLInputElement && i.focus()
  }

  hasRemoveButton(t) {
    return t.querySelectorAll(".moj-add-another__remove-button").length
  }

  getItems() {
    if (!this.$root) {
      return [];
    }
    return Array.from(
        this.$root.querySelectorAll(".moj-add-another__item")).filter(
        (t => t instanceof HTMLElement))
  }

  getNewItem() {
    const t = this.getItems()[0].cloneNode(!0);
    if (t && t instanceof HTMLElement) {
      return this.hasRemoveButton(t)
      || this.createRemoveButton(t), t
    }
  }

  updateAttributes(t, e) {
    t.querySelectorAll("[data-name]").forEach((o => {
      if (!this.isValidInputElement(o)) {
        return;
      }
      const s = o.getAttribute("data-name") || "",
          n = o.getAttribute("data-id") || "", i = o.id;
      o.name = s.replace(/%index%/, `${e}`), o.id = n.replace(/%index%/,
          `${e}`);
      const r = o.parentElement.querySelector("label") || o.closest("label")
          || t.querySelector(`[for="${i}"]`);
      r && r instanceof HTMLLabelElement && (r.htmlFor = o.id)
    }))
  }

  createRemoveButton(t) {
    const e = document.createElement("button");
    e.type = "button", e.classList.add("govuk-button",
        "govuk-button--secondary",
        "moj-add-another__remove-button"), e.textContent = "Remove", t.append(e)
  }

  resetItem(t) {
    t.querySelectorAll("[data-name], [data-id]").forEach((t => {
      if (this.isValidInputElement(t)) {
        if (t
            instanceof HTMLSelectElement) {
          t.selectedIndex = -1, t.value = "";
        } else if (t
            instanceof HTMLTextAreaElement) {
          t.value = "";
        } else {
          switch (t.type) {
            case"checkbox":
            case"radio":
              t.checked = !1;
              break;
            default:
              t.value = ""
          }
        }
      }
    }))
  }

  onRemoveButtonClick(t) {
    const e = t.target;
    if (!(e && e instanceof HTMLButtonElement && e.classList.contains(
        "moj-add-another__remove-button"))) {
      return;
    }
    e.closest(".moj-add-another__item").remove();
    const o = this.getItems();
    1 === o.length && o[0].querySelector(
        ".moj-add-another__remove-button").remove(), o.forEach(((t, e) => {
      this.updateAttributes(t, e)
    })), this.focusHeading()
  }

  focusHeading() {
    const t = this.$root.querySelector(".moj-add-another__heading");
    t && t instanceof HTMLElement && t.focus()
  }

  isValidInputElement(t) {
    return t instanceof HTMLInputElement || t instanceof HTMLSelectElement || t
        instanceof HTMLTextAreaElement
  }
}

function setFocus(t, e = {}) {
  var o;
  const s = t.getAttribute("tabindex");

  function onBlur() {
    var o;
    null == (o = e.onBlur) || o.call(t), s || t.removeAttribute("tabindex")
  }

  s || t.setAttribute("tabindex", "-1"), t.addEventListener("focus",
      (function () {
        t.addEventListener("blur", onBlur, {once: !0})
      }), {once: !0}), null == (o = e.onBeforeFocus) || o.call(t), t.focus()
}

function removeAttributeValue(t, e, o) {
  let s, n;
  t.getAttribute(e) && (t.getAttribute(e) === o ? t.removeAttribute(e)
      : (s = new RegExp(`(^|\\s)${o}(\\s|$)`), n = t.getAttribute(e).match(s), n
      && 3 === n.length && t.setAttribute(e,
          t.getAttribute(e).replace(s, n[1] && n[2] ? " " : ""))))
}

function addAttributeValue(t, e, o) {
  let s;
  t.getAttribute(e) ? (s = new RegExp(`(^|\\s)${o}(\\s|$)`), s.test(
          t.getAttribute(e)) || t.setAttribute(e, `${t.getAttribute(e)} ${o}`))
      : t.setAttribute(e, o)
}

AddAnother.moduleName = "moj-add-another";

class Alert extends ConfigurableComponent {
  constructor(t, e = {}) {
    super(t, e), "alert" !== this.$root.getAttribute("role")
    || this.config.disableAutoFocus || setFocus(
        this.$root), this.$dismissButton = this.$root.querySelector(
        ".moj-alert__dismiss"), this.config.dismissible && this.$dismissButton
    && (this.$dismissButton.innerHTML = this.config.dismissText, this.$dismissButton.removeAttribute(
        "hidden"), this.$root.addEventListener("click", (t => {
      t.target instanceof Node && this.$dismissButton.contains(t.target)
      && this.dimiss()
    })))
  }

  dimiss() {
    let t;
    if (this.config.focusOnDismissSelector && (t = document.querySelector(
        this.config.focusOnDismissSelector)), !t) {
      const e = this.$root.nextElementSibling;
      e && e.matches(".moj-alert") && (t = e)
    }
    t || (t = function (t, e) {
      if (!(t && t instanceof HTMLElement)) {
        return;
      }
      let o = t.previousElementSibling;
      for (; o;) {
        if (o.matches(e)) {
          return o;
        }
        o = o.previousElementSibling
      }
    }(this.$root, ".moj-alert, h1, h2, h3, h4, h5, h6")), t || (t = function (t,
        e) {
      if (!(t && t instanceof HTMLElement)) {
        return;
      }
      let o = t;
      for (; o;) {
        if (o.matches(e)) {
          return o;
        }
        let t = o.previousElementSibling;
        for (; t;) {
          if (t.matches(e)) {
            return t;
          }
          t = t.previousElementSibling
        }
        o = o.parentElement
      }
    }(this.$root, "h1, h2, h3, h4, h5, h6, main, body")), t
    instanceof HTMLElement && setFocus(t), this.$root.remove()
  }
}

Alert.moduleName = "moj-alert", Alert.defaults = Object.freeze({
  dismissible: !1,
  dismissText: "Dismiss",
  disableAutoFocus: !1
}), Alert.schema = Object.freeze({
  properties: {
    dismissible: {type: "boolean"},
    dismissText: {type: "string"},
    disableAutoFocus: {type: "boolean"},
    focusOnDismissSelector: {type: "string"}
  }
});

class ButtonMenu extends ConfigurableComponent {
  constructor(t, e = {}) {
    if (super(t, e), 1 === this.$root.children.length) {
      const t = this.$root.children[0];
      t.classList.forEach((e => {
        e.startsWith("govuk-button-") && t.classList.remove(
            e), t.classList.remove("moj-button-menu__item"), t.classList.add(
            "moj-button-menu__single-button")
      })), this.config.buttonClasses && t.classList.add(
          ...this.config.buttonClasses.split(" "))
    }
    this.$root.children.length > 1 && this.initMenu()
  }

  initMenu() {
    this.$menu = this.createMenu(), this.$root.insertAdjacentHTML("afterbegin",
        this.toggleTemplate()), this.setupMenuItems(), this.$menuToggle = this.$root.querySelector(
        ":scope > button"), this.$items = this.$menu.querySelectorAll(
        "a, button"), this.$menuToggle.addEventListener("click", (t => {
      this.toggleMenu(t)
    })), this.$root.addEventListener("keydown", (t => {
      this.handleKeyDown(t)
    })), document.addEventListener("click", (t => {
      t.target instanceof Node && !this.$root.contains(t.target)
      && this.closeMenu(!1)
    }))
  }

  createMenu() {
    const t = document.createElement("ul");
    for (t.setAttribute("role", "list"), t.hidden = !0, t.classList.add(
        "moj-button-menu__wrapper"), "right" === this.config.alignMenu
    && t.classList.add(
        "moj-button-menu__wrapper--right"), this.$root.appendChild(t);
        this.$root.firstChild !== t;) {
      t.appendChild(this.$root.firstChild);
    }
    return t
  }

  setupMenuItems() {
    Array.from(this.$menu.children).forEach((t => {
      const e = document.createElement("li");
      this.$menu.insertBefore(e, t), e.appendChild(t), t.setAttribute(
          "tabindex", "-1"), "BUTTON" === t.tagName && t.setAttribute("type",
          "button"), t.classList.forEach((e => {
        e.startsWith("govuk-button") && t.classList.remove(e)
      })), t.addEventListener("click", (() => {
        setTimeout((() => {
          this.closeMenu(!1)
        }), 50)
      }))
    }))
  }

  toggleTemplate() {
    return `\n    <button type="button" class="govuk-button moj-button-menu__toggle-button ${this.config.buttonClasses
    || ""}" aria-haspopup="true" aria-expanded="false">\n      <span>\n       ${this.config.buttonText}\n       <svg width="11" height="5" viewBox="0 0 11 5"  xmlns="http://www.w3.org/2000/svg">\n         <path d="M5.5 0L11 5L0 5L5.5 0Z" fill="currentColor"/>\n       </svg>\n      </span>\n    </button>`
  }

  isOpen() {
    return "true" === this.$menuToggle.getAttribute("aria-expanded")
  }

  toggleMenu(t) {
    t.preventDefault();
    const e = 0 === t.detail ? 0 : -1;
    this.isOpen() ? this.closeMenu() : this.openMenu(e)
  }

  openMenu(t = 0) {
    this.$menu.hidden = !1, this.$menuToggle.setAttribute("aria-expanded",
        "true"), -1 !== t && this.focusItem(t)
  }

  closeMenu(t = !0) {
    this.$menu.hidden = !0, this.$menuToggle.setAttribute("aria-expanded",
        "false"), t && this.$menuToggle.focus()
  }

  focusItem(t) {
    t >= this.$items.length && (t = 0), t < 0 && (t = this.$items.length - 1);
    const e = this.$items.item(t);
    e && e.focus()
  }

  currentFocusIndex() {
    const t = document.activeElement, e = Array.from(this.$items);
    return (t instanceof HTMLAnchorElement || t instanceof HTMLButtonElement)
        && e.indexOf(t)
  }

  handleKeyDown(t) {
    if (t.target === this.$menuToggle) {
      switch (t.key) {
        case"ArrowDown":
          t.preventDefault(), this.openMenu();
          break;
        case"ArrowUp":
          t.preventDefault(), this.openMenu(this.$items.length - 1)
      }
    }
    if (t.target instanceof Node && this.$menu.contains(t.target)
        && this.isOpen()) {
      switch (t.key) {
        case"ArrowDown":
          t.preventDefault(), -1 !== this.currentFocusIndex() && this.focusItem(
              this.currentFocusIndex() + 1);
          break;
        case"ArrowUp":
          t.preventDefault(), -1 !== this.currentFocusIndex() && this.focusItem(
              this.currentFocusIndex() - 1);
          break;
        case"Home":
          t.preventDefault(), this.focusItem(0);
          break;
        case"End":
          t.preventDefault(), this.focusItem(this.$items.length - 1)
      }
    }
    "Escape" === t.key && this.isOpen() && this.closeMenu(), "Tab" === t.key
    && this.isOpen() && this.closeMenu(!1)
  }
}

ButtonMenu.moduleName = "moj-button-menu", ButtonMenu.defaults = Object.freeze({
  buttonText: "Actions",
  alignMenu: "left",
  buttonClasses: ""
}), ButtonMenu.schema = Object.freeze({
  properties: {
    buttonText: {type: "string"},
    buttonClasses: {type: "string"},
    alignMenu: {type: "string"}
  }
});

class DatePicker extends ConfigurableComponent {
  constructor(t, e = {}) {
    var o;
    super(t, e);
    const s = null != (o = this.config.input.element) ? o
        : this.$root.querySelector(this.config.input.selector);
    if (!(s && s instanceof HTMLInputElement)) {
      return this;
    }
    this.$input = s, this.dayLabels = ["Monday", "Tuesday", "Wednesday",
      "Thursday", "Friday", "Saturday",
      "Sunday"], this.monthLabels = ["January", "February", "March", "April",
      "May", "June", "July", "August", "September", "October", "November",
      "December"], this.currentDate = new Date, this.currentDate.setHours(0, 0,
        0,
        0), this.calendarDays = [], this.excludedDates = [], this.excludedDays = [], this.buttonClass = "moj-datepicker__button", this.selectedDayButtonClass = "moj-datepicker__button--selected", this.currentDayButtonClass = "moj-datepicker__button--current", this.todayButtonClass = "moj-datepicker__button--today", this.setOptions(), this.initControls()
  }

  initControls() {
    this.id = `datepicker-${this.$input.id}`, this.$dialog = this.createDialog(), this.createCalendarHeaders();
    const t = document.createElement("div"), e = document.createElement("div");
    t.classList.add("moj-datepicker__wrapper"), e.classList.add(
        "govuk-input__wrapper"), this.$input.parentElement.insertBefore(t,
        this.$input), t.appendChild(e), e.appendChild(
        this.$input), e.insertAdjacentHTML("beforeend",
        this.toggleTemplate()), t.insertAdjacentElement("beforeend",
        this.$dialog), this.$calendarButton = this.$root.querySelector(
        ".moj-js-datepicker-toggle"), this.$dialogTitle = this.$dialog.querySelector(
        ".moj-js-datepicker-month-year"), this.createCalendar(), this.$prevMonthButton = this.$dialog.querySelector(
        ".moj-js-datepicker-prev-month"), this.$prevYearButton = this.$dialog.querySelector(
        ".moj-js-datepicker-prev-year"), this.$nextMonthButton = this.$dialog.querySelector(
        ".moj-js-datepicker-next-month"), this.$nextYearButton = this.$dialog.querySelector(
        ".moj-js-datepicker-next-year"), this.$cancelButton = this.$dialog.querySelector(
        ".moj-js-datepicker-cancel"), this.$okButton = this.$dialog.querySelector(
        ".moj-js-datepicker-ok"), this.$prevMonthButton.addEventListener(
        "click", (t => this.focusPreviousMonth(t,
            !1))), this.$prevYearButton.addEventListener("click",
        (t => this.focusPreviousYear(t,
            !1))), this.$nextMonthButton.addEventListener("click",
        (t => this.focusNextMonth(t,
            !1))), this.$nextYearButton.addEventListener("click",
        (t => this.focusNextYear(t, !1))), this.$cancelButton.addEventListener(
        "click", (t => {
          t.preventDefault(), this.closeDialog()
        })), this.$okButton.addEventListener("click", (() => {
      this.selectDate(this.currentDate)
    }));
    const o = this.$dialog.querySelectorAll('button:not([disabled="true"])');
    this.$firstButtonInDialog = o[0], this.$lastButtonInDialog = o[o.length
    - 1], this.$firstButtonInDialog.addEventListener("keydown",
        (t => this.firstButtonKeydown(
            t))), this.$lastButtonInDialog.addEventListener("keydown",
        (t => this.lastButtonKeydown(
            t))), this.$calendarButton.addEventListener("click",
        (t => this.toggleDialog(t))), this.$dialog.addEventListener("keydown",
        (t => {
          "Escape" === t.key
          && (this.closeDialog(), t.preventDefault(), t.stopPropagation())
        })), document.body.addEventListener("mouseup",
        (t => this.backgroundClick(t))), this.updateCalendar()
  }

  createDialog() {
    const t = `datepicker-title-${this.$input.id}`,
        e = document.createElement("div");
    return e.id = this.id, e.setAttribute("class",
        "moj-datepicker__dialog"), e.setAttribute("role",
        "dialog"), e.setAttribute("aria-modal", "true"), e.setAttribute(
        "aria-labelledby", t), e.innerHTML = this.dialogTemplate(
        t), e.hidden = !0, e
  }

  createCalendar() {
    const t = this.$dialog.querySelector("tbody");
    let e = 0;
    for (let o = 0; o < 6; o++) {
      const s = t.insertRow(o);
      for (let t = 0; t < 7; t++) {
        const n = document.createElement("td"),
            i = document.createElement("button");
        n.appendChild(i), s.appendChild(n);
        const r = new DSCalendarDay(i, e, o, t, this);
        this.calendarDays.push(r), e++
      }
    }
  }

  toggleTemplate() {
    return `<button class="moj-datepicker__toggle moj-js-datepicker-toggle" type="button" aria-haspopup="dialog" aria-controls="${this.id}" aria-expanded="false">\n            <span class="govuk-visually-hidden">Choose date</span>\n            <svg width="32" height="24" focusable="false" class="moj-datepicker-icon" aria-hidden="true" role="img" viewBox="0 0 22 22">\n              <path\n                fill="currentColor"\n                fill-rule="evenodd"\n                clip-rule="evenodd"\n                d="M16.1333 2.93333H5.86668V4.4C5.86668 5.21002 5.21003 5.86667 4.40002 5.86667C3.59 5.86667 2.93335 5.21002 2.93335 4.4V2.93333H2C0.895431 2.93333 0 3.82877 0 4.93334V19.2667C0 20.3712 0.89543 21.2667 2 21.2667H20C21.1046 21.2667 22 20.3712 22 19.2667V4.93333C22 3.82876 21.1046 2.93333 20 2.93333H19.0667V4.4C19.0667 5.21002 18.41 5.86667 17.6 5.86667C16.79 5.86667 16.1333 5.21002 16.1333 4.4V2.93333ZM20.5333 8.06667H1.46665V18.8C1.46665 19.3523 1.91436 19.8 2.46665 19.8H19.5333C20.0856 19.8 20.5333 19.3523 20.5333 18.8V8.06667Z"\n              ></path>\n              <rect x="3.66669" width="1.46667" height="5.13333" rx="0.733333" fill="currentColor"></rect>\n              <rect x="16.8667" width="1.46667" height="5.13333" rx="0.733333" fill="currentColor"></rect>\n            </svg>\n          </button>`
  }

  dialogTemplate(t) {
    return `<div class="moj-datepicker__dialog-header">\n            <div class="moj-datepicker__dialog-navbuttons">\n              <button class="moj-datepicker__button moj-js-datepicker-prev-year">\n                <span class="govuk-visually-hidden">Previous year</span>\n                <svg width="44" height="40" viewBox="0 0 44 40" fill="none" fill="none" focusable="false" aria-hidden="true" role="img">\n                  <path fill-rule="evenodd" clip-rule="evenodd" d="M23.1643 20L28.9572 14.2071L27.5429 12.7929L20.3358 20L27.5429 27.2071L28.9572 25.7929L23.1643 20Z" fill="currentColor"/>\n                  <path fill-rule="evenodd" clip-rule="evenodd" d="M17.1643 20L22.9572 14.2071L21.5429 12.7929L14.3358 20L21.5429 27.2071L22.9572 25.7929L17.1643 20Z" fill="currentColor"/>\n                </svg>\n              </button>\n\n              <button class="moj-datepicker__button moj-js-datepicker-prev-month">\n                <span class="govuk-visually-hidden">Previous month</span>\n                <svg width="44" height="40" viewBox="0 0 44 40" fill="none" focusable="false" aria-hidden="true" role="img">\n                  <path fill-rule="evenodd" clip-rule="evenodd" d="M20.5729 20L25.7865 14.2071L24.5137 12.7929L18.0273 20L24.5137 27.2071L25.7865 25.7929L20.5729 20Z" fill="currentColor"/>\n                </svg>\n              </button>\n            </div>\n\n            <h2 id="${t}" class="moj-datepicker__dialog-title moj-js-datepicker-month-year" aria-live="polite">June 2020</h2>\n\n            <div class="moj-datepicker__dialog-navbuttons">\n              <button class="moj-datepicker__button moj-js-datepicker-next-month">\n                <span class="govuk-visually-hidden">Next month</span>\n                <svg width="44" height="40" viewBox="0 0 44 40" fill="none"  focusable="false" aria-hidden="true" role="img">\n                  <path fill-rule="evenodd" clip-rule="evenodd" d="M23.4271 20L18.2135 14.2071L19.4863 12.7929L25.9727 20L19.4863 27.2071L18.2135 25.7929L23.4271 20Z" fill="currentColor"/>\n                </svg>\n              </button>\n\n              <button class="moj-datepicker__button moj-js-datepicker-next-year">\n                <span class="govuk-visually-hidden">Next year</span>\n                <svg width="44" height="40" viewBox="0 0 44 40" fill="none" fill="none" focusable="false" aria-hidden="true" role="img">\n                  <path fill-rule="evenodd" clip-rule="evenodd" d="M20.8357 20L15.0428 14.2071L16.4571 12.7929L23.6642 20L16.4571 27.2071L15.0428 25.7929L20.8357 20Z" fill="currentColor"/>\n                  <path fill-rule="evenodd" clip-rule="evenodd" d="M26.8357 20L21.0428 14.2071L22.4571 12.7929L29.6642 20L22.4571 27.2071L21.0428 25.7929L26.8357 20Z" fill="currentColor"/>\n                </svg>\n              </button>\n            </div>\n          </div>\n\n          <table class="moj-datepicker__calendar moj-js-datepicker-grid" role="grid" aria-labelledby="${t}">\n            <thead>\n              <tr></tr>\n            </thead>\n\n            <tbody></tbody>\n          </table>\n\n          <div class="govuk-button-group">\n            <button type="button" class="govuk-button moj-js-datepicker-ok">Select</button>\n            <button type="button" class="govuk-button govuk-button--secondary moj-js-datepicker-cancel">Close</button>\n          </div>`
  }

  createCalendarHeaders() {
    this.dayLabels.forEach((t => {
      const e = `<th scope="col"><span aria-hidden="true">${t.substring(0,
          3)}</span><span class="govuk-visually-hidden">${t}</span></th>`;
      this.$dialog.querySelector("thead > tr").insertAdjacentHTML("beforeend",
          e)
    }))
  }

  leadingZeros(t, e = 2) {
    let o = t.toString();
    for (; o.length < e;) {
      o = `0${o}`;
    }
    return o
  }

  setOptions() {
    this.setMinAndMaxDatesOnCalendar(), this.setExcludedDates(), this.setExcludedDays(), this.setWeekStartDay()
  }

  setMinAndMaxDatesOnCalendar() {
    this.config.minDate && (this.minDate = this.formattedDateFromString(
        this.config.minDate, null), this.minDate && this.currentDate
    < this.minDate && (this.currentDate = this.minDate)), this.config.maxDate
    && (this.maxDate = this.formattedDateFromString(this.config.maxDate,
        null), this.maxDate && this.currentDate > this.maxDate
    && (this.currentDate = this.maxDate))
  }

  setExcludedDates() {
    this.config.excludedDates
    && (this.excludedDates = this.config.excludedDates.replace(/\s+/,
        " ").split(" ").map((t => t.includes("-") ? this.parseDateRangeString(t)
        : [this.formattedDateFromString(t)])).reduce(
        ((t, e) => t.concat(e))).filter((t => t)))
  }

  parseDateRangeString(t) {
    const e = [], [o, s] = t.split("-").map(
        (t => this.formattedDateFromString(t, null)));
    if (o && s) {
      const t = new Date(o.getTime());
      for (; t <= s;) {
        e.push(new Date(t)), t.setDate(t.getDate() + 1)
      }
    }
    return e
  }

  setExcludedDays() {
    if (this.config.excludedDays) {
      const t = this.dayLabels.map((t => t.toLowerCase()));
      "monday" === this.config.weekStartDay && t.unshift(
          t.pop()), this.excludedDays = this.config.excludedDays.replace(/\s+/,
          " ").toLowerCase().split(" ").map((e => t.indexOf(e))).filter(
          (t => -1 !== t))
    }
  }

  setWeekStartDay() {
    const t = this.config.weekStartDay;
    t && "sunday" === t.toLowerCase()
        ? (this.config.weekStartDay = "sunday", this.dayLabels.unshift(
            this.dayLabels.pop())) : this.config.weekStartDay = "monday"
  }

  isExcludedDate(t) {
    if (this.minDate && this.minDate > t) {
      return !0;
    }
    if (this.maxDate && this.maxDate < t) {
      return !0;
    }
    for (const e of this.excludedDates) {
      if (t.toDateString()
          === e.toDateString()) {
        return !0;
      }
    }
    return !!this.excludedDays.includes(t.getDay())
  }

  formattedDateFromString(t, e = new Date) {
    let o = null;
    const s = /(\d{1,2})([-/,. ])(\d{1,2})\2(\d{4})/;
    if (!s.test(t)) {
      return e;
    }
    const n = s.exec(t), i = n[1], r = n[3], a = n[4];
    return o = new Date(`${a}-${r}-${i}`), o instanceof Date && Number.isFinite(
        o.getTime()) ? o : e
  }

  formattedDateFromDate(t) {
    return this.config.leadingZeros ? `${this.leadingZeros(
            t.getDate())}/${this.leadingZeros(t.getMonth() + 1)}/${t.getFullYear()}`
        : `${t.getDate()}/${t.getMonth() + 1}/${t.getFullYear()}`
  }

  formattedDateHuman(t) {
    return `${this.dayLabels[(t.getDay() + 6)
    % 7]} ${t.getDate()} ${this.monthLabels[t.getMonth()]} ${t.getFullYear()}`
  }

  backgroundClick(t) {
    this.isOpen() && t.target instanceof Node && !this.$dialog.contains(
        t.target) && !this.$input.contains(t.target)
    && !this.$calendarButton.contains(t.target)
    && (t.preventDefault(), this.closeDialog())
  }

  firstButtonKeydown(t) {
    "Tab" === t.key && t.shiftKey
    && (this.$lastButtonInDialog.focus(), t.preventDefault())
  }

  lastButtonKeydown(t) {
    "Tab" !== t.key || t.shiftKey
    || (this.$firstButtonInDialog.focus(), t.preventDefault())
  }

  updateCalendar() {
    this.$dialogTitle.innerHTML = `${this.monthLabels[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
    const t = this.currentDate, e = new Date(t.getFullYear(), t.getMonth(), 1);
    let o;
    o = "monday" === this.config.weekStartDay ? 0 === e.getDay() ? 6
        : e.getDay() - 1 : e.getDay(), e.setDate(e.getDate() - o);
    const s = new Date(e);
    for (const n of this.calendarDays) {
      const e = s.getMonth() !== t.getMonth(), o = this.isExcludedDate(s);
      n.update(s, e, o), s.setDate(s.getDate() + 1)
    }
  }

  setCurrentDate(t = !0) {
    const {currentDate: e} = this;
    if (this.calendarDays.forEach((o => {
      o.$button.classList.add(
          "moj-datepicker__button"), o.$button.classList.add(
          "moj-datepicker__calendar-day"), o.$button.setAttribute("tabindex",
          "-1"), o.$button.classList.remove(this.selectedDayButtonClass);
      const s = o.date;
      s.setHours(0, 0, 0, 0);
      const n = new Date;
      n.setHours(0, 0, 0, 0), s.getTime() === e.getTime() && t
      && (o.$button.setAttribute("tabindex",
          "0"), o.$button.focus(), o.$button.classList.add(
          this.selectedDayButtonClass)), this.inputDate && s.getTime()
      === this.inputDate.getTime() ? (o.$button.classList.add(
          this.currentDayButtonClass), o.$button.setAttribute("aria-current",
          "date")) : (o.$button.classList.remove(
          this.currentDayButtonClass), o.$button.removeAttribute(
          "aria-current")), s.getTime() === n.getTime()
          ? o.$button.classList.add(this.todayButtonClass)
          : o.$button.classList.remove(this.todayButtonClass)
    })), !t) {
      const t = this.calendarDays.filter(
          (t => "block" === window.getComputedStyle(t.$button).display
              && !t.$button.disabled));
      t[0].$button.setAttribute("tabindex", "0"), this.currentDate = t[0].date
    }
  }

  selectDate(t) {
    if (this.isExcludedDate(t)) {
      return;
    }
    this.$calendarButton.querySelector(
        "span").innerText = `Choose date. Selected date is ${this.formattedDateHuman(
        t)}`, this.$input.value = this.formattedDateFromDate(t);
    const e = new Event("change", {bubbles: !0, cancelable: !0});
    this.$input.dispatchEvent(e), this.closeDialog()
  }

  isOpen() {
    return this.$dialog.classList.contains("moj-datepicker__dialog--open")
  }

  toggleDialog(t) {
    t.preventDefault(), this.isOpen() ? this.closeDialog()
        : (this.setMinAndMaxDatesOnCalendar(), this.openDialog())
  }

  openDialog() {
    this.$dialog.hidden = !1, this.$dialog.classList.add(
        "moj-datepicker__dialog--open"), this.$calendarButton.setAttribute(
        "aria-expanded", "true"), this.$input.offsetWidth
    > this.$dialog.offsetWidth
    && (this.$dialog.style.right = "0px"), this.$dialog.style.top = `${this.$input.offsetHeight
    + 3}px`, this.inputDate = this.formattedDateFromString(
        this.$input.value), this.currentDate = this.inputDate, this.currentDate.setHours(
        0, 0, 0, 0), this.updateCalendar(), this.setCurrentDate()
  }

  closeDialog() {
    this.$dialog.hidden = !0, this.$dialog.classList.remove(
        "moj-datepicker__dialog--open"), this.$calendarButton.setAttribute(
        "aria-expanded", "false"), this.$calendarButton.focus()
  }

  goToDate(t, e) {
    const o = this.currentDate;
    this.currentDate = t, o.getMonth() === this.currentDate.getMonth()
    && o.getFullYear() === this.currentDate.getFullYear()
    || this.updateCalendar(), this.setCurrentDate(e)
  }

  focusNextDay() {
    const t = new Date(this.currentDate);
    t.setDate(t.getDate() + 1), this.goToDate(t)
  }

  focusPreviousDay() {
    const t = new Date(this.currentDate);
    t.setDate(t.getDate() - 1), this.goToDate(t)
  }

  focusNextWeek() {
    const t = new Date(this.currentDate);
    t.setDate(t.getDate() + 7), this.goToDate(t)
  }

  focusPreviousWeek() {
    const t = new Date(this.currentDate);
    t.setDate(t.getDate() - 7), this.goToDate(t)
  }

  focusFirstDayOfWeek() {
    const t = new Date(this.currentDate),
        e = "sunday" === this.config.weekStartDay ? 0 : 1, o = t.getDay(),
        s = o >= e ? o - e : 6 - o;
    t.setDate(t.getDate() - s), t.setHours(0, 0, 0, 0), this.goToDate(t)
  }

  focusLastDayOfWeek() {
    const t = new Date(this.currentDate),
        e = "sunday" === this.config.weekStartDay ? 6 : 0, o = t.getDay(),
        s = o <= e ? e - o : 7 - o;
    t.setDate(t.getDate() + s), t.setHours(0, 0, 0, 0), this.goToDate(t)
  }

  focusNextMonth(t, e = !0) {
    t.preventDefault();
    const o = new Date(this.currentDate);
    o.setMonth(o.getMonth() + 1, 1), this.goToDate(o, e)
  }

  focusPreviousMonth(t, e = !0) {
    t.preventDefault();
    const o = new Date(this.currentDate);
    o.setMonth(o.getMonth() - 1, 1), this.goToDate(o, e)
  }

  focusNextYear(t, e = !0) {
    t.preventDefault();
    const o = new Date(this.currentDate);
    o.setFullYear(o.getFullYear() + 1, o.getMonth(), 1), this.goToDate(o, e)
  }

  focusPreviousYear(t, e = !0) {
    t.preventDefault();
    const o = new Date(this.currentDate);
    o.setFullYear(o.getFullYear() - 1, o.getMonth(), 1), this.goToDate(o, e)
  }
}

DatePicker.moduleName = "moj-date-picker", DatePicker.defaults = Object.freeze({
  leadingZeros: !1,
  weekStartDay: "monday",
  input: {selector: ".moj-js-datepicker-input"}
}), DatePicker.schema = Object.freeze({
  properties: {
    excludedDates: {type: "string"},
    excludedDays: {type: "string"},
    leadingZeros: {type: "boolean"},
    maxDate: {type: "string"},
    minDate: {type: "string"},
    weekStartDay: {type: "string"},
    input: {type: "object"}
  }
});

class DSCalendarDay {
  constructor(t, e, o, s, n) {
    this.index = e, this.row = o, this.column = s, this.$button = t, this.picker = n, this.date = new Date, this.$button.addEventListener(
        "keydown", this.keyPress.bind(this)), this.$button.addEventListener(
        "click", this.click.bind(this))
  }

  update(t, e, o) {
    const s = t.getDate();
    let n = this.picker.formattedDateHuman(t);
    o ? (this.$button.setAttribute("aria-disabled",
        "true"), n = `Excluded date, ${n}`) : this.$button.removeAttribute(
        "aria-disabled"), this.$button.style.display = e ? "none"
        : "block", this.$button.setAttribute("data-testid",
        this.picker.formattedDateFromDate(
            t)), this.$button.innerHTML = `<span class="govuk-visually-hidden">${n}</span><span aria-hidden="true">${s}</span>`, this.date = new Date(
        t)
  }

  click(t) {
    this.picker.goToDate(this.date), this.picker.selectDate(
        this.date), t.stopPropagation(), t.preventDefault()
  }

  keyPress(t) {
    let e = !0;
    switch (t.key) {
      case"ArrowLeft":
        this.picker.focusPreviousDay();
        break;
      case"ArrowRight":
        this.picker.focusNextDay();
        break;
      case"ArrowUp":
        this.picker.focusPreviousWeek();
        break;
      case"ArrowDown":
        this.picker.focusNextWeek();
        break;
      case"Home":
        this.picker.focusFirstDayOfWeek();
        break;
      case"End":
        this.picker.focusLastDayOfWeek();
        break;
      case"PageUp":
        t.shiftKey ? this.picker.focusPreviousYear(t)
            : this.picker.focusPreviousMonth(t);
        break;
      case"PageDown":
        t.shiftKey ? this.picker.focusNextYear(t) : this.picker.focusNextMonth(
            t);
        break;
      default:
        e = !1
    }
    e && (t.preventDefault(), t.stopPropagation())
  }
}

class FilterToggleButton extends ConfigurableComponent {
  constructor(t, e = {}) {
    var o, s;
    super(t, e);
    const n = null != (o = this.config.toggleButtonContainer.element) ? o
            : document.querySelector(this.config.toggleButtonContainer.selector),
        i = null != (s = this.config.closeButtonContainer.element) ? s
            : this.$root.querySelector(
                this.config.closeButtonContainer.selector);
    if (!(n instanceof HTMLElement && i instanceof HTMLElement)) {
      return this;
    }
    this.$toggleButtonContainer = n, this.$closeButtonContainer = i, this.createToggleButton(), this.setupResponsiveChecks(), this.$root.setAttribute(
        "tabindex", "-1"), this.config.startHidden && this.hideMenu()
  }

  setupResponsiveChecks() {
    this.mq = window.matchMedia(
        this.config.bigModeMediaQuery), this.mq.addListener(
        this.checkMode.bind(this)), this.checkMode()
  }

  createToggleButton() {
    this.$menuButton = document.createElement(
        "button"), this.$menuButton.setAttribute("type",
        "button"), this.$menuButton.setAttribute("aria-haspopup",
        "true"), this.$menuButton.setAttribute("aria-expanded",
        "false"), this.$menuButton.className = `govuk-button ${this.config.toggleButton.classes}`, this.$menuButton.textContent = this.config.toggleButton.showText, this.$menuButton.addEventListener(
        "click",
        this.onMenuButtonClick.bind(this)), this.$toggleButtonContainer.append(
        this.$menuButton)
  }

  checkMode() {
    this.mq.matches ? this.enableBigMode() : this.enableSmallMode()
  }

  enableBigMode() {
    this.showMenu(), this.removeCloseButton()
  }

  enableSmallMode() {
    this.hideMenu(), this.addCloseButton()
  }

  addCloseButton() {
    this.$closeButton = document.createElement(
        "button"), this.$closeButton.setAttribute("type",
        "button"), this.$closeButton.className = this.config.closeButton.classes, this.$closeButton.textContent = this.config.closeButton.text, this.$closeButton.addEventListener(
        "click",
        this.onCloseClick.bind(this)), this.$closeButtonContainer.append(
        this.$closeButton)
  }

  onCloseClick() {
    this.hideMenu(), this.$menuButton.focus()
  }

  removeCloseButton() {
    this.$closeButton && (this.$closeButton.remove(), this.$closeButton = null)
  }

  hideMenu() {
    this.$menuButton.setAttribute("aria-expanded",
        "false"), this.$root.classList.add(
        "moj-js-hidden"), this.$menuButton.textContent = this.config.toggleButton.showText
  }

  showMenu() {
    this.$menuButton.setAttribute("aria-expanded",
        "true"), this.$root.classList.remove(
        "moj-js-hidden"), this.$menuButton.textContent = this.config.toggleButton.hideText
  }

  onMenuButtonClick() {
    this.toggle()
  }

  toggle() {
    "false" === this.$menuButton.getAttribute("aria-expanded")
        ? (this.showMenu(), this.$root.focus()) : this.hideMenu()
  }
}

FilterToggleButton.moduleName = "moj-filter", FilterToggleButton.defaults = Object.freeze(
    {
      bigModeMediaQuery: "(min-width: 48.0625em)",
      startHidden: !0,
      toggleButton: {
        showText: "Show filter",
        hideText: "Hide filter",
        classes: "govuk-button--secondary"
      },
      toggleButtonContainer: {selector: ".moj-action-bar__filter"},
      closeButton: {text: "Close", classes: "moj-filter__close"},
      closeButtonContainer: {selector: ".moj-filter__header-action"}
    }), FilterToggleButton.schema = Object.freeze({
  properties: {
    bigModeMediaQuery: {type: "string"},
    startHidden: {type: "boolean"},
    toggleButton: {type: "object"},
    toggleButtonContainer: {type: "object"},
    closeButton: {type: "object"},
    closeButtonContainer: {type: "object"}
  }
});

class FormValidator extends ConfigurableComponent {
  constructor(t, e = {}) {
    super(t, e);
    const o = this.config.summary.element || document.querySelector(
        this.config.summary.selector);
    if (!(o && o instanceof HTMLElement)) {
      return this;
    }
    this.$summary = o, this.errors = [], this.validators = [], this.originalTitle = document.title, this.$root.addEventListener(
        "submit", this.onSubmit.bind(this))
  }

  escapeHtml(t = "") {
    return String(t).replace(/[&<>"'`=/]/g, (t => FormValidator.entityMap[t]))
  }

  resetTitle() {
    document.title = this.originalTitle
  }

  updateTitle() {
    document.title = `${this.errors.length} errors - ${document.title}`
  }

  showSummary() {
    this.$summary.innerHTML = this.getSummaryHtml(), this.$summary.classList.remove(
        "moj-hidden"), this.$summary.setAttribute("aria-labelledby",
        "errorSummary-heading"), this.$summary.focus()
  }

  getSummaryHtml() {
    let t = '<h2 id="error-summary-title" class="govuk-error-summary__title">There is a problem</h2>';
    t += '<div class="govuk-error-summary__body">', t += '<ul class="govuk-list govuk-error-summary__list">';
    for (const e of this.errors) {
      t += "<li>", t += `<a href="#${this.escapeHtml(
          e.fieldName)}">`, t += this.escapeHtml(
          e.message), t += "</a>", t += "</li>";
    }
    return t += "</ul>", t += "</div>", t
  }

  hideSummary() {
    this.$summary.classList.add("moj-hidden"), this.$summary.removeAttribute(
        "aria-labelledby")
  }

  onSubmit(t) {
    this.removeInlineErrors(), this.hideSummary(), this.resetTitle(), this.validate()
    || (t.preventDefault(), this.updateTitle(), this.showSummary(), this.showInlineErrors())
  }

  showInlineErrors() {
    for (const t of this.errors) {
      this.showInlineError(t)
    }
  }

  showInlineError(t) {
    const e = document.createElement("span");
    e.id = `${t.fieldName}-error`, e.classList.add(
        "govuk-error-message"), e.innerHTML = this.escapeHtml(t.message);
    const o = document.querySelector(`#${t.fieldName}`),
        s = o.closest(".govuk-fieldset"),
        n = (s || o).closest(".govuk-form-group"), i = n.querySelector("label"),
        r = n.querySelector("legend");
    n.classList.add("govuk-form-group--error"), s && r ? (r.after(
        e), n.setAttribute("aria-invalid", "true"), addAttributeValue(s,
        "aria-describedby", e.id)) : i && o && (i.after(e), o.setAttribute(
        "aria-invalid", "true"), addAttributeValue(o, "aria-describedby", e.id))
  }

  removeInlineErrors() {
    for (const t of this.errors) {
      this.removeInlineError(t)
    }
  }

  removeInlineError(t) {
    const e = document.querySelector(`#${t.fieldName}-error`),
        o = document.querySelector(`#${t.fieldName}`),
        s = o.closest(".govuk-fieldset"),
        n = (s || o).closest(".govuk-form-group"), i = n.querySelector("label"),
        r = n.querySelector("legend");
    e.remove(), n.classList.remove("govuk-form-group--error"), s && r
        ? (n.removeAttribute("aria-invalid"), removeAttributeValue(s,
            "aria-describedby", e.id)) : i && o && (o.removeAttribute(
        "aria-invalid"), removeAttributeValue(o, "aria-describedby", e.id))
  }

  addValidator(t, e) {
    this.validators.push(
        {fieldName: t, rules: e, field: this.$root.elements.namedItem(t)})
  }

  validate() {
    this.errors = [];
    let t, e, o = null, s = !0;
    for (t = 0; t < this.validators.length;
        t++) {
      for (o = this.validators[t], e = 0; e < o.rules.length; e++) {
        if (s = o.rules[e].method(o.field, o.rules[e].params), "boolean"
        == typeof s && !s) {
          this.errors.push(
              {fieldName: o.fieldName, message: o.rules[e].message});
          break
        }
        if ("string" == typeof s) {
          this.errors.push({fieldName: s, message: o.rules[e].message});
          break
        }
      }
    }
    return 0 === this.errors.length
  }
}

FormValidator.entityMap = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
  "/": "&#x2F;",
  "`": "&#x60;",
  "=": "&#x3D;"
}, FormValidator.moduleName = "moj-form-validator", FormValidator.defaults = Object.freeze(
    {summary: {selector: ".govuk-error-summary"}}), FormValidator.schema = Object.freeze(
    {properties: {summary: {type: "object"}}});

class MultiFileUpload extends ConfigurableComponent {
  constructor(t, e = {}) {
    var o;
    if (super(t, e), !MultiFileUpload.isSupported()) {
      return this;
    }
    const s = null != (o = this.config.feedbackContainer.element) ? o
        : this.$root.querySelector(this.config.feedbackContainer.selector);
    if (!(s && s instanceof HTMLElement)) {
      return this;
    }
    this.$feedbackContainer = s, this.setupFileInput(), this.setupDropzone(), this.setupLabel(), this.setupStatusBox(), this.$root.addEventListener(
        "click", this.onFileDeleteClick.bind(this)), this.$root.classList.add(
        "moj-multi-file-upload--enhanced")
  }

  setupDropzone() {
    this.$dropzone = document.createElement(
        "div"), this.$dropzone.classList.add(
        "moj-multi-file-upload__dropzone"), this.$dropzone.addEventListener(
        "dragover",
        this.onDragOver.bind(this)), this.$dropzone.addEventListener(
        "dragleave",
        this.onDragLeave.bind(this)), this.$dropzone.addEventListener("drop",
        this.onDrop.bind(this)), this.$fileInput.replaceWith(
        this.$dropzone), this.$dropzone.appendChild(this.$fileInput)
  }

  setupLabel() {
    const t = document.createElement("label");
    t.setAttribute("for", this.$fileInput.id), t.classList.add("govuk-button",
        "govuk-button--secondary"), t.textContent = this.config.dropzoneButtonText;
    const e = document.createElement("p");
    e.classList.add(
        "govuk-body"), e.textContent = this.config.dropzoneHintText, this.$label = t, this.$dropzone.append(
        e), this.$dropzone.append(t)
  }

  setupFileInput() {
    this.$fileInput = this.$root.querySelector(
        ".moj-multi-file-upload__input"), this.$fileInput.addEventListener(
        "change",
        this.onFileChange.bind(this)), this.$fileInput.addEventListener("focus",
        this.onFileFocus.bind(this)), this.$fileInput.addEventListener("blur",
        this.onFileBlur.bind(this))
  }

  setupStatusBox() {
    this.$status = document.createElement("div"), this.$status.classList.add(
        "govuk-visually-hidden"), this.$status.setAttribute("aria-live",
        "polite"), this.$status.setAttribute("role",
        "status"), this.$dropzone.append(this.$status)
  }

  onDragOver(t) {
    t.preventDefault(), this.$dropzone.classList.add(
        "moj-multi-file-upload--dragover")
  }

  onDragLeave() {
    this.$dropzone.classList.remove("moj-multi-file-upload--dragover")
  }

  onDrop(t) {
    t.preventDefault(), this.$dropzone.classList.remove(
        "moj-multi-file-upload--dragover"), this.$feedbackContainer.classList.remove(
        "moj-hidden"), this.$status.textContent = this.config.uploadStatusText, this.uploadFiles(
        t.dataTransfer.files)
  }

  uploadFiles(t) {
    for (const e of Array.from(t)) {
      this.uploadFile(e)
    }
  }

  onFileChange() {
    this.$feedbackContainer.classList.remove(
        "moj-hidden"), this.$status.textContent = this.config.uploadStatusText, this.uploadFiles(
        this.$fileInput.files);
    const t = this.$fileInput.cloneNode(!0);
    t && t instanceof HTMLInputElement
    && (t.value = "", this.$fileInput.replaceWith(
        t), this.setupFileInput(), this.$fileInput.focus())
  }

  onFileFocus() {
    this.$label.classList.add("moj-multi-file-upload--focused")
  }

  onFileBlur() {
    this.$label.classList.remove("moj-multi-file-upload--focused")
  }

  getSuccessHtml(t) {
    return `<span class="moj-multi-file-upload__success"> <svg class="moj-banner__icon" fill="currentColor" role="presentation" focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 25" height="25" width="25"><path d="M25,6.2L8.7,23.2L0,14.1l4-4.2l4.7,4.9L21,2L25,6.2z"/></svg>${t.messageHtml}</span>`
  }

  getErrorHtml(t) {
    return `<span class="moj-multi-file-upload__error"> <svg class="moj-banner__icon" fill="currentColor" role="presentation" focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 25" height="25" width="25"><path d="M13.6,15.4h-2.3v-4.5h2.3V15.4z M13.6,19.8h-2.3v-2.2h2.3V19.8z M0,23.2h25L12.5,2L0,23.2z"/></svg>${t.message}</span>`
  }

  getFileRow(t) {
    const e = document.createElement("div");
    return e.classList.add("govuk-summary-list__row",
        "moj-multi-file-upload__row"), e.innerHTML = `\n    <div class="govuk-summary-list__value moj-multi-file-upload__message">\n      <span class="moj-multi-file-upload__filename">${t.name}</span>\n      <span class="moj-multi-file-upload__progress">0%</span>\n    </div>\n    <div class="govuk-summary-list__actions moj-multi-file-upload__actions"></div>\n  `, e
  }

  getDeleteButton(t) {
    const e = document.createElement("button");
    return e.setAttribute("type", "button"), e.setAttribute("name",
        "delete"), e.setAttribute("value", t.filename), e.classList.add(
        "moj-multi-file-upload__delete", "govuk-button",
        "govuk-button--secondary",
        "govuk-!-margin-bottom-0"), e.innerHTML = `Delete <span class="govuk-visually-hidden">${t.originalname}</span>`, e
  }

  uploadFile(t) {
    this.config.hooks.entryHook(this, t);
    const e = this.getFileRow(t),
        o = e.querySelector(".moj-multi-file-upload__message"),
        s = e.querySelector(".moj-multi-file-upload__actions"),
        n = e.querySelector(".moj-multi-file-upload__progress"),
        i = new FormData;
    i.append("documents", t), this.$feedbackContainer.querySelector(
        ".moj-multi-file-upload__list").append(e);
    const r = new XMLHttpRequest, onError = () => {
      const e = new Error(
          r.response && "error" in r.response ? r.response.error.message
              : r.statusText || "Upload failed");
      o.innerHTML = this.getErrorHtml(
          e), this.$status.textContent = e.message, this.config.hooks.errorHook(
          this, t, r, r.responseText, e)
    };
    r.addEventListener("load", (() => {
      if (r.status < 200 || r.status >= 300 || !("success"
          in r.response)) {
        return onError();
      }
      o.innerHTML = this.getSuccessHtml(
          r.response.success), this.$status.textContent = r.response.success.messageText, s.append(
          this.getDeleteButton(r.response.file)), this.config.hooks.exitHook(
          this, t, r, r.responseText)
    })), r.addEventListener("error", onError), r.upload.addEventListener(
        "progress", (t => {
          if (!t.lengthComputable) {
            return;
          }
          const e = Math.round(t.loaded / t.total * 100);
          n.textContent = ` ${e}%`
        })), r.open("POST",
        this.config.uploadUrl), r.responseType = "json", r.send(i)
  }

  onFileDeleteClick(t) {
    const e = t.target;
    if (!(e && e instanceof HTMLButtonElement && e.classList.contains(
        "moj-multi-file-upload__delete"))) {
      return;
    }
    t.preventDefault();
    const o = new XMLHttpRequest;
    o.addEventListener("load", (() => {
      if (o.status < 200 || o.status >= 300) {
        return;
      }
      const t = Array.from(this.$feedbackContainer.querySelectorAll(
          ".moj-multi-file-upload__row"));
      1 === t.length && this.$feedbackContainer.classList.add("moj-hidden");
      const s = t.find((t => t.contains(e)));
      s && s.remove(), this.config.hooks.deleteHook(this, void 0, o,
          o.responseText)
    })), o.open("POST", this.config.deleteUrl), o.setRequestHeader(
        "Content-Type", "application/json"), o.responseType = "json", o.send(
        JSON.stringify({[e.name]: e.value}))
  }

  static isSupported() {
    return this.isDragAndDropSupported() && this.isFormDataSupported()
        && this.isFileApiSupported()
  }

  static isDragAndDropSupported() {
    return void 0 !== document.createElement("div").ondrop
  }

  static isFormDataSupported() {
    return "function" == typeof FormData
  }

  static isFileApiSupported() {
    const t = document.createElement("input");
    return t.type = "file", void 0 !== t.files
  }
}

MultiFileUpload.moduleName = "moj-multi-file-upload", MultiFileUpload.defaults = Object.freeze(
    {
      uploadStatusText: "Uploading files, please wait",
      dropzoneHintText: "Drag and drop files here or",
      dropzoneButtonText: "Choose files",
      feedbackContainer: {selector: ".moj-multi-file__uploaded-files"},
      hooks: {
        entryHook: () => {
        }, exitHook: () => {
        }, errorHook: () => {
        }, deleteHook: () => {
        }
      }
    }), MultiFileUpload.schema = Object.freeze({
  properties: {
    uploadUrl: {type: "string"},
    deleteUrl: {type: "string"},
    uploadStatusText: {type: "string"},
    dropzoneHintText: {type: "string"},
    dropzoneButtonText: {type: "string"},
    feedbackContainer: {type: "object"},
    hooks: {type: "object"}
  }
});

class MultiSelect extends ConfigurableComponent {
  constructor(t, e = {}) {
    var o;
    super(t, e);
    const s = this.$root.querySelector(`#${this.config.idPrefix}select-all`),
        n = null != (o = this.config.checkboxes.items) ? o
            : this.$root.querySelectorAll(this.config.checkboxes.selector);
    if (!(s && s instanceof HTMLElement && n.length)) {
      return this;
    }
    this.setupToggle(
        this.config.idPrefix), this.$toggleButton = this.$toggle.querySelector(
        "input"), this.$toggleButton.addEventListener("click",
        this.onButtonClick.bind(
            this)), this.$container = s, this.$container.append(
        this.$toggle), this.$checkboxes = Array.from(
        n), this.$checkboxes.forEach((t => t.addEventListener("click",
        this.onCheckboxClick.bind(this)))), this.checked = e.checked || !1
  }

  setupToggle(t = "") {
    const e = `${t}checkboxes-all`, o = document.createElement("div"),
        s = document.createElement("label"),
        n = document.createElement("input"), i = document.createElement("span");
    o.classList.add("govuk-checkboxes__item", "govuk-checkboxes--small",
        "moj-multi-select__checkbox"), n.id = e, n.type = "checkbox", n.classList.add(
        "govuk-checkboxes__input"), s.setAttribute("for", e), s.classList.add(
        "govuk-label", "govuk-checkboxes__label",
        "moj-multi-select__toggle-label"), i.classList.add(
        "govuk-visually-hidden"), i.textContent = "Select all", s.append(
        i), o.append(n, s), this.$toggle = o
  }

  onButtonClick() {
    this.checked ? (this.uncheckAll(), this.$toggleButton.checked = !1)
        : (this.checkAll(), this.$toggleButton.checked = !0)
  }

  checkAll() {
    this.$checkboxes.forEach((t => {
      t.checked = !0
    })), this.checked = !0
  }

  uncheckAll() {
    this.$checkboxes.forEach((t => {
      t.checked = !1
    })), this.checked = !1
  }

  onCheckboxClick(t) {
    t.target instanceof HTMLInputElement && (t.target.checked
        ? this.$checkboxes.filter((t => t.checked)).length
        === this.$checkboxes.length
        && (this.$toggleButton.checked = !0, this.checked = !0)
        : (this.$toggleButton.checked = !1, this.checked = !1))
  }
}

MultiSelect.moduleName = "moj-multi-select", MultiSelect.defaults = Object.freeze(
    {
      idPrefix: "",
      checkboxes: {selector: "tbody input.govuk-checkboxes__input"}
    }), MultiSelect.schema = Object.freeze({
  properties: {
    idPrefix: {type: "string"},
    checked: {type: "boolean"},
    checkboxes: {type: "object"}
  }
});

class PasswordReveal extends Component {
  constructor(t) {
    super(t);
    const e = this.$root.querySelector(".govuk-input");
    if (!(e && e instanceof HTMLInputElement)) {
      return this;
    }
    this.$input = e, this.$input.setAttribute("spellcheck",
        "false"), this.createButton()
  }

  createButton() {
    this.$group = document.createElement(
        "div"), this.$button = document.createElement(
        "button"), this.$button.setAttribute("type",
        "button"), this.$root.classList.add(
        "moj-password-reveal"), this.$group.classList.add(
        "moj-password-reveal__wrapper"), this.$button.classList.add(
        "govuk-button", "govuk-button--secondary",
        "moj-password-reveal__button"), this.$button.innerHTML = 'Show <span class="govuk-visually-hidden">password</span>', this.$button.addEventListener(
        "click", this.onButtonClick.bind(this)), this.$group.append(this.$input,
        this.$button), this.$root.append(this.$group)
  }

  onButtonClick() {
    "password" === this.$input.type
        ? (this.$input.type = "text", this.$button.innerHTML = 'Hide <span class="govuk-visually-hidden">password</span>')
        : (this.$input.type = "password", this.$button.innerHTML = 'Show <span class="govuk-visually-hidden">password</span>')
  }
}

PasswordReveal.moduleName = "moj-password-reveal";

class RichTextEditor extends ConfigurableComponent {
  constructor(t, e = {}) {
    if (super(t, e), !RichTextEditor.isSupported()) {
      return this;
    }
    const o = this.$root.querySelector(".govuk-textarea");
    if (!(o && o instanceof HTMLTextAreaElement)) {
      return this;
    }
    this.$textarea = o, this.createToolbar(), this.hideDefault(), this.configureToolbar(), this.keys = {
      left: 37,
      right: 39,
      up: 38,
      down: 40
    }, this.$content.addEventListener("input",
        this.onEditorInput.bind(this)), this.$root.querySelector(
        "label").addEventListener("click",
        this.onLabelClick.bind(this)), this.$toolbar.addEventListener("keydown",
        this.onToolbarKeydown.bind(this))
  }

  onToolbarKeydown(t) {
    let e;
    switch (t.keyCode) {
      case this.keys.right:
      case this.keys.down:
        if (e = this.$buttons.find(
            (t => "0" === t.getAttribute("tabindex"))), e) {
          const t = e.nextElementSibling;
          t && t instanceof HTMLButtonElement && (t.focus(), e.setAttribute(
              "tabindex", "-1"), t.setAttribute("tabindex", "0"))
        }
        break;
      case this.keys.left:
      case this.keys.up:
        if (e = this.$buttons.find(
            (t => "0" === t.getAttribute("tabindex"))), e) {
          const t = e.previousElementSibling;
          t && t instanceof HTMLButtonElement && (t.focus(), e.setAttribute(
              "tabindex", "-1"), t.setAttribute("tabindex", "0"))
        }
    }
  }

  getToolbarHtml() {
    let t = "";
    return t += '<div class="moj-rich-text-editor__toolbar" role="toolbar">', this.config.toolbar.bold
    && (t += '<button class="moj-rich-text-editor__toolbar-button moj-rich-text-editor__toolbar-button--bold" type="button" data-command="bold"><span class="govuk-visually-hidden">Bold</span></button>'), this.config.toolbar.italic
    && (t += '<button class="moj-rich-text-editor__toolbar-button moj-rich-text-editor__toolbar-button--italic" type="button" data-command="italic"><span class="govuk-visually-hidden">Italic</span></button>'), this.config.toolbar.underline
    && (t += '<button class="moj-rich-text-editor__toolbar-button moj-rich-text-editor__toolbar-button--underline" type="button" data-command="underline"><span class="govuk-visually-hidden">Underline</span></button>'), this.config.toolbar.bullets
    && (t += '<button class="moj-rich-text-editor__toolbar-button moj-rich-text-editor__toolbar-button--unordered-list" type="button" data-command="insertUnorderedList"><span class="govuk-visually-hidden">Unordered list</span></button>'), this.config.toolbar.numbers
    && (t += '<button class="moj-rich-text-editor__toolbar-button moj-rich-text-editor__toolbar-button--ordered-list" type="button" data-command="insertOrderedList"><span class="govuk-visually-hidden">Ordered list</span></button>'), t += "</div>", t
  }

  getEnhancedHtml() {
    return `${this.getToolbarHtml()}<div class="govuk-textarea moj-rich-text-editor__content" contenteditable="true" spellcheck="false"></div>`
  }

  hideDefault() {
    this.$textarea.classList.add(
        "govuk-visually-hidden"), this.$textarea.setAttribute("aria-hidden",
        "true"), this.$textarea.setAttribute("tabindex", "-1")
  }

  createToolbar() {
    this.$toolbar = document.createElement(
        "div"), this.$toolbar.className = "moj-rich-text-editor", this.$toolbar.innerHTML = this.getEnhancedHtml(), this.$root.append(
        this.$toolbar), this.$content = this.$root.querySelector(
        ".moj-rich-text-editor__content"), this.$content.innerHTML = this.$textarea.value
  }

  configureToolbar() {
    this.$buttons = Array.from(this.$root.querySelectorAll(
        ".moj-rich-text-editor__toolbar-button")), this.$buttons.forEach(
        ((t, e) => {
          t.setAttribute("tabindex", e ? "-1" : "0"), t.addEventListener(
              "click", this.onButtonClick.bind(this))
        }))
  }

  onButtonClick(t) {
    t.currentTarget instanceof HTMLElement && document.execCommand(
        t.currentTarget.getAttribute("data-command"), !1, void 0)
  }

  getContent() {
    return this.$content.innerHTML
  }

  onEditorInput() {
    this.updateTextarea()
  }

  updateTextarea() {
    document.execCommand("defaultParagraphSeparator", !1,
        "p"), this.$textarea.value = this.getContent()
  }

  onLabelClick(t) {
    t.preventDefault(), this.$content.focus()
  }

  static isSupported() {
    return "contentEditable" in document.documentElement
  }
}

RichTextEditor.moduleName = "moj-rich-text-editor", RichTextEditor.defaults = Object.freeze(
    {
      toolbar: {
        bold: !1,
        italic: !1,
        underline: !1,
        bullets: !0,
        numbers: !0
      }
    }), RichTextEditor.schema = Object.freeze(
    {properties: {toolbar: {type: "object"}}});

class SearchToggle extends ConfigurableComponent {
  constructor(t, e = {}) {
    var o, s;
    super(t, e);
    const n = null != (o = this.config.searchContainer.element) ? o
            : this.$root.querySelector(this.config.searchContainer.selector),
        i = null != (s = this.config.toggleButtonContainer.element) ? s
            : this.$root.querySelector(
                this.config.toggleButtonContainer.selector);
    if (!(n && i && n instanceof HTMLElement && i
        instanceof HTMLElement)) {
      return this;
    }
    this.$searchContainer = n, this.$toggleButtonContainer = i;
    this.$toggleButton = document.createElement(
        "button"), this.$toggleButton.setAttribute("class",
        "moj-search-toggle__button"), this.$toggleButton.setAttribute("type",
        "button"), this.$toggleButton.setAttribute("aria-haspopup",
        "true"), this.$toggleButton.setAttribute("aria-expanded",
        "false"), this.$toggleButton.innerHTML = `${this.config.toggleButton.text} <svg viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="moj-search-toggle__button__icon"><path d="M7.433,12.5790048 C6.06762625,12.5808611 4.75763941,12.0392925 3.79217348,11.0738265 C2.82670755,10.1083606 2.28513891,8.79837375 2.28699522,7.433 C2.28513891,6.06762625 2.82670755,4.75763941 3.79217348,3.79217348 C4.75763941,2.82670755 6.06762625,2.28513891 7.433,2.28699522 C8.79837375,2.28513891 10.1083606,2.82670755 11.0738265,3.79217348 C12.0392925,4.75763941 12.5808611,6.06762625 12.5790048,7.433 C12.5808611,8.79837375 12.0392925,10.1083606 11.0738265,11.0738265 C10.1083606,12.0392925 8.79837375,12.5808611 7.433,12.5790048 L7.433,12.5790048 Z M14.293,12.579 L13.391,12.579 L13.071,12.269 C14.2300759,10.9245158 14.8671539,9.20813198 14.866,7.433 C14.866,3.32786745 11.5381325,-1.65045755e-15 7.433,-1.65045755e-15 C3.32786745,-1.65045755e-15 -1.65045755e-15,3.32786745 -1.65045755e-15,7.433 C-1.65045755e-15,11.5381325 3.32786745,14.866 7.433,14.866 C9.208604,14.8671159 10.9253982,14.2296624 12.27,13.07 L12.579,13.39 L12.579,14.294 L18.296,20 L20,18.296 L14.294,12.579 L14.293,12.579 Z"></path></svg>`, this.$toggleButton.addEventListener(
        "click", this.onToggleButtonClick.bind(
            this)), this.$toggleButtonContainer.append(
        this.$toggleButton), document.addEventListener("click",
        this.onDocumentClick.bind(this)), document.addEventListener("focusin",
        this.onDocumentClick.bind(this))
  }

  showMenu() {
    this.$toggleButton.setAttribute("aria-expanded",
        "true"), this.$searchContainer.classList.remove(
        "moj-js-hidden"), this.$searchContainer.querySelector("input").focus()
  }

  hideMenu() {
    this.$searchContainer.classList.add(
        "moj-js-hidden"), this.$toggleButton.setAttribute("aria-expanded",
        "false")
  }

  onToggleButtonClick() {
    "false" === this.$toggleButton.getAttribute("aria-expanded")
        ? this.showMenu() : this.hideMenu()
  }

  onDocumentClick(t) {
    t.target instanceof Node && !this.$toggleButtonContainer.contains(t.target)
    && !this.$searchContainer.contains(t.target) && this.hideMenu()
  }
}

SearchToggle.moduleName = "moj-search-toggle", SearchToggle.defaults = Object.freeze(
    {
      searchContainer: {selector: ".moj-search"},
      toggleButton: {text: "Search"},
      toggleButtonContainer: {selector: ".moj-search-toggle__toggle"}
    }), SearchToggle.schema = Object.freeze({
  properties: {
    searchContainer: {type: "object"},
    toggleButton: {type: "object"},
    toggleButtonContainer: {type: "object"}
  }
});

class SortableTable extends ConfigurableComponent {
  constructor(t, e = {}) {
    super(t, e);
    const o = null == t ? void 0 : t.querySelector("thead"),
        s = null == t ? void 0 : t.querySelector("tbody");
    if (!o || !s) {
      return this;
    }
    this.$head = o, this.$body = s, this.$caption = this.$root.querySelector(
        "caption"), this.$upArrow = '<svg width="22" height="22" focusable="false" aria-hidden="true" role="img" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">\n<path d="M6.5625 15.5L11 6.63125L15.4375 15.5H6.5625Z" fill="currentColor"/>\n</svg>', this.$downArrow = '<svg width="22" height="22" focusable="false" aria-hidden="true" role="img" vviewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">\n<path d="M15.4375 7L11 15.8687L6.5625 7L15.4375 7Z" fill="currentColor"/>\n</svg>', this.$upDownArrow = '<svg width="22" height="22" focusable="false" aria-hidden="true" role="img" vviewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">\n<path d="M8.1875 9.5L10.9609 3.95703L13.7344 9.5H8.1875Z" fill="currentColor"/>\n<path d="M13.7344 12.0781L10.9609 17.6211L8.1875 12.0781H13.7344Z" fill="currentColor"/>\n</svg>', this.$headings = this.$head
        ? Array.from(this.$head.querySelectorAll("th"))
        : [], this.createHeadingButtons(), this.updateCaption(), this.updateDirectionIndicators(), this.createStatusBox(), this.initialiseSortedColumn(), this.$head.addEventListener(
        "click", this.onSortButtonClick.bind(this))
  }

  createHeadingButtons() {
    for (const t of this.$headings) {
      t.hasAttribute("aria-sort")
      && this.createHeadingButton(t)
    }
  }

  createHeadingButton(t) {
    const e = this.$headings.indexOf(t), o = document.createElement("button");
    o.setAttribute("type", "button"), o.setAttribute("data-index",
        `${e}`), o.textContent = t.textContent, t.textContent = "", t.appendChild(
        o)
  }

  createStatusBox() {
    this.$status = document.createElement("div"), this.$status.setAttribute(
        "aria-atomic", "true"), this.$status.setAttribute("aria-live",
        "polite"), this.$status.setAttribute("class",
        "govuk-visually-hidden"), this.$status.setAttribute("role",
        "status"), this.$root.insertAdjacentElement("afterend", this.$status)
  }

  initialiseSortedColumn() {
    var t;
    const e = this.getTableRowsArray(), o = this.$root.querySelector(
            'th[aria-sort="ascending"], th[aria-sort="descending"]'),
        s = null == o ? void 0 : o.querySelector("button"),
        n = null == o ? void 0 : o.getAttribute("aria-sort"),
        i = Number.parseInt(
            null != (t = null == s ? void 0 : s.getAttribute("data-index")) ? t
                : "0", 10);
    if (!o || !s || "ascending" !== n && "descending" !== n) {
      return;
    }
    const r = this.sort(e, i, n);
    this.addRows(r)
  }

  onSortButtonClick(t) {
    var e;
    const o = t.target.closest("button");
    if (!(o && o instanceof HTMLButtonElement && o.parentElement)) {
      return;
    }
    const s = o.parentElement.getAttribute("aria-sort"), n = Number.parseInt(
            null != (e = null == o ? void 0 : o.getAttribute("data-index")) ? e
                : "0", 10),
        i = "none" === s || "descending" === s ? "ascending" : "descending",
        r = this.getTableRowsArray(), a = this.sort(r, n, i);
    this.addRows(a), this.removeButtonStates(), this.updateButtonState(o,
        i), this.updateDirectionIndicators()
  }

  updateCaption() {
    if (!this.$caption) {
      return;
    }
    let t = this.$caption.querySelector(".govuk-visually-hidden");
    t || (t = document.createElement("span"), t.classList.add(
        "govuk-visually-hidden"), t.textContent = "â€ˆ(column headers with buttons are sortable).", this.$caption.appendChild(
        t))
  }

  updateButtonState(t, e) {
    if ("ascending" !== e && "descending" !== e) {
      return;
    }
    t.parentElement.setAttribute("aria-sort", e);
    let o = this.config.statusMessage;
    o = o.replace(/%heading%/, t.textContent), o = o.replace(/%direction%/,
        this.config[`${e}Text`]), this.$status.textContent = o
  }

  updateDirectionIndicators() {
    for (const e of this.$headings) {
      const o = e.querySelector("button");
      if (e.hasAttribute("aria-sort") && o) {
        var t;
        const s = e.getAttribute("aria-sort");
        switch (null == (t = o.querySelector("svg")) || t.remove(), s) {
          case"ascending":
            o.insertAdjacentHTML("beforeend", this.$upArrow);
            break;
          case"descending":
            o.insertAdjacentHTML("beforeend", this.$downArrow);
            break;
          default:
            o.insertAdjacentHTML("beforeend", this.$upDownArrow)
        }
      }
    }
  }

  removeButtonStates() {
    for (const t of this.$headings) {
      t.setAttribute("aria-sort", "none")
    }
  }

  addRows(t) {
    for (const e of t) {
      this.$body.append(e)
    }
  }

  getTableRowsArray() {
    return Array.from(this.$body.querySelectorAll("tr"))
  }

  sort(t, e, o) {
    return t.sort(((t, s) => {
      const n = t.querySelectorAll("td, th")[e],
          i = s.querySelectorAll("td, th")[e];
      if (!(n && i && n instanceof HTMLElement && i
          instanceof HTMLElement)) {
        return 0;
      }
      const r = "ascending" === o ? this.getCellValue(n) : this.getCellValue(i),
          a = "ascending" === o ? this.getCellValue(i) : this.getCellValue(n);
      return "number" != typeof r || "number" != typeof a
          ? r.toString().localeCompare(a.toString()) : r - a
    }))
  }

  getCellValue(t) {
    const e = t.getAttribute("data-sort-value") || t.innerHTML, o = Number(e);
    return Number.isFinite(o) ? o : e
  }
}

function initAll(t) {
  for (const e of
      [AddAnother, Alert, ButtonMenu, DatePicker, MultiSelect, PasswordReveal,
        RichTextEditor, SearchToggle, SortableTable]) {
    createAll(e, void 0, t)
  }
}

SortableTable.moduleName = "moj-sortable-table", SortableTable.defaults = Object.freeze(
    {
      statusMessage: "Sort by %heading% (%direction%)",
      ascendingText: "ascending",
      descendingText: "descending"
    }), SortableTable.schema = Object.freeze({
  properties: {
    statusMessage: {type: "string"},
    ascendingText: {type: "string"},
    descendingText: {type: "string"}
  }
});
export {
  AddAnother,
  Alert,
  ButtonMenu,
  DatePicker,
  FilterToggleButton,
  FormValidator,
  MultiFileUpload,
  MultiSelect,
  PasswordReveal,
  RichTextEditor,
  SearchToggle,
  SortableTable,
  initAll,
  version
};//# sourceMappingURL=moj-frontend.min.js.map
