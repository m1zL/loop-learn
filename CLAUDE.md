# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**loop-learn** — active recall meets spaced repetition. Currently in initial setup phase (no source code yet).

## Development Commands

Once the project is initialized, these commands are standard:

```bash
npm test          # Run tests
npm run lint      # Lint
npm run typecheck # Type check
```

## Workflow System

This project uses a skills-based workflow via `.claude/skills/skills/`. Key skills:

### `/setup-project`
Run once to create 6 foundational docs in `docs/`:
- `docs/product-requirements.md`
- `docs/functional-design.md`
- `docs/architecture.md`
- `docs/repository-structure.md`
- `docs/development-guidelines.md`
- `docs/glossary.md`

Reads initial requirements from `docs/ideas/` if present.

### `/add-feature [feature-name]`
Fully automated feature implementation. Creates a steering directory at `.steering/YYYYMMDD-[feature]/` with:
- `requirements.md` — feature requirements
- `design.md` — design decisions
- `tasklist.md` — tracked task list (source of truth for progress)

Then implements all tasks autonomously until `tasklist.md` is fully checked off, followed by validation, tests, and a retrospective.

### `/steering`
Used internally by `/add-feature`. Three modes: plan, implement, retrospective. **`tasklist.md` is the authoritative progress document** — always update it in real time with `Edit` tool as tasks complete.

### `/review-docs [path]`
Reviews existing documentation.

## Document Conventions

- Persistent project docs live in `docs/`
- Per-feature steering files live in `.steering/YYYYMMDD-[feature]/`
- `docs/development-guidelines.md` takes precedence over generic coding conventions when it exists
- Architecture decisions follow Git Flow branching; commits follow Conventional Commits
