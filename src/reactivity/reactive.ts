import { mutableHandlers, readOnlyHandlers } from "./baseHandlers";
export function reactive(raw) {
  return createActiveObject(raw, mutableHandlers);
}

export function readOnly(raw) {
  return createActiveObject(raw, readOnlyHandlers);
}

function createActiveObject(raw: any, handler) {
  return new Proxy(raw, handler);
}
