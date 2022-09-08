import {h, renderSlots} from "../../lib/guide-mini-vue.esm.js"

export const Foo  = {
  setup() {
  return {
  }
  },
  render( ) {
    const foo = h("p", {}, "foo")
    // NOTE:
    // named slot
    // return h("div", {}, [renderSlots(this.$slots, "header"), foo, renderSlots(this.$slots, "footer")])
    // scoped slot
    const age = 18
    return h("div", {}, [renderSlots(this.$slots, "header", {age}), foo, renderSlots(this.$slots, "footer")])
    }

}