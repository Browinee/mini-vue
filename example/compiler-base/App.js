import {ref} from "../../lib/guide-mini-vue.esm.js";
export default {
  name: "App",
  template: `<div>hi,{{msg}} count: {{count}}</div>`,
  setup() {
    const count = window.count = ref(1)
    return {
      count,
      msg: "mini-vue",
    };
  },
};


