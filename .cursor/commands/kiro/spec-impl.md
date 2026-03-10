<meta>
description: Load context, read tasks.md to get task list, then run each task via spec-impl-task-executor; summarize results
argument-hint: <feature-name:$1> [task-ids-or-requirement:$2 e.g. T001 or T001,T010 or 1.1]
</meta>

# Implementation (Orchestrator)

<background_information>
- **Mission**: Run implementation for feature **$1** by reading tasks.md, then delegating each task to **spec-impl-task-executor** and summarizing results.
- **Your role**: Load context, plan from tasks.md, orchestrate task execution, and summarize. Do not implement tasks yourself; delegate each task to the task executor.
- **Success criteria**: Context validated; task list from tasks.md (scope from $2); each task run by task executor (validation and fixes inside executor); one summary at the end in the language from spec.json.
</background_information>

<instructions>
## Core Task

Run implementation for feature **$1**. Optional **$2**: task IDs (e.g. `T001`, `T001,T010`) or requirement (e.g. `1.1`). If omitted, run all pending tasks in order.

## Execution Flow

### Step 1: Load Context (Subagent)

**Invoke the `spec-impl-context` subagent** with feature **$1**.

- It validates using `spec.json` (approval) and verifies that requirements.md, design.md, tasks.md exist.
- If **Approved: no** or missing spec files: **stop** and show its message. Do not proceed.

### Step 2: Read tasks.md and Build Task List

**Read** `docs/specs/<feature>/tasks.md` (and optionally `docs/specs/<feature>/spec.json` for language).

- **Parse tasks.md**: Identify phases (Setup → Foundational → Requirement phases → Polish). For each task: ID, description, whether it is **[P]** (parallel), requirement label (e.g. [1.1]). Within a requirement phase, test tasks before implementation tasks.
- **Resolve scope from $2**:
  - **$2 empty**: list all **pending** tasks (unchecked `- [ ]`) in phase order.
  - **$2 = task IDs** (e.g. `T001` or `T001,T010`): list those tasks in phase/dependency order.
  - **$2 = requirement** (e.g. `1.1`): list all tasks labeled `[1.1]` in order (tests before impl).
- **Output (internal)**: An ordered list of tasks. For each task: task ID, description, phase name, **parallel [P]**: yes/no.
- If the list is empty (e.g. no pending tasks), report that and exit.

### Step 3: Execute Tasks (Task Executor per Task)

For **each task** in the list from Step 2:

1. **Invoke the `spec-impl-task-executor` subagent** with: feature **$1**, task ID and description, phase name.
2. **Collect** the Task Result (Task, Test results, Validation result, Completed, Errors).
3. **If the task is not [P] and (Completed is no or Errors)**: **stop**; record the failure; go to Step 4.
4. **If the task is [P] and failed**: record the failed task ID and error; continue with the next task.

**Example delegation:** "Use the spec-impl-task-executor subagent to execute this task for feature &lt;$1&gt;, phase &lt;phase name&gt;: [task ID] &lt;task description&gt;."

**Failed [P] tasks:** In the summary, list each failed [P] task and recommend retrying via task executor or re-running this command with those task IDs.

### Step 4: Summarize and Display Results

Produce **one summary** in the language from spec.json:

- **Context**: Feature, approved (yes).
- **Tasks**: Executed (by ID), completed count, any errors.
- **Validation**: GO/NO-GO from task results.
- **Failed [P] tasks** (if any): IDs and suggested retry.

**Format**: Concise (under 200 words).

## Tool Guidance

- Use **spec-impl-context** and **spec-impl-task-executor** only; you read tasks.md yourself and orchestrate. Validation and fixes run inside the task executor.
- **Order**: Execute tasks in the order from tasks.md (phase order; within a requirement, tests before impl). Respect [P]: stop on non-[P] failure; on [P] failure record and continue.
- **Failed [P] tasks**: Include in summary with recommended retry (task executor or re-run with those IDs).

## Output Description

- **Subagent results**: Context (ok/stop), task list used, each task result (executed, tests, validation, completed, errors).
- **Summary**: Tasks run, completed count, validation outcome, failed [P] tasks and next actions. Concise.

## Safety & Fallback

- **Not approved or missing spec files**: Stop after spec-impl-context; suggest completing prior Kiro phases.
- **Non-[P] task failure**: Stop after that task; suggest debugging and re-running (e.g. with that task ID).
- **Examples**: `/kiro/spec-impl $1` (all pending), `/kiro/spec-impl $1 T001`, `/kiro/spec-impl $1 T001,T002`, `/kiro/spec-impl $1 1.1`.
</instructions>
