import { PublicInstanceProxyHandlers } from "./componentPublicInstance";

export function createComponentInstance(vnode) {
  const component = {
    vnode,
    type: vnode.type,
    setupState: {},
  };
  return component;
}

export function setupComponent(instance) {
  //TODO
  // initProps()
  // initSlots()
  setupStatefulComponent(instance);
}
function setupStatefulComponent(instance: any) {
  const component = instance.type;

  // ctx
  instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);

  const { setup } = component;
  if (setup) {
    // function or object
    const setupResult = setup();
    handleSetupResult(instance, setupResult);
  }
}
function handleSetupResult(instance, setupResult: any) {
  if (typeof setupResult === "object") {
    instance.setupState = setupResult;
  }
  finishComponentSetup(instance);
}
function finishComponentSetup(instance: any) {
  const Component = instance.type;
  if (Component.render) {
    instance.render = Component.render;
  }
}
