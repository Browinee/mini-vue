import {h, createTextVNode} from "../../lib/guide-mini-vue.esm.js"
import {Foo} from "./foo.js"

export const App = {
  name: "App",
  render(){
   const app = h("div", {}, "App")
   // named slot
   const foo= h(Foo, {}, {
    header: ({age}) => [h("p", {}, "header: " + age), createTextVNode("Hello!")],
    footer: () => h("p", {}, "footer"),
   })
  //  const foo= h(Foo, {}, [h("p", {}, "123"), h("p", {}, "456")])
   return h("div", {}, [app, foo])
  },
  setup() {
    return {}
  }
}