import { ShapeFlags } from "src/shared/ShapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { createAppAPI } from "./createApp";
import { Fragment, Text } from "./vnode";

export function createRenderer(options) {
  const { createElement, patchProps, insert } = options;

  function render(vnode, container) {
    patch(vnode, container, null);
  }

  function patch(vnode, container, parentComponent) {
    const { type, shapeFlag } = vnode;
    // NOTE: fragment -> only render children
    switch (type) {
      case Fragment:
        processFragment(vnode, container, parentComponent);
        break;
      case Text:
        processText(vnode, container);
        break;
      default:
        // NOTE: check if vnode is element or component
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(vnode, container, parentComponent);
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(vnode, container, parentComponent);
        }
        break;
    }
  }
  function processComponent(vnode: any, container: any, parentComponent: any) {
    mountComponent(vnode, container, parentComponent);
  }

  function processElement(vnode: any, container: any, parentComponent: any) {
    mountElement(vnode, container, parentComponent);
  }
  function mountElement(vnode: any, container: any, parentComponent: any) {
    const el = (vnode.el = createElement(vnode.type));
    const { children, shapeFlag } = vnode;
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.textContent = children;
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(vnode, el, parentComponent);
    }
    const { props } = vnode;
    for (const key in props) {
      const val = props[key];
      patchProps(el, key, val);
    }
    insert(el, container);

    //  NOTE: old one, only support DOM
    // // vnode ->element -> div
    // const el = (vnode.el = document.createElement(vnode.type));
    // const { children, props, shapeFlag } = vnode;
    // // NOTE: children might be text or array
    // if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    //   el.textContent = children;
    // } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    //   mountChildren(vnode, el, parentComponent);
    // }
    //   const isOn = (key: string) => /^on[A-Z]/.test(key);
    // for (const key in props) {
    //   const val = props[key];
    //   if (isOn(key)) {
    //     const event = key.slice(2).toLocaleLowerCase();
    //     el.addEventListener(event, val);
    //   } else {
    //     el.setAttribute(key, val);
    //   }
    // }
    // container.append(el);
  }

  function mountChildren(vnode, container, parentComponent) {
    vnode.children.forEach((v) => patch(v, container, parentComponent));
  }

  function mountComponent(vnode: any, container: any, parentComponent: any) {
    const instance = createComponentInstance(vnode, parentComponent);
    setupComponent(instance);
    setupRenderEffect(instance, vnode, container);
  }
  function setupRenderEffect(instance: any, vnode, container: any) {
    const proxy = instance.proxy;
    const subTree = instance.render.call(proxy);
    patch(subTree, container, instance);
    // NOTE: element -> mount
    vnode.el = subTree.el;
  }
  function processFragment(vnode: any, container: any, parentComponent: any) {
    mountChildren(vnode, container, parentComponent);
  }
  function processText(vnode: any, container: any) {
    const { children } = vnode;
    const textNode = (vnode.el = document.createTextNode(children));
    container.append(textNode);
  }
  return {
    createApp: createAppAPI(render),
  };
}
