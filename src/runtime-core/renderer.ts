import { effect } from "src/reactivity/effect";
import { EMPTY_OBJ } from "src/shared";
import { ShapeFlags } from "src/shared/ShapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { createAppAPI } from "./createApp";
import { Fragment, Text } from "./vnode";

export function createRenderer(options) {
  const {
    createElement: hostCreateElement,
    patchProp: hostPatchProp,
    insert: hostInsert,
  } = options;

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
    if (!n1) {
      mountElement(n2, container, parentComponent);
    } else {
      patchElement(n1, n2, container);
    }
  }

  function patchElement(n1, n2, container) {
    const oldProps = n1.props || EMPTY_OBJ;
    const newProps = n2.props || EMPTY_OBJ;
    const el = (n2.el = n1.el);
    patchProps(el, oldProps, newProps);
  }

  function patchProps(el, oldProps, newProps) {
    if (oldProps !== newProps) {
      for (const key in newProps) {
        const prevProp = oldProps[key];
        const nextProp = newProps[key];
        if (prevProp !== nextProp) {
          hostPatchProp(el, key, prevProp, nextProp);
        }
      }

      // NOTE: for those props which are not in new Props
      if (oldProps !== EMPTY_OBJ) {
        for (const key in oldProps) {
          if (!(key in newProps)) {
            hostPatchProp(el, key, oldProps[key], null);
          }
        }
      }
    }
  }
  function mountElement(vnode: any, container: any, parentComponent: any) {
    const el = (vnode.el = hostCreateElement(vnode.type));
    const { children, shapeFlag } = vnode;
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.textContent = children;
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(vnode, el, parentComponent);
    }
    const { props } = vnode;
    for (const key in props) {
      const val = props[key];
      hostPatchProp(el, key, null, val);
    }
    hostInsert(el, container);

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
        patch(prevSubTree, subTree, container, instance);
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
