import typescript from "@rollup/plugin-typescript";

export default {
  input: "index.ts", // 入口文件
  output: {
    file: "./dist/tsaid.js", // 输出文件
    format: "es", // 输出模块格式，可选 'cjs', 'es', 'umd', 'iife' 等
    sourcemap: false, // 可选，生成 source map
  },
  plugins: [typescript()],
};
