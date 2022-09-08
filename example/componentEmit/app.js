import {h} from "../../lib/guide-mini-vue.esm.js"
import {Foo} from "./foo.js"

export const App = {
  name: "App",
  render(){
    // NOTE: emit
    return h("div", {}, [h("div", {}, "App"),h(Foo, {onAdd(a,b){
      console.log("onAdd: a, b", a, b);
    }, onAddFoo(a,b){console.log("onAddFoo",a,b);}})])
  },
  setup() {
    return {}
  }
}