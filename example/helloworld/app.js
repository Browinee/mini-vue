import {h} from "../../lib/guide-mini-vue.esm.js"
import {Foo} from "./foo.js"

window.self = null;
export const App = {
  name: "App",
  render(){
    window.self = this;
    return h("div", {
      id: "root",
      class: ["red"],
      onClick() {
        console.log("clic")
      },
      onMousedown: () => {
        console.log("mousedown");
      },
    },
     [h("div", {},  "hi, "+ this.msg), h(Foo, {count: 1000})]
    //  "hi, "+ this.msg
    // [h("p", {class: "red"}, "hi, first"), h("p", {class: "red"}, "hi, second")]
    )
  },
  setup() {
    return {
      msg: "mini-vue"
    }
  }
}