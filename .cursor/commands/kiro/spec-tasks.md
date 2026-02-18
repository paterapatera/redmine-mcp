<meta>
description: Generate implementation tasks for a specification
argument-hint: <feature-name:$1> [-y:$2] [--sequential:$3]
</meta>

# Implementation Tasks Generator

<background_information>
- **Mission**: Generate an actionable, dependency-ordered tasks.md for the feature based on approved requirements and design.
- **Success Criteria**:
  - All requirements mapped to specific tasks (organized by requirement for independent implementation and testing)
  - Tasks in strict checklist format with Task ID, [P?], requirement label, and clear description with file path
  - Phase structure: Setup → Foundational → one phase per requirement → Polish
  - Each requirement phase independently testable
</background_information>

<instructions>
## Core Task
Generate implementation tasks for feature **$1** based on approved requirements and design.

## Execution Steps

### Step 1: Load Context

**Read all necessary context**:
- `docs/specs/$1/spec.json`, `requirements.md`, `design.md`
- `docs/specs/$1/tasks.md` (if exists, for merge mode)
- `docs/specs/$1/research.md` (optional, if exists)
- **Entire `docs/steering/` directory** for complete project memory

**Validate approvals**:
- If `-y` flag provided ($2 == "-y"): Auto-approve requirements and design in spec.json
- Otherwise: Verify both approved (stop if not, see Safety & Fallback)
- Determine sequential mode: `sequential = ($3 == "--sequential")`

Feature: $1
Spec directory: docs/specs/$1/
Auto-approve: {true if $2 == "-y", else false}
Sequential mode: {true if sequential else false}

File patterns to read:
- docs/specs/$1/*.{json,md}
- docs/steering/*.md
- docs/settings/rules/tasks-generation.md
- docs/settings/rules/tasks-parallel-analysis.md (include only when sequential mode is false)
- docs/settings/templates/specs/tasks.md

Mode: {generate or merge based on tasks.md existence}

### Step 2: Generate Implementation Tasks

**Task format (REQUIRED)** — every task MUST follow:

```text
- [ ] [TaskID] [P?] [Requirement?] Description with file path
```

**Format components**:
1. **Checkbox**: ALWAYS `- [ ]` (use `- [ ]*` only for optional deferrable post-MVP test coverage when applicable)
2. **Task ID**: Sequential in execution order (T001, T002, T003...)
3. **[P] marker**: Include ONLY if task is parallelizable (different files, no dependencies on incomplete tasks). Omit all [P] when `sequential == true`.
4. **Requirement label**: For requirement-phase tasks only. Use numeric IDs from requirements.md (e.g. [1.1], [1.2], [2.1]). Setup, Foundational, and Polish phases: NO requirement label.
5. **Description**: Clear action with exact file path.

**Phase structure**:
- **Phase 1**: Setup (project initialization)
- **Phase 2**: Foundational (blocking prerequisites — MUST complete before any requirement work)
- **Phase 3+**: One phase per requirement (priority order from requirements.md). Within each: tests (if requested) → implementation tasks. Each phase independently testable.
- **Final Phase**: Polish & Cross-Cutting Concerns

**Generation rules**:
- Use language specified in spec.json
- Map ALL requirements to tasks; list requirement IDs only (comma-separated) where required, no extra labels or narration
- Organize tasks by requirement so each requirement can be implemented and tested independently
- Include exact file paths in task descriptions
- Apply [P] only when parallel criteria are met (omit when sequential)
- Tests are OPTIONAL: only include test tasks if explicitly requested in the feature specification or design
- If existing tasks.md found, merge with new content
- Follow principles in docs/settings/rules/tasks-generation.md; when sequential is false, use tasks-parallel-analysis.md for [P] criteria

### Step 3: Finalize

**Write and update**:
- Create/update `docs/specs/$1/tasks.md`
- Update spec.json metadata:
  - Set `phase: "tasks-generated"`
  - Set `approvals.tasks.generated: true, approved: false`
  - Set `approvals.requirements.approved: true`
  - Set `approvals.design.approved: true`
  - Update `updated_at` timestamp

## Critical Constraints
- **Checklist format**: Every task MUST have checkbox, Task ID (T001…), [P?] when applicable, requirement label for requirement phases, and description with file path
- **Complete coverage**: ALL requirements must map to tasks
- **Task integration**: Every task must connect to the system (no orphaned work)
- **Requirement organization**: Tasks grouped by requirement to enable independent implementation and testing
</instructions>

## Tool Guidance
- **Read first**: Load all context, rules, and templates before generation
- **Write last**: Generate tasks.md only after complete analysis and verification

## Output Description

Provide brief summary in the language specified in spec.json:

1. **Status**: Confirm tasks generated at `docs/specs/$1/tasks.md`
2. **Task summary**:
   - Total task count (T001…TNNN)
   - Task count per requirement (or phase)
   - All requirements covered
   - Parallel opportunities identified (if not sequential)
3. **Quality validation**:
   - ✅ All requirements mapped to tasks
   - ✅ Format: checklist, ID, labels, file paths
   - ✅ Dependencies and execution order clear
4. **Next action**: Review tasks and proceed when ready

**Format**: Concise (under 200 words)

## Safety & Fallback

### Error Scenarios

**Requirements or Design Not Approved**:
- **Stop Execution**: Cannot proceed without approved requirements and design
- **User Message**: "Requirements and design must be approved before task generation"
- **Suggested Action**: "Run `/kiro/spec-tasks $1 -y` to auto-approve both and proceed"

**Missing Requirements or Design**:
- **Stop Execution**: Both documents must exist
- **User Message**: "Missing requirements.md or design.md at `docs/specs/$1/`"
- **Suggested Action**: "Complete requirements and design phases first"

**Incomplete Requirements Coverage**:
- **Warning**: "Not all requirements mapped to tasks. Review coverage."
- **User Action Required**: Confirm intentional gaps or regenerate tasks

**Template/Rules Missing**:
- **User Message**: "Template or rules files missing in `docs/settings/`"
- **Fallback**: Use inline basic structure with warning
- **Suggested Action**: "Check repository setup or restore template files"

**Missing Numeric Requirement IDs**:
- **Stop Execution**: All requirements in requirements.md MUST have numeric IDs. If any requirement lacks a numeric ID, stop and request that requirements.md be fixed before generating tasks.

### Next Phase: Implementation

**Before Starting Implementation**:
- **IMPORTANT**: Clear conversation history and free up context before running `/kiro/spec-impl`
- This applies when starting first task OR switching between tasks
- Fresh context ensures clean state and proper task focus

**If Tasks Approved**:
- Execute specific task: `/kiro/spec-impl $1 T001` (recommended: clear context between each task)
- Execute multiple tasks: `/kiro/spec-impl $1 T001,T002` (use cautiously, clear context between tasks)
- Without arguments: `/kiro/spec-impl $1` (executes all pending tasks — NOT recommended due to context bloat)

**If Modifications Needed**:
- Provide feedback and re-run `/kiro/spec-tasks $1`
- Existing tasks used as reference (merge mode)

**Note**: The implementation phase will guide you through executing tasks with appropriate context and validation.
