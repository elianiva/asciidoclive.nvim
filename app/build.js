import esbuild from "esbuild";

esbuild
  .build({
    entryPoints: ["index.js"],
    bundle: true,
    format: "esm",
    platform: "node",
    external: ["asciidoctor", "neovim", "restana", "ws"],
    outdir: "./dist",
    target: ["es2020", "node14"]
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
