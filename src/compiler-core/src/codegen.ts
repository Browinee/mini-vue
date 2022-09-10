import { NodeTypes } from "./ast";
import { helperNameMap, TO_DISPLAY_STRING } from "./runtimeHelpers";

export function generate(ast, options = {}) {
  const context = createCodegenContext();
  const { push } = context;
  genFunctionPreamble(ast, context);

  const functionName = "render";
  const args = ["_ctx", "_cache"];
  const signature = args.join(", ");

  push(`function ${functionName}${signature}{`);
  push(`return `);
  genNode(ast.codegenNode, context);
  push("}");
  return {
    code: context.code,
  };
}
function genFunctionPreamble(ast, context) {
  const { push } = context;
  const VueBinging = "Vue";
  const aliasHelper = (s) => `${helperNameMap[s]}:_${helperNameMap[s]}`;
  if (ast.helpers.length > 0) {
    push(`const { ${ast.helpers.map(aliasHelper).join(", ")}} = ${VueBinging}`);
    push("\n");
    push("return ");
  }
}

function createCodegenContext() {
  const context = {
    code: "",
    push(source) {
      context.code += source;
    },
    helper(key) {
      return `_${helperNameMap[key]}`;
    },
  };
  return context;
}
function genNode(codegenNode, context) {
  switch (codegenNode.type) {
    case NodeTypes.TEXT:
      genText(context, codegenNode);
      break;
    case NodeTypes.INTERPOLATION:
      genInterpolation(context, codegenNode);
      break;
    case NodeTypes.SIMPLE_EXPRESSION:
      genExpression(context, codegenNode);
      break;
    default:
      break;
  }
}
function genInterpolation(context: any, codegenNode: any) {
  const { push, helper } = context;
  push(`${helper(TO_DISPLAY_STRING)}(`);
  genNode(codegenNode.content, context);
  push(")");
}

function genText(context: any, codegenNode: any) {
  const { push } = context;
  push(`'${codegenNode.content}'`);
}
function genExpression(context, codegenNode) {
  const { push } = context;
  push(`${codegenNode.content}`);
}
