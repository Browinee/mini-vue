import { isObject } from "./../shared/index";
import { createComponentInstance, setupComponent } from "./component";

export function render(vnode, container) {
  //NOTE: patch
  patch(vnode, container);
}

function patch(vnode, container) {
  // NOTE: check if vnode is element or component
  if (typeof vnode.type === "string") {
    processElement(vnode, container);
  } else if (isObject(vnode.type)) {
    processComponent(vnode, container);
  }
}
function processComponent(vnode: any, container: any) {
  mountComponent(vnode, container);
}

function processElement(vnode: any, container: any) {
  mountElement(vnode, container);
}
function mountElement(vnode: any, container: any) {
  // vnode ->element -> div
  const el = (vnode.el = document.createElement(vnode.type));
  const { children, props } = vnode;
  // NOTE: children might be text or array
  if (typeof children === "string") {
    el.textContent = children;
  } else if (Array.isArray(children)) {
    mountChildren(vnode, el);
  }
  for (const key in props) {
    const val = props[key];
    el.setAttribute(key, val);
  }
  console.log("container", { container });
  container.append(el);
}

function mountChildren(vnode, container) {
  vnode.children.forEach((v) => patch(v, container));
}

function mountComponent(vnode: any, container: any) {
  const instance = createComponentInstance(vnode);
  setupComponent(instance);
  setupRenderEffect(instance, vnode, container);
}
function setupRenderEffect(instance: any, vnode, container: any) {
  const proxy = instance.proxy;
  const subTree = instance.render.call(proxy);
  patch(subTree, container);
  // NOTE: element -> mount
  vnode.el = subTree.el;
}
