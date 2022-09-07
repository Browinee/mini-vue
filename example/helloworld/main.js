import {createApp} from "../../lib/guide-mini-vue.esm.js"
import {App} from "./app.js"


const rootContainer = document.querySelector("#app")
console.log("rootContainer", rootContainer);
createApp(App).mount(rootContainer);

