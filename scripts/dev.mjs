// Cross-platform dev launcher.
// Starts the Postgres container only when it is not already running, then
// launches the API, web and PDF extractor apps together.
import { spawn, spawnSync } from "node:child_process";

const COMPOSE_PROJECT = "spend-track";
const COMPOSE_FILE = "infra/docker-compose.dev.yml";
const DB_CONTAINER = "spend-track-db";
const DB_READY_ATTEMPTS = 30;
const DB_READY_DELAY_MS = 1000;

// `docker` is a real executable on every platform, so these calls never go
// through a shell: cmd.exe would mangle the `^` and `{{ }}` in the arguments.
function ensureDockerIsAvailable() {
  const probe = spawnSync("docker", ["info"], { stdio: "ignore" });
  if (probe.status !== 0) {
    console.error("Docker is not available. Start Docker Desktop and try again.");
    process.exit(1);
  }
}

function isDatabaseRunning() {
  const result = spawnSync(
    "docker",
    ["ps", "--filter", `name=^/${DB_CONTAINER}$`, "--filter", "status=running", "--format", "{{.Names}}"],
    { encoding: "utf8" }
  );
  return result.stdout?.trim() === DB_CONTAINER;
}

function startDatabase() {
  const result = spawnSync(
    "docker",
    ["compose", "-p", COMPOSE_PROJECT, "-f", COMPOSE_FILE, "up", "-d"],
    { stdio: "inherit" }
  );
  if (result.status !== 0) {
    console.error("Failed to start the database container.");
    process.exit(1);
  }
}

// Blocks the thread without spawning a platform-specific sleep command.
function sleepSync(milliseconds) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, milliseconds);
}

// A freshly started Postgres accepts connections a few seconds after the
// container is up, so the apps must not boot before it is ready.
function waitForDatabase() {
  for (let attempt = 1; attempt <= DB_READY_ATTEMPTS; attempt++) {
    const probe = spawnSync("docker", ["exec", DB_CONTAINER, "pg_isready", "-U", "postgres"], {
      stdio: "ignore",
    });
    if (probe.status === 0) return;
    sleepSync(DB_READY_DELAY_MS);
  }
  console.error(`Database did not become ready after ${DB_READY_ATTEMPTS} attempts.`);
  process.exit(1);
}

// Passed as one string because a shell is required to resolve `pnpm` on
// Windows, and a shell discards the quoting of an argument array.
function startApps() {
  const command = [
    "pnpm exec concurrently -k -n api,web,pdf",
    '"pnpm dev:api"',
    '"pnpm dev:web"',
    '"pnpm dev:pdf"',
  ].join(" ");

  const child = spawn(command, { stdio: "inherit", shell: true });
  child.on("exit", (code) => process.exit(code ?? 0));
}

ensureDockerIsAvailable();

if (isDatabaseRunning()) {
  console.log(`Database container "${DB_CONTAINER}" is already running.`);
} else {
  console.log(`Starting database container "${DB_CONTAINER}"...`);
  startDatabase();
  waitForDatabase();
  console.log("Database is ready.");
}

startApps();
