import {h} from "../../lib/guide-mini-vue.esm.js"


export const App = {
  render(){
    return h("div", {
      id: "root",
      class: ["red"]
    },
    //  "hi, "+ this.msg
    [h("p", {class: "red"}, "hi, first"), h("p", {class: "red"}, "hi, second")]
    )
  },
  setup() {
    return {
      msg: "mini-vue"
    }
  }
}