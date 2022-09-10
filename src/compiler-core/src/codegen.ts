import { isString } from "../../shared";
import { NodeTypes } from "./ast";
import {
  CREATE_ELEMENT_VNODE,
  helperNameMap,
  TO_DISPLAY_STRING,
} from "./runtimeHelpers";

export function generate(ast, options = {}) {
  const context = createCodegenContext(ast, options);
  const { push, mode } = context;

  if (mode === "module") {
    genModulePreamble(ast, context);
  } else {
    genFunctionPreamble(ast, context);
  }

  const functionName = "render";

  const args = ["_ctx"];

  const signature = args.join(", ");
  push(`function ${functionName}(${signature}) {`);
  push("return ");
  genNode(ast.codegenNode, context);

  push("}");

  return {
    code: context.code,
  };
}

function genFunctionPreamble(ast: any, context: any) {
  const { runtimeGlobalName, push, newline } = context;
  const VueBinging = runtimeGlobalName;

  const aliasHelper = (s) => `${helperNameMap[s]} : _${helperNameMap[s]}`;

  if (ast.helpers.length > 0) {
    push(
      `
        const { ${ast.helpers.map(aliasHelper).join(", ")}} = ${VueBinging}

      `
    );
  }

  newline();
  push(`return `);
}

function genNode(node: any, context: any) {
  // 生成代码的规则就是读取 node ，然后基于不同的 node 来生成对应的代码块
  // 然后就是把代码快给拼接到一起就可以了

  switch (node.type) {
    case NodeTypes.INTERPOLATION:
      genInterpolation(node, context);
      break;
    case NodeTypes.SIMPLE_EXPRESSION:
      genExpression(node, context);
      break;

    case NodeTypes.ELEMENT:
      genElement(node, context);
      break;

    case NodeTypes.COMPOUND_EXPRESSION:
      genCompoundExpression(node, context);
      break;

    case NodeTypes.TEXT:
      genText(node, context);
      break;

    default:
      break;
  }
}

function genCompoundExpression(node: any, context: any) {
  const { push } = context;
  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i];
    if (isString(child)) {
      push(child);
    } else {
      genNode(child, context);
    }
  }
}

function genText(node: any, context: any) {
  // Implement
  const { push } = context;

  push(`'${node.content}'`);
}

function genElement(node, context) {
  const { push, helper } = context;
  const { tag, props, children } = node;

  push(`${helper(CREATE_ELEMENT_VNODE)}(`);

  genNodeList(genNullableArgs([tag, props, children]), context);

  push(`)`);
}

function genNodeList(nodes: any, context: any) {
  const { push } = context;
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];

    if (isString(node)) {
      push(`${node}`);
    } else {
      genNode(node, context);
    }
    if (i < nodes.length - 1) {
      push(", ");
    }
  }
}

function genNullableArgs(args) {
  let i = args.length;
  while (i--) {
    if (args[i] != null) break;
  }

  return args.slice(0, i + 1).map((arg) => arg || "null");
}

function genExpression(node: any, context: any) {
  context.push(node.content, node);
}

function genInterpolation(node: any, context: any) {
  const { push, helper } = context;
  push(`${helper(TO_DISPLAY_STRING)}(`);
  genNode(node.content, context);
  push(")");
}

function genModulePreamble(ast, context) {
  const { push, newline, runtimeModuleName } = context;

  if (ast.helpers.length) {
    const code = `import {${ast.helpers
      .map((s) => `${helperNameMap[s]} as _${helperNameMap[s]}`)
      .join(", ")} } from ${JSON.stringify(runtimeModuleName)}`;

    push(code);
  }

  newline();
  push(`export `);
}

function createCodegenContext(
  ast: any,
  { runtimeModuleName = "vue", runtimeGlobalName = "Vue", mode = "function" }
): any {
  const context = {
    code: "",
    mode,
    runtimeModuleName,
    runtimeGlobalName,
    helper(key) {
      return `_${helperNameMap[key]}`;
    },
    push(code) {
      context.code += code;
    },
    newline() {
      context.code += "\n";
    },
  };

  return context;
}
