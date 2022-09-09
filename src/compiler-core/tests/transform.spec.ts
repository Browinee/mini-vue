import { NodeTypes } from "../src/ast";
import { baseParse } from "../src/parse";
import { transform } from "../src/transform";
describe("Compiler: transform", () => {
  it("happy path", () => {
    const ast = baseParse("<div>hi,{{message}}</div>");
    const plugin = (node) => {
      if (node.type === NodeTypes.TEXT) {
        node.content = node.content + " mini-vue";
      }
    };
    transform(ast, {
      nodeTransforms: [plugin],
    });
    const ndoetext = ast.children[0].children[0];
    expect(ndoetext.content).toBe("hi, mini-vue");
  });
});
