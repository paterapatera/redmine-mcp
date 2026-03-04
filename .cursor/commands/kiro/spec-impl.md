<meta>
description: Execute spec tasks in phase order using subagents; orchestrate context, planning, and per-phase execution, then summarize results
argument-hint: <feature-name:$1> [task-ids-or-requirement:$2 e.g. T001 or T001,T010 or 1.1]
</meta>

# Implementation Task Executor (Orchestrator)

<background_information>
- **Mission**: Run implementation for feature **$1** by delegating to subagents per phase, then summarize and display all results.
- **Your role**: Subagent **management** and **result summarization**. Do not implement tasks yourself; delegate to the phase subagents.
- **Success criteria**:
  - Context loaded and validated via subagent
  - Plan produced (phase-ordered task list)
  - Each phase executed by subagent (TDD when test tasks exist)
  - After each phase: validate-impl run; if NO-GO, spec-fixer run with report, then re-validate (proceed only when GO)
  - Single summary at the end in the language from spec.json
</background_information>

<instructions>
## Core Task

Orchestrate implementation for feature **$1** using subagents. Optional **$2**: task IDs (e.g. `T001`, `T001,T010`) or requirement (e.g. `1.1`). If omitted, run all pending tasks in phase order.

## Execution Flow

### Step 1: Load Context (Subagent)

**Invoke the `spec-impl-context` subagent** with feature **$1**.

- It validates using `spec.json` (approval) and verifies that requirements.md, design.md, tasks.md exist.
- If the subagent reports **Approved: no** or missing spec files: **stop** and show its message (e.g. complete `/kiro/spec-requirements`, `/kiro/spec-design`, `/kiro/spec-tasks`). Do not proceed to planning or execution.

### Step 2: Plan Tasks (Subagent)

**Invoke the `spec-impl-planner` subagent** with feature **$1** and optional **$2**.

- Obtain the **phase-ordered plan**: which phases to run and the ordered task list per phase.
- If the plan is empty (e.g. no pending tasks), report that and exit.

### Step 3: Execute Phases (Subagent per Phase)

For **each phase** in the plan (Setup → Foundational → Requirement phases → Polish):

1. **Invoke the `spec-impl-phase-executor` subagent** with:
   - Feature **$1**
   - Phase name
   - Ordered task list for that phase (from the planner output)
2. **Collect** the phase result (tasks executed, test results, completed, errors, stopped).
3. If the phase result reports **Stopped: yes** (e.g. test failure or blocking error): **halt** the run, include this phase in the summary, and do not start the next phase until the user resolves the issue.
4. **After each phase executor completion** (and only when not stopped):
   - **Invoke the `validate-impl` subagent** with feature **$1** and, if available, the task IDs just completed in this phase (so validation is scoped to the current phase).
   - If the validation report **Decision** is **NO-GO**: **invoke the `spec-fixer` subagent** with the full validation report content in the prompt (Issues, Decision, next steps). After spec-fixer finishes, re-invoke **validate-impl** for feature **$1** to confirm GO; if still NO-GO, include the remaining issues in the summary and **halt** (do not start the next phase) so the user can address them.
   - If **GO** (or after spec-fixer achieved GO): proceed to the next phase.

### Step 4: Summarize and Display Results

Aggregate all subagent outputs and produce **one summary** in the language specified in spec.json:

1. **Context**: Feature, approved (yes).
2. **Plan**: Phases that were run (and optionally task count per phase).
3. **Per-phase**: Phase name → tasks executed, test results (pass/fail), completed task IDs, any errors; validation result (GO/NO-GO) and whether spec-fixer was run (and re-validation result if applicable).
4. **Overall**: Total completed tasks, remaining pending (if any), and any critical errors or next steps.

**Format**: Concise (under 200 words for the summary; per-phase details can be short bullet lists).
</instructions>

## Tool Guidance

- **Delegate, do not implement**: Use `spec-impl-context`, `spec-impl-planner`, `spec-impl-phase-executor`, **validate-impl**, and **spec-fixer** for their steps; you only orchestrate and summarize.
- **Phase order**: Respect Setup → Foundational → Requirements → Polish; run one phase at a time.
- **After each phase**: Run validate-impl for **$1** (and completed task IDs when useful); if NO-GO, run spec-fixer with the report, then re-validate; halt before the next phase if GO is not achieved after fixing.
- **Stop on failure**: If a phase executor reports a blocking failure, do not start the next phase; summarize up to that point and suggest fixing before re-running.

## Output Description

Final output must include:

1. **Subagent results**: Brief mention of context (ok/stop), plan (phases + task counts), and each phase result (executed, tests, completed, errors).
2. **Unified summary**: Tasks executed (by ID), status (completed count, remaining), phase checkpoints, and any suggested next actions.

**Format**: Concise (under 200 words for the final summary).

## Safety & Fallback

- **Tasks not approved or missing spec files**: Stop after `spec-impl-context`; show the subagent’s message; suggest completing previous Kiro phases.
- **Test failures**: Stop after the phase that failed; include that phase’s result in the summary; suggest debugging and re-running.
- **Task execution examples** (unchanged):
  - `/kiro/spec-impl $1 T001` — single task
  - `/kiro/spec-impl $1 T001,T002,T010` — multiple tasks
  - `/kiro/spec-impl $1 1.1` — all tasks for requirement 1.1
  - `/kiro/spec-impl $1` — all pending tasks in phase order
