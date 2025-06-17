import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import { dts } from "rollup-plugin-dts";

const external = [
  "libphonenumber-js",
  "jsonwebtoken",
  "nodemailer",
  "fs/promises",
  "fs",
  "path",
  "crypto",
  "util",
];

const baseConfig = {
  input: "index.ts",
  external,
  plugins: [
    resolve({
      preferBuiltins: true,
      exportConditions: ["node"],
    }),
    commonjs(),
    typescript({
      tsconfig: "./tsconfig.json",
      declaration: false,
      declarationMap: false,
    }),
  ],
};

export default [
  // ESM build
  {
    ...baseConfig,
    output: {
      file: "dist/esm/index.js",
      format: "esm",
      sourcemap: true,
    },
    plugins: [
      ...baseConfig.plugins,
      typescript({
        tsconfig: "./tsconfig.json",
        declaration: false,
        declarationMap: false,
        target: "es2020",
      }),
    ],
  },

  // CommonJS build
  {
    ...baseConfig,
    output: {
      file: "dist/cjs/index.js",
      format: "cjs",
      sourcemap: true,
      exports: "named",
    },
    plugins: [
      ...baseConfig.plugins,
      typescript({
        tsconfig: "./tsconfig.json",
        declaration: false,
        declarationMap: false,
        target: "es2018",
      }),
    ],
  },

  // Type definitions
  {
    input: "index.ts",
    output: {
      file: "dist/types/index.d.ts",
      format: "esm",
    },
    external,
    plugins: [
      dts({
        tsconfig: "./tsconfig.json",
      }),
    ],
  },
];
