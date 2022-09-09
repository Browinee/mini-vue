import {h, ref, nextTick, getCurrentInstance} from "../../lib/guide-mini-vue.esm.js"
// import NextTicker from "./NextTicker.js";

export default {
  name: "App",
  setup() {
    const count = ref(1)
    const instance = getCurrentInstance()
    function onClick() {
      for (let i = 0; i < 100; i++) {
        count.value =i
        console.log("update");
      }
    }
    console.log(instance)
    nextTick(() => {
      console.log(instnace)
    })
    return {
      onClick,
      count
    }
  },

  render() {
    const button = h("button", {onClick: this.onClick}, "update")
    const p = h("p", {}, "count: " + this.count)
    return h("div", {}, [button, p])
  },
};
