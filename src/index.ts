export * from "./runtime-dom";
import { baseCompile } from "./compiler-core/src";
import * as runtimeDom from "./runtime-dom";
function compileToFunction(template, options = {}) {
  const { code } = baseCompile(template, options);
  const render = new Function("Vue", code)(runtimeDom);

  return render;
}

runtimeDom.registerRuntimeCompiler(compileToFunction);
