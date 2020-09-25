import { terser } from "rollup-plugin-terser";

export default {
  input: './src/scrollbar.js',
  output: [
    {
      file: './dist/scrollbar.js',
      format: 'iife',
      name: 'ScrollBar'
    },
    {
      file: './dist/scrollbar.min.js',
      format: 'iife',
      name: 'ScrollBar',
      plugins: [terser()]
    }
  ]
}
