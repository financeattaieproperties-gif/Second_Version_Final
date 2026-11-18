# Roheen Development v1 — Codex CLI

A project-local Codex skill and optional live terminal monitor for Attaie Properties V2. No application code is modified by installing the skill.

## Install
Copy the **roheen-development** folder to your repository at `.agents/skills/roheen-development/`. Start a new Codex session in the repository root so the skill is discoverable. Ensure your Codex version supports project skills and, for parallel delegation, its multi-agent feature. The skill itself cannot enable capabilities unavailable in your Codex build.

Windows PowerShell (run in your repository root, adjusting the ZIP location):

```powershell
Expand-Archive "$HOME\Downloads\roheen-development.zip" -DestinationPath "$env:TEMP\roheen-skill" -Force
New-Item -ItemType Directory -Force .agents\skills | Out-Null
Copy-Item -Recurse -Force "$env:TEMP\roheen-skill\roheen-development" .agents\skills\
```

Then launch `codex` and request:

```text
Use $roheen-development. Remove the Total Calls card from the Call Center dashboard. Do not touch APIs or database tables.
```

Or:

```text
Use $roheen-development. Plan a Finance Manager dashboard following our V2 architecture. Stop for approval before implementation.
```

## Optional terminal monitor
Requires Node.js 18+ and Codex CLI installed and authenticated. Run from the repository root:

```bash
node .agents/skills/roheen-development/bin/roheen-monitor.mjs "Use $roheen-development. Update the Sales dashboard filter."
```

**PowerShell**: use single quotes around the prompt so `$roheen-development` is not expanded as a variable:

```powershell
node .agents/skills/roheen-development/bin/roheen-monitor.mjs 'Use $roheen-development. Update the Sales dashboard filter.'
```

The monitor launches `codex exec --json` and reads newline-delimited JSON events. It renders observed events, running commands, discovered agent threads, and recent messages; exact detail depends on your Codex version. It does **not** attach to an existing interactive `codex` session or bypass Codex permissions. `codex exec` is non-interactive: use regular interactive `codex` for FULL tasks that require approval, and approve the plan there before running implementation. Do not use an auto-approval/sandbox bypass to defeat the skill's approval gate.

Monitor options:

```bash
node .agents/skills/roheen-development/bin/roheen-monitor.mjs --help
node .agents/skills/roheen-development/bin/roheen-monitor.mjs --demo
```

The `--demo` command is **simulated** and is only for previewing the monitor, not actual agent work.

## Compatibility and limitations
- No extra npm dependencies; uses Node built-ins.
- Native Codex agent delegation and event formats vary by CLI release. The monitor displays only events that are actually emitted; it cannot guarantee each agent's detailed status or numerical progress.
- Run the monitor only on tasks that can proceed non-interactively. Use interactive Codex for planning/approval.
- The ZIP does not change the GitHub repository; install it locally or commit the skill folder yourself after review.
