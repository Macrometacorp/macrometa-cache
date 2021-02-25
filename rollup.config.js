import pkg from "./package.json";
import cleanup from "rollup-plugin-cleanup";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import json from "@rollup/plugin-json";
import typescript from '@rollup/plugin-typescript';

export default {
  input: "src/index.ts",
  plugins: [cleanup(), nodeResolve(), json(), typescript()],
  output: [
    { format: "es", file: pkg.module },
    { format: "cjs", file: pkg.main },
    { format: "umd", file: pkg.browser, name: pkg.name },
  ],
};
