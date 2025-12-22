import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const ERROR_START = 15;

function stripExt(name) {
  const extension = path.extname(name);
  if (!extension) {
    return name;
  }

  return name.slice(0, -extension.length);
}

function isEntryPoint(url) {
  const modulePath = fileURLToPath(url);
  const scriptPath = process.argv[1];
  const extension = path.extname(scriptPath);

  if (extension) {
    return modulePath === scriptPath;
  }

  return stripExt(modulePath) === scriptPath;
}

export { ERROR_START, isEntryPoint, stripExt };
