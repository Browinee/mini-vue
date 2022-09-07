import { render } from "./renderer";
import { createVNode } from "./vnode";

export function createApp(rootComponent) {
  return {
    mount(rootContainer) {
      //NOTE: vnode
      const vnode = createVNode(rootComponent);
      render(vnode, rootComponent);
      // NOTE: component -> vnode
      //NOTE:  manipulate vnode
    },
  };
}
