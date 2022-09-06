import { isTracking, trackEffects, triggerEffects } from "./effect";
import { hasChanged, isObject } from "./shared";
import { reactive } from "./reactive";

// NOTE: why need RefImpl
// if value is object, we could just use reactive
// what if value if primitive type?
// we create this class to wrap the primitive type
// and assign setter and getter function on value

class RefImpl {
  private _value: any;
  private _rawValue: any;

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
