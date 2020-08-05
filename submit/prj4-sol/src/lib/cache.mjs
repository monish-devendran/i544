//<https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage>
const STORE = window.sessionStorage;

export default class Cache {
  constructor(store=STORE) {
    this.store = store;
  }

  /** return object stored for key in this cache;
   *  returns falsy if not found.
   */
  get(key) {
    //@TODO
    const object = this.store.getItem(key)
    return object && JSON.parse(object)
  }

  /** cache object val under key in this cache.
   *  returns this to allow chaining.
   */
  set(key, val) {
    //@TODO
    return this.store.setItem(key,JSON.stringify(val)), this;
  }
}
