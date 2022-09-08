import { ShapeFlags } from "src/shared/ShapeFlags";
import { isObject } from "./../shared/index";
import { createComponentInstance, setupComponent } from "./component";
import { Fragment, Text } from "./vnode";

export function render(vnode, container) {
  //NOTE: patch
  patch(vnode, container);
}

function patch(vnode, container) {
  const { type, shapeFlag } = vnode;
  // NOTE: fragment -> only render children
  switch (type) {
    case Fragment:
      processFragment(vnode, container);
      break;
    case Text:
      processText(vnode, container);
      break;
    default:
      // NOTE: check if vnode is element or component
      if (shapeFlag & ShapeFlags.ELEMENT) {
        processElement(vnode, container);
      } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        processComponent(vnode, container);
      }
      break;
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
  const { children, props, shapeFlag } = vnode;
  // NOTE: children might be text or array
  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    el.textContent = children;
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    mountChildren(vnode, el);
  }
  for (const key in props) {
    const val = props[key];
    const isOn = (key: string) => /^on[A-Z]/.test(key);
    if (isOn(key)) {
      const event = key.slice(2).toLocaleLowerCase();
      el.addEventListener(event, val);
    } else {
      el.setAttribute(key, val);
    }
  }
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
function processFragment(vnode: any, container: any) {
  mountChildren(vnode, container);
}
function processText(vnode: any, container: any) {
  const { children } = vnode;
  const textNode = (vnode.el = document.createTextNode(children));
  container.append(textNode);
}
