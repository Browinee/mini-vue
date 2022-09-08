import { camelize, toHandlerKey } from "src/shared";

// NOTE: instance already bind to emit
//  component.emit = emit.bind(null, component) as any;
export function emit(instance, event, ...args) {
  const { props } = instance;

  const handlerName = toHandlerKey(camelize(event));
  const handler = props[handlerName];
  handler && handler(...args);
}
