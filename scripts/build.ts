import execa from "execa";
import path from "path";
import { run, onError } from "./libs";

const webpackDir = path.resolve(__dirname, "../webpack");

async function buildForNode() {
  const config = path.resolve(webpackDir, "config.node.js");
  const build = await run(execa("npx", ["webpack", "-c", config]));

  if (build.error) {
    onError("Node Build", build.error);
  }
}

async function buildForWeb() {
  const config = path.resolve(webpackDir, "config.browser.js");
  const build = await run(execa("npx", ["webpack", "-c", config]));

  if (build.error) {
    onError("Web Build", build.error);
  }
}

async function main() {
  await buildForNode();
  await buildForWeb();
}

main();
