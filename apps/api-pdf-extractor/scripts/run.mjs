// Cross-platform launcher for the FastAPI PDF extractor.
// Resolves the correct venv interpreter on Windows (.venv\Scripts) and
// macOS/Linux (.venv/bin), so the same pnpm scripts work on every OS.
import { spawnSync } from "node:child_process";
import path from "node:path";

const isWindows = process.platform === "win32";
const venvPython = path.join(
  ".venv",
  isWindows ? "Scripts" : "bin",
  isWindows ? "python.exe" : "python"
);

function run(command, args) {
  const result = spawnSync(command, args, { stdio: "inherit" });
  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }
  process.exit(result.status ?? 0);
}

// On Windows `python` is the real interpreter and `python3` is often a
// non-functional Store stub, so the preferred order is platform-specific.
function findSystemPython() {
  const candidates = isWindows ? ["python", "python3"] : ["python3", "python"];
  for (const candidate of candidates) {
    const probe = spawnSync(candidate, ["--version"], { stdio: "ignore" });
    if (probe.status === 0) return candidate;
  }
  console.error("No system Python found. Install Python 3 and ensure it is on PATH.");
  process.exit(1);
}

const mode = process.argv[2];

switch (mode) {
  case "setup": {
    const python = findSystemPython();
    spawnSync(python, ["-m", "venv", ".venv"], { stdio: "inherit" });
    spawnSync(venvPython, ["-m", "pip", "install", "--upgrade", "pip"], { stdio: "inherit" });
    run(venvPython, ["-m", "pip", "install", "-r", "requirements.txt"]);
    break;
  }
  case "dev":
    run(venvPython, ["-m", "uvicorn", "main:app", "--reload", "--port", "8000"]);
    break;
  case "start":
    run(venvPython, ["-m", "uvicorn", "main:app", "--port", "8000"]);
    break;
  default:
    console.error(`Unknown mode: ${mode}. Use one of: setup, dev, start.`);
    process.exit(1);
}
