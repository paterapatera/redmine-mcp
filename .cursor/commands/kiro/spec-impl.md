<meta>
description: Execute spec tasks in phase order using TDD when test tasks exist
argument-hint: <feature-name:$1> [task-ids-or-requirement:$2 e.g. T001 or T001,T010 or 1.1]
</meta>

# Implementation Task Executor

<background_information>
- **Mission**: Execute implementation tasks in phase order based on approved specifications; use TDD when the task list includes test tasks (per tasks.md template).
- **Success Criteria**:
  - When test tasks exist: tests written and failing before implementation, then code makes them pass
  - All tests pass with no regressions
  - Tasks marked as completed (`- [x]`) in tasks.md
  - Implementation aligns with design.md and requirements
</background_information>

<instructions>
## Core Task
Execute implementation tasks for feature **$1** in phase order, using Test-Driven Development when test tasks are present (per tasks.md).

## Execution Steps

### Step 1: Load Context

**Read all necessary context**:
- `docs/specs/$1/spec.json`, `requirements.md`, `design.md`, `tasks.md`
- **Entire `docs/steering/` directory** for complete project memory

**Validate approvals**:
- Verify tasks are approved in spec.json (stop if not, see Safety & Fallback)

### Step 2: Select Tasks

**Parse tasks.md**:
- Task phases: Setup, Foundational, Requirement N…, Polish (per template)
- Task IDs (e.g. T001, T010), descriptions, file paths, parallel markers **[P]**, requirement labels (e.g. [1.1])
- Dependencies: phase order; within requirement, test tasks before implementation tasks

**Determine which tasks to execute**:
- If `$2` provided: Execute specified tasks by **task ID** (e.g. `T001` or `T001,T002,T010`) or by **requirement** (e.g. `1.1` = all tasks labeled [1.1])
- Otherwise: Execute all pending tasks (unchecked `- [ ]`) **in phase order**

### Step 4: Execute in Phase Order

- **Phase-by-phase**: Complete each phase before moving to the next (Setup → Foundational → Requirement phases → Polish)
- **Dependencies**: Sequential tasks in order; tasks marked **[P]** in the same phase may be run in parallel; tasks affecting the same file must run sequentially
- **TDD when tests exist**: For each requirement, run **test tasks** (if any) first and ensure they **fail**; then run implementation tasks to make them pass. (Tests are optional in tasks.md—only when the spec includes test tasks.)
- **Validation checkpoints**: After each phase, verify completion before proceeding

### Step 5: Per-Task TDD Cycle (when applicable)

For each selected task:

1. **RED** (if task is a test): Write failing test; confirm it fails
2. **GREEN**: Implement minimal code to pass the test / meet the task
3. **REFACTOR**: Clean up, remove duplication; all tests still pass
4. **VERIFY**: All tests pass, no regressions
5. **MARK COMPLETE**: Update checkbox from `- [ ]` to `- [x]` in tasks.md **immediately after** completing the task

### Step 6: Progress and Errors

- Report progress after each completed task
- If a non-parallel task fails: halt and fix before continuing
- For parallel [P] tasks: continue with successful ones; report failed tasks and suggest next steps
- Ensure every completed task is marked `- [x]` in tasks.md

## Critical Constraints
- **Phase order**: Respect Setup → Foundational → Requirements → Polish
- **TDD when test tasks exist**: Test tasks MUST be written and failing before implementation tasks for that requirement
- **Task scope**: Implement only what the specific task requires
- **No regressions**: Existing tests must continue to pass
- **Design alignment**: Implementation must follow design.md (and plan.md if present)
</instructions>

## Tool Guidance
- **Read first**: Load all context (and checklists if present) before implementation
- **Phase order**: Execute Setup → Foundational → Requirements → Polish
- **Test first**: When task list includes test tasks, run them before implementation for that requirement
- Use **WebSearch/WebFetch** for library documentation when needed

## Output Description

Provide brief summary in the language specified in spec.json:

1. **Tasks executed**: Task IDs (e.g. T001, T010) and test results
2. **Status**: Completed tasks marked in tasks.md, remaining count, phase checkpoints if relevant

**Format**: Concise (under 150 words)

## Safety & Fallback

### Error Scenarios

**Tasks Not Approved or Missing Spec Files**:
- **Stop Execution**: All spec files must exist and tasks must be approved
- **Suggested Action**: "Complete previous phases: `/kiro/spec-requirements`, `/kiro/spec-design`, `/kiro/spec-tasks`"

**Test Failures**:
- **Stop Implementation**: Fix failing tests before continuing
- **Action**: Debug and fix, then re-run

### Task Execution

**Execute by task ID** (per tasks.md format):
- `/kiro/spec-impl $1 T001` - Single task
- `/kiro/spec-impl $1 T001,T002,T010` - Multiple tasks

**Execute by requirement** (all tasks for that requirement):
- `/kiro/spec-impl $1 1.1` - All tasks labeled [1.1]

**Execute all pending** (in phase order):
- `/kiro/spec-impl $1` - All unchecked tasks


