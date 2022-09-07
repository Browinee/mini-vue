import { isTracking, trackEffects, triggerEffects } from "./effect";
import { hasChanged, isObject } from "../shared";
import { reactive } from "./reactive";

// NOTE: why need RefImpl
// if value is object, we could just use reactive
// what if value if primitive type?
// we create this class to wrap the primitive type
// and assign setter and getter function on value

class RefImpl {
  private _value: any;
  private _rawValue: any;
  public __v_ifRef: boolean = true;
  public deps: Set<any>;
  constructor(value) {
    // NOTE: value => reactvie value
    this._rawValue = value;
    this._value = convert(value);
    this.deps = new Set();
  }
  get value() {
    trackRefValue(this);
    return this._value;
  }
  set value(newValue) {
    // NOTE: assigned value first
    // otherwise value would be wrong when triggering getter

    if (hasChanged(newValue, this._rawValue)) {
      this._rawValue = newValue;
      this._value = convert(newValue);
      triggerEffects(this.deps);
    }
  }
}
function convert(value) {
  return isObject(value) ? reactive(value) : value;
}
function trackRefValue(ref: RefImpl) {
  if (isTracking()) {
    trackEffects(ref.deps);
  }
}

export function ref(value) {
  return new RefImpl(value);
}

export function isRef(ref) {
  return !!ref.__v_ifRef;
}

export function unRef(ref) {
  return isRef(ref) ? ref.value : ref;
}

/**
 * Note: in template, we don't need to
 * use ref variable with value, we could
 * just use ref variable.
 */
export function proxyRefs(objectWithRefs) {
  return new Proxy(objectWithRefs, {
    get(target, key) {
      return unRef(Reflect.get(target, key));
    },

    set(target, key, value) {
      if (isRef(target[key]) && !isRef(value)) {
        return (target[key].value = value);
      } else {
        return Reflect.set(target, key, value);
      }
    },
  });
}
