import typescript from "@rollup/plugin-typescript"
export default {
  input: "./src/index.ts",
  output: [
    // NOTE: cjs => commonjs
    {
      format: "cjs",
      file: "lib/guide-mini-vue.cjs.js"
    },
    // NOTE: esm
    {
      format: "es",
      file: "lib/guide-mini-vue.esm.js"
    }
  ],
  plugins: [
    typescript()
  ]
}