import { NodeTypes } from "../src/ast";
import { baseParse } from "../src/parse";

describe("parser", () => {
  describe("Interpolation", () => {
    test("simple interpolation", () => {
      // NOTE: {{ message }}, {{message}}, message
      const ast = baseParse("{{message}}");

      expect(ast.children[0]).toStrictEqual({
        type: NodeTypes.INTERPOLATION,
        content: {
          type: NodeTypes.SIMPLE_EXPRESSION,
          content: `message`,
        },
      });
    });
  });
  describe("text", () => {
    it("simple text", () => {
      const ast = baseParse("some text");
      expect(ast.children[0]).toStrictEqual({
        type: NodeTypes.TEXT,
        content: "some text",
      });
    });
  });

  test("hello, world", () => {
    const ast = baseParse("<div>hello{{message}}</div>");
    const element = ast.children[0];
    console.log("element", element);
    expect(element).toStrictEqual({
      type: NodeTypes.ELEMENT,
      tag: "div",
      children: [
        {
          type: NodeTypes.TEXT,
          content: "hello",
        },
        {
          type: NodeTypes.INTERPOLATION,
          content: {
            content: "message",
            type: 1,
          },
        },
      ],
    });
  });

  test("nested element", () => {
    const ast = baseParse("<div><p>hello</p>{{message}}</div>");
    const element = ast.children[0];
    expect(element).toStrictEqual({
      type: NodeTypes.ELEMENT,
      tag: "div",
      children: [
        {
          type: NodeTypes.ELEMENT,
          tag: "p",
          children: [
            {
              type: NodeTypes.TEXT,
              content: "hello",
            },
          ],
        },
        {
          type: NodeTypes.INTERPOLATION,
          content: {
            type: NodeTypes.SIMPLE_EXPRESSION,
            content: "message",
          },
        },
      ],
    });
  });
  test("should trhow error when lack end tag", () => {
    expect(() => {
      baseParse("<div><span></div>");
    }).toThrow("loss end tag:span");
  });
  describe("Element", () => {
    test("simple div", () => {
      const ast = baseParse("<div>hello</div>");
      const element = ast.children[0];
      expect(element).toStrictEqual({
        type: NodeTypes.ELEMENT,
        tag: "div",
        children: [
          {
            content: "hello",
            type: 3,
          },
        ],
      });
    });
  });
});
