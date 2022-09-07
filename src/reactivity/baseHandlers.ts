import { track, trigger } from "./effect";
import { reactive, readOnly } from "./reactive";
import { extend, isObject } from "../shared";

// NOTE: this way, get , set , readonlyGet
// won't re-create every time.
const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);
export const enum ReactiveFlags {
  IS_REACTIVE = "__v_isReactive",
  IS_READONLY = "__v_isReadOnly",
}
function createGetter(isReadonly = false, isShallow = false) {
  return function get(target, key) {
    if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly;
    } else if (key === ReactiveFlags.IS_READONLY) {
      return isReadonly;
    }
    const res = Reflect.get(target, key);
    if (isShallow) {
      return res;
    }
    // NOTE: nested object
    if (isObject(res)) {
      return isReadonly ? readOnly(res) : reactive(res);
    }
    if (!isReadonly) {
      track(target, key);
    }
    return res;
  };
}

function createSetter() {
  return function set(target, key, value) {
    const res = Reflect.set(target, key, value);
    trigger(target, key);
    return res;
  };
}

export const mutableHandlers = {
  get,
  set,
};

export const readOnlyHandlers = {
  get: readonlyGet,
  set(target, key, value) {
    console.warn(`fail to set key: ${key} because target is readonly`);
    return true;
  },
};

export const shallowReadonlyHandlers = extend({}, readOnlyHandlers, {
  get: shallowReadonlyGet,
});
