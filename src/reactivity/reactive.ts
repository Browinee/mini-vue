import {
  mutableHandlers,
  ReactiveFlags,
  readOnlyHandlers,
} from "./baseHandlers";
export function reactive(raw) {
  return createActiveObject(raw, mutableHandlers);
}

export function readOnly(raw) {
  return createActiveObject(raw, readOnlyHandlers);
}

function createActiveObject(raw: any, handler) {
  return new Proxy(raw, handler);
}

export function isReactive(value) {
  // NOTE: if value is not proxy object,
  // it won't trigger getter function in proxy.
  // the value doesn't contain ReactiveFlags.IS_REACTIVE,
  // so it will return undefined. Use double !! to transform
  // undefined to boolean
  return !!value[ReactiveFlags.IS_REACTIVE];
}
export function isReadonly(value) {
  return !!value[ReactiveFlags.IS_READONLY];
}
