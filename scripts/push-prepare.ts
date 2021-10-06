import execa from "execa";
import simpleGit from "simple-git/promise";
import { onError, onSuccess, OperationError, run } from "./libs";
import { Script } from "./script-names";

const git = simpleGit();

async function hasUncommittedChanges() {
  const status = await git.status();

  return (
    status.not_added.length > 0 ||
    status.created.length > 0 ||
    status.deleted.length > 0 ||
    status.modified.length > 0 ||
    status.renamed.length > 0 ||
    status.staged.length > 0
  );
}

async function gitAdd() {
  await git.add(".");
}

async function build() {
  const name = "Build";
  const result = await run(execa("npm", ["run", Script.BUILD]));
  if (result.error) {
    return onError(name, result.error);
  }
  return onSuccess(name);
}

async function lint() {
  const name = "Lint";
  const result = await run(execa("npm", ["run", Script.LINT]));
  if (result.error) {
    return onError(name, result.error);
  }
  return onSuccess(name);
}

async function tsc() {
  const name = "TypeScript";
  const result = await run(execa("npm", ["run", Script.COMPILE_TEST]));
  if (result.error) {
    return onError(name, result.error);
  }
  return onSuccess(name);
}

async function pretty() {
  const name = "Prettier";
  const result = await run(execa("npm", ["run", Script.PRETTIER_CHECK]));
  if (result.error) {
    return onError(name, result.error);
  }
  return onSuccess(name);
}

async function test() {
  const name = "Tests";
  const result = await run(execa("npm", ["run", Script.TEST]));
  if (result.error) {
    return onError(name, result.error);
  }
  return onSuccess(name);
}

async function main() {
  try {
    await Promise.all([tsc(), lint(), pretty(), test()]);
    await build();

    if (await hasUncommittedChanges()) {
      await gitAdd();
      throw new OperationError("Git", "Commit your changes!");
    }
  } catch (e) {
    if (!(e instanceof Error && OperationError.isOperationError(e))) {
      new OperationError("Unknown Error", `${e}`);
    }

    process.exit(1);
  }

  return true;
}

main();
