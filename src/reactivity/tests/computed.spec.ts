import { computed } from "../computed";
import { reactive } from "../reactive";

describe("computed", () => {
  it("happy path", () => {
    const user = reactive({ age: 1 });
    const age: any = computed(() => user.age);
    expect(age.value).toBe(1);
  });
  it("should computed lazily", () => {
    const value = reactive({ foo: 1 });
    const getter = jest.fn(() => value.foo);
    const cValue: any = computed(getter);

    // lazy
    expect(getter).not.toHaveBeenCalled();
    expect(cValue.value).toBe(1);
    expect(getter).toHaveBeenCalledTimes(1);

    // NOTE: should not compute again
    cValue.value; // get
    expect(getter).toHaveBeenCalledTimes(1);

    // NOTE: should not compute until needed
    value.foo = 2;
    expect(getter).toHaveBeenCalledTimes(1);

    // NOTE: now it should compute
    expect(cValue.value).toBe(2);
    expect(getter).toHaveBeenCalledTimes(2);

    // NOTE: should not compute again
    cValue.value;
    expect(getter).toHaveBeenCalledTimes(2);
  });
});
