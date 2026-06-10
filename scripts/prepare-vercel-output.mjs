import { cp, mkdir, rm, stat } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const siteDist = resolve(root, "apps/site/dist");
const dashboardDist = resolve(root, "apps/dashboard/dist");
const output = resolve(root, "dist-vercel");
const dashboardOutput = resolve(output, "dashboard");

async function assertDirectory(path) {
  const info = await stat(path);
  if (!info.isDirectory()) {
    throw new Error(`${path} is not a directory`);
  }
}

await assertDirectory(siteDist);
await assertDirectory(dashboardDist);
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(siteDist, output, { recursive: true });
await mkdir(dashboardOutput, { recursive: true });
await cp(dashboardDist, dashboardOutput, { recursive: true });

console.log("Vercel output ready at dist-vercel");
console.log("Public site: /");
console.log("Dashboard: /dashboard/");
