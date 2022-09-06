import { isProxy, isReadonly, readOnly } from "../reactive";

describe("readOnly", () => {
  it("happy path", () => {
    const original = { foo: 1, bar: { baz: 2 } };
    const wrapped = readOnly(original);
    expect(wrapped).not.toBe(original);
    expect(wrapped.foo).toBe(1);
    expect(isReadonly(wrapped)).toBe(true);
    expect(isReadonly(original)).toBe(false);
    expect(isReadonly(wrapped.bar)).toBe(true);
    expect(isReadonly(original.bar)).toBe(false);
    expect(isProxy(wrapped)).toBe(true);
  });
  it("warn then call set", () => {
    console.warn = jest.fn();
    const user = readOnly({
      age: 10,
    });
    user.age = 11;
    expect(console.warn).toBeCalled();
  });
});
