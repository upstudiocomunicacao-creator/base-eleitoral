import { copyFileSync, cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const mainApp = resolve(root, "artifacts/base-eleitoral");
const essentialApp = resolve(root, "artifacts/base-eleitoral-essencial");
const mainPublic = resolve(mainApp, "dist/public");
const essentialDist = resolve(essentialApp, "dist");
const essentialPublic = resolve(mainPublic, "essencial");

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: "inherit",
    shell: process.platform === "win32",
    env: { ...process.env, ...options.env },
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

run("corepack", ["pnpm", "--dir", mainApp, "run", "build"], {
  env: { BASE_PATH: "/" },
});

run("corepack", ["pnpm", "--dir", essentialApp, "run", "build"], {
  env: { BASE_PATH: "/essencial/" },
});

rmSync(essentialPublic, { recursive: true, force: true });
mkdirSync(essentialPublic, { recursive: true });
cpSync(essentialDist, essentialPublic, { recursive: true });

const essentialIndex = resolve(essentialPublic, "index.html");
const fallbackIndex = resolve(essentialPublic, "404.html");
if (existsSync(essentialIndex)) {
  copyFileSync(essentialIndex, fallbackIndex);
}

console.log("Firebase hosting build ready: main app at / and Essencial at /essencial.");
