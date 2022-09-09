export function generate(ast, options = {}) {
  const context = createCodegenContext();
  const { push } = context;
  push("return ");
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
function genNode(codegenNode, context) {
  const { push } = context;
  push(`'${codegenNode.content}'`);
}
function createCodegenContext() {
  const context = {
    code: "",
    push(source) {
      context.code += source;
    },
  };
  return context;
}
