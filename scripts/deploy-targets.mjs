// Decides which apps the deploy workflow deploys.
//
// Env:
//   ALL=true        deploy every app
//   BEFORE=<sha>    previous commit on main; apps changed since then are deployed
//   GITHUB_SHA      current commit (defaults to HEAD)
//   GITHUB_OUTPUT   file for step outputs (optional, for GitHub Actions)
//
// Outputs:
//   teams  turbo --filter args for the team Workers
//   shell  "true" when the shell Worker must be deployed
import { execFileSync } from "node:child_process";
import { appendFileSync } from "node:fs";

const SHELL = "@tractor/shell";
const NO_COMMIT = /^0+$/;

const { ALL, BEFORE = "", GITHUB_SHA = "HEAD", GITHUB_OUTPUT } = process.env;
const deployAll = ALL === "true" || !BEFORE || NO_COMMIT.test(BEFORE);

const args = ["exec", "turbo", "ls", "--output=json"];
if (!deployAll) args.push("--affected");

const json = execFileSync("pnpm", args, {
  encoding: "utf8",
  env: {
    ...process.env,
    TURBO_TELEMETRY_DISABLED: "1",
    ...(deployAll
      ? {}
      : { TURBO_SCM_BASE: BEFORE, TURBO_SCM_HEAD: GITHUB_SHA }),
  },
});

const apps = JSON.parse(json.slice(json.indexOf("{")))
  .packages.items.filter((p) => p.path.startsWith("apps/"))
  .map((p) => p.name);

const teams = apps
  .filter((name) => name !== SHELL)
  .map((name) => `--filter=${name}`)
  .join(" ");
const shell = String(apps.includes(SHELL));

console.log(`Mode: ${deployAll ? "all apps" : `apps changed since ${BEFORE}`}`);
console.log(`Apps to deploy: ${apps.join(", ") || "none"}`);
if (GITHUB_OUTPUT) {
  appendFileSync(GITHUB_OUTPUT, `teams=${teams}\nshell=${shell}\n`);
} else {
  console.log(`teams=${teams}\nshell=${shell}`);
}
