import chalk from "chalk";
import execa from "execa";
import readline from "readline";

export class OperationError extends Error {
  private readonly _isOperationError = true;

  static isOperationError(e: Error | OperationError): e is OperationError {
    if ("_isOperationError" in e) {
      return e._isOperationError === true;
    }
    return false;
  }

  constructor(name: string, data: string) {
    super("Operation Error");

    console.error(`[${chalk.red("✕")}] ${name}\n`);
    console.error(data);
    console.info("\n", chalk.redBright("Exiting"));
  }
}

export async function run<T>(promise: Promise<T>) {
  try {
    return {
      error: null,
      data: await promise,
    };
  } catch (e) {
    return { error: e as execa.ExecaError, data: null };
  }
}

export function onError(name: string, v: execa.ExecaError<string>) {
  throw new OperationError(name, v.stdout + "\n" + chalk.red(v.stderr));
}

export function onSuccess(name: string) {
  console.info(`[${chalk.green("✓")}] ${name}`);
}

export const stdin = (() => {
  return (message: string) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    return new Promise<string>((resolve) => {
      rl.question(message, (answer) => {
        rl.close();
        resolve(answer);
      });
    });
  };
})();
