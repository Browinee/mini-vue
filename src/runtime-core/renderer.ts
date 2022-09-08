import { effect } from "src/reactivity/effect";
import { ShapeFlags } from "src/shared/ShapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { createAppAPI } from "./createApp";
import { Fragment, Text } from "./vnode";

export function createRenderer(options) {
  const { createElement, patchProps, insert } = options;

  function render(vnode, container) {
    patch(null, vnode, container, null);
  }

  function patch(n1, n2, container, parentComponent) {
    const { type, shapeFlag } = n2;
    // NOTE: fragment -> only render children
    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent);
        break;
      case Text:
        processText(n1, n2, container);
        break;
      default:
        // NOTE: check if vnode is element or component
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, parentComponent);
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(n1, n2, container, parentComponent);
        }
        break;
    }
  }
  function processComponent(n1, n2: any, container: any, parentComponent: any) {
    mountComponent(n2, container, parentComponent);
  }

  function processElement(n1, n2: any, container: any, parentComponent: any) {
    console.log("processElement: n1-n2", { n1, n2 });
    if (!n1) {
      mountElement(n2, container, parentComponent);
    } else {
      patchElement(n1, n2, container);
    }
  }

  function patchElement(n1, n2, container) {
    console.log("n1-n2", { n1, n2 });
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
    vnode.children.forEach((v) => patch(null, v, container, parentComponent));
  }

  function mountComponent(vnode: any, container: any, parentComponent: any) {
    const instance = createComponentInstance(vnode, parentComponent);
    setupComponent(instance);
    setupRenderEffect(instance, vnode, container);
  }
  function setupRenderEffect(instance: any, vnode, container: any) {
    effect(() => {
      if (!instance.isMounted) {
        console.log("init");
        const proxy = instance.proxy;
        const subTree = (instance.subTree = instance.render.call(proxy));
        patch(null, subTree, container, instance);
        // NOTE: element -> mount
        vnode.el = subTree.el;
        instance.isMounted = true;
      } else {
        console.log("update");
        const proxy = instance.proxy;
        const subTree = instance.render.call(proxy);
        const prevSubTree = instance.subTree;
        instance.subTree = subTree;
        patch(null, subTree, container, instance);
      }
    });
  }
  function processFragment(n1, n2: any, container: any, parentComponent: any) {
    mountChildren(n2, container, parentComponent);
  }
  function processText(n1, n2: any, container: any) {
    const { children } = n2;
    const textNode = (n2.el = document.createTextNode(children));
    container.append(textNode);
  }
  return {
    createApp: createAppAPI(render),
  };
}
