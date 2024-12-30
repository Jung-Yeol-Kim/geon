import { defineConfig, type Options } from "tsup";

export default defineConfig((options: Options) => ({
  entry: ["src/index.ts"],
  outDir: "dist",
  banner: {},
  format: ["esm", "cjs"],
  external: ["react"],
  clean: true,
  dts: true,
  sourcemap: true,
  ...options,
}));
