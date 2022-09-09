import { effect } from "src/reactivity/effect";
import { EMPTY_OBJ } from "src/shared";
import { ShapeFlags } from "src/shared/ShapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { shouldUpdateComponent } from "./componentRenderUtils";
import { createAppAPI } from "./createApp";
import { queueJobs } from "./scheduler";
import { Fragment, Text } from "./vnode";

export function createRenderer(options) {
  const {
    createElement: hostCreateElement,
    patchProp: hostPatchProp,
    insert: hostInsert,
    remove: hostRemove,
    setElementText: hostSetElementText,
  } = options;

  function render(vnode, container) {
    patch(null, vnode, container, null);
  }

  function patch(
    n1,
    n2,
    container = null,
    anchor = null,
    parentComponent = null
  ) {
    const { type, shapeFlag } = n2;
    // NOTE: fragment -> only render children
    switch (type) {
      case Fragment:
        processFragment(n1, n2, container);
        break;
      case Text:
        processText(n1, n2, container);
        break;
      default:
        // NOTE: check if vnode is element or component
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, anchor, parentComponent);
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(n1, n2, container, parentComponent);
        }
        break;
    }
  }
  function processComponent(n1, n2: any, container: any, parentComponent: any) {
    if (!n1) {
      mountComponent(n2, container, parentComponent);
    } else {
      updateComponent(n1, n2);
    }
  }
  function updateComponent(n1, n2) {
    const instance = (n2.component = n1.component);
    if (shouldUpdateComponent(n1, n2)) {
      instance.next = n2;
      instance.update();
    } else {
      n2.component = n1.component;
      n2.el = n1.el;
      instance.vnode = n2;
    }
  }
  function processElement(
    n1,
    n2: any,
    container: any,
    anchor,
    parentComponent: any
  ) {
    if (!n1) {
      mountElement(n2, container, parentComponent);
    } else {
      patchElement(n1, n2, container, anchor, parentComponent);
    }
  }

  function patchElement(n1, n2, container, anchor, parentComponent) {
    const oldProps = n1.props || EMPTY_OBJ;
    const newProps = n2.props || EMPTY_OBJ;
    const el = (n2.el = n1.el);
    patchChildren(n1, n2, el, anchor, parentComponent);
    patchProps(el, oldProps, newProps);
  }
  function patchChildren(n1, n2, container, anchor, parentComponent) {
    console.log("patchChildren", { n1, n2, container });
    const { shapeFlag } = n2;
    const prevShapeFlag = n1.shapeFlag;
    const c2 = n2.children;
    const c1 = n1.children;
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        unmountChildren(n1.children);
      }
      if (c1 !== c2) {
        hostSetElementText(container, c2);
      }
    } else {
      if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
        hostSetElementText(container, "");
        mountChildren(c2, container);
      } else {
        patchKeyedChildren(c1, c2, container, anchor, parentComponent);
      }
    }
  }
  function patchKeyedChildren(
    c1: any[],
    c2: any[],
    container,
    parentAnchor,
    parentComponent
  ) {
    let i = 0;
    const l2 = c2.length;
    let e1 = c1.length - 1;
    let e2 = l2 - 1;

    const isSameVNodeType = (n1, n2) => {
      return n1.type === n2.type && n1.key === n2.key;
    };

    while (i <= e1 && i <= e2) {
      const prevChild = c1[i];
      const nextChild = c2[i];

      if (!isSameVNodeType(prevChild, nextChild)) {
        console.log("Two different children(from left to right");
        console.log(`prevChild:${prevChild}`);
        console.log(`nextChild:${nextChild}`);
        break;
      }

      console.log(
        "Two same children, then compare these two(from left to right "
      );
      patch(prevChild, nextChild, container, parentAnchor, parentComponent);
      i++;
    }

    while (i <= e1 && i <= e2) {
      // 从右向左取值
      const prevChild = c1[e1];
      const nextChild = c2[e2];

      if (!isSameVNodeType(prevChild, nextChild)) {
        console.log("Two different children(from right to left)");
        console.log(`prevChild:${prevChild}`);
        console.log(`nextChild:${nextChild}`);
        break;
      }
      console.log(
        "Two same children, then compare these two(from right to left "
      );
      patch(prevChild, nextChild, container, parentAnchor, parentComponent);
      e1--;
      e2--;
    }

    if (i > e1 && i <= e2) {
      const nextPos = e2 + 1;
      const anchor = nextPos < l2 ? c2[nextPos].el : parentAnchor;
      while (i <= e2) {
        console.log(`create a new  vnode: ${c2[i].key}`);
        patch(null, c2[i], container, anchor, parentComponent);
        i++;
      }
    } else if (i > e2 && i <= e1) {
      while (i <= e1) {
        console.log(`delete current vnode: ${c1[i].key}`);
        hostRemove(c1[i].el);
        i++;
      }
    } else {
      // ex:
      // a,b,[c,d,e],f,g
      // a,b,[e,c,d],f,g

      let s1 = i;
      let s2 = i;
      const keyToNewIndexMap = new Map();
      let moved = false;
      let maxNewIndexSoFar = 0;

      for (let i = s2; i <= e2; i++) {
        const nextChild = c2[i];
        keyToNewIndexMap.set(nextChild.key, i);
      }

      const toBePatched = e2 - s2 + 1;
      let patched = 0;
      const newIndexToOldIndexMap = new Array(toBePatched);
      for (let i = 0; i < toBePatched; i++) newIndexToOldIndexMap[i] = 0;

      for (i = s1; i <= e1; i++) {
        const prevChild = c1[i];

        if (patched >= toBePatched) {
          hostRemove(prevChild.el);
          continue;
        }

        let newIndex;
        if (prevChild.key != null) {
          newIndex = keyToNewIndexMap.get(prevChild.key);
        } else {
          for (let j = s2; j <= e2; j++) {
            if (isSameVNodeType(prevChild, c2[j])) {
              newIndex = j;
              break;
            }
          }
        }

        if (newIndex === undefined) {
          hostRemove(prevChild.el);
        } else {
          newIndexToOldIndexMap[newIndex - s2] = i + 1;

          if (newIndex >= maxNewIndexSoFar) {
            maxNewIndexSoFar = newIndex;
          } else {
            moved = true;
          }

          patch(prevChild, c2[newIndex], container, null, parentComponent);
          patched++;
        }
      }

      const increasingNewIndexSequence = moved
        ? getSequence(newIndexToOldIndexMap)
        : [];
      let j = increasingNewIndexSequence.length - 1;

      for (let i = toBePatched - 1; i >= 0; i--) {
        const nextIndex = s2 + i;
        const nextChild = c2[nextIndex];

        const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : parentAnchor;

        if (newIndexToOldIndexMap[i] === 0) {
          patch(null, nextChild, container, anchor, parentComponent);
        } else if (moved) {
          if (j < 0 || increasingNewIndexSequence[j] !== i) {
            hostInsert(nextChild.el, container, anchor);
          } else {
            j--;
          }
        }
      }
    }
  }
  function unmountChildren(children) {
    for (let i = 0; i < children.length; i++) {
      const el = children[i].el;
      hostRemove(el);
    }
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
      mountChildren(vnode.children, el);
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

  function mountChildren(children, container) {
    children.forEach((VNodeChildv) => patch(null, VNodeChildv, container));
  }

  function mountComponent(vnode: any, container: any, parentComponent: any) {
    const instance = (vnode.component = createComponentInstance(
      vnode,
      parentComponent
    ));
    setupComponent(instance);
    setupRenderEffect(instance, vnode, container);
  }
  function setupRenderEffect(instance: any, vnode, container: any) {
    instance.update = effect(
      () => {
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
          // NOTE: next is the vnode about to update
          const { next, vnode } = instance;
          if (next) {
            next.el = vnode.el;
            updateComponentPreRender(instance, next);
          }
          const proxy = instance.proxy;
          const subTree = instance.render.call(proxy);
          const prevSubTree = instance.subTree;
          instance.subTree = subTree;
          patch(prevSubTree, subTree, container, instance);
        }
      },
      {
        scheduler() {
          console.log("update -  scheduler");
          queueJobs(instance.update);
        },
      }
    );
  }
  function processFragment(n1, n2: any, container: any) {
    mountChildren(n2.children, container);
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
function updateComponentPreRender(instance, nextVNode) {
  instance.vnode = nextVNode;
  instance.next = null;
  instance.props = nextVNode.props;
}

function getSequence(arr: number[]): number[] {
  const p = arr.slice();
  const result = [0];
  let i, j, u, v, c;
  const len = arr.length;
  for (i = 0; i < len; i++) {
    const arrI = arr[i];
    if (arrI !== 0) {
      j = result[result.length - 1];
      if (arr[j] < arrI) {
        p[i] = j;
        result.push(i);
        continue;
      }
      u = 0;
      v = result.length - 1;
      while (u < v) {
        c = (u + v) >> 1;
        if (arr[result[c]] < arrI) {
          u = c + 1;
        } else {
          v = c;
        }
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1];
        }
        result[u] = i;
      }
    }
  }
  u = result.length;
  v = result[u - 1];
  while (u-- > 0) {
    result[u] = v;
    v = p[v];
  }
  return result;
}
