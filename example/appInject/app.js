import {h, provide, inject} from "../../lib/guide-mini-vue.esm.js"
const Provider = {
  name: "Provider",
  setup() {
    provide("foo", "fooVal");
    provide("bar", "barVal");
  },
  render() {
    return h("div", {}, [h("p", {}, "Provider"), h(Provider2)]);
  },
};
const Provider2 = {
  name: "Provider2",
  setup() {
    provide("foo", "fooVal2");
    const foo = inject("foo")
    return {
      foo
    }
  },
  render() {
    return h("div", {}, [h("p", {}, "Provider2: foo from parent: " + this.foo), h(Consumer)]);
  },
};
const Consumer = {
  name: "Consumer",
  setup() {
    const foo = inject("foo");
    const bar = inject("bar");
    const baz = inject("baz", "bazDefault")
    const baz2 = inject("baz", () => "bazDefault2")
    return {
      foo,
      bar,
      baz,
      baz2,
    };
  },
  render() {
    return h("div", {}, `Consumer: - ${this.foo} - ${this.bar} - ${this.baz} - ${this.baz2}`);
  },
};

export default {
  name: "App",
  setup() {},
  render() {
    return h("div", {}, [h("p", {}, "appInject"), h(Provider)]);
  },
};
