import { NodeTypes } from "./ast";

export function transform(root, options = {}) {
  const context = createTransformContext(root, options);
  traverseNode(root, context);

  createRootCodegen(root);
}
function createRootCodegen(root) {
  root.codegenNode = root.children[0];
}
function traverseNode(node, context) {
  const nodeTransforms = context.nodeTransforms;
  for (const transform of nodeTransforms) {
    transform(node);
  }
  const children = node.children;

  if (children) {
    for (let i = 0; i < children.length; i++) {
      const node = children[i];
      traverseNode(node, context);
    }
  }
}
function createTransformContext(root: any, options: any) {
  const context = {
    root,
    nodeTransforms: options.nodeTransforms || [],
  };
  return context;
}
