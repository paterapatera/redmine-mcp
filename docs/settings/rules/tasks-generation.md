# Task Generation Rules

Tasks MUST be organized by requirement (from requirements.md) to enable independent implementation and testing of each requirement.

**Tests are OPTIONAL**: Only generate test tasks if explicitly requested in the feature specification or design.

---

## Checklist Format (REQUIRED)

Every task MUST strictly follow this format:

```text
- [ ] [TaskID] [P?] [Requirement?] Description with file path
```

### Format Components

1. **Checkbox**: ALWAYS start with `- [ ]` (markdown checkbox). Use `- [ ]*` only for optional, deferrable post-MVP test coverage when applicable.
2. **Task ID**: Sequential number in execution order (T001, T002, T003...).
3. **[P] marker**: Include ONLY if the task is parallelizable (different files, no dependencies on incomplete tasks). Omit when sequential mode is requested (e.g. `--sequential` flag).
4. **Requirement label**: For requirement-phase tasks only. Use numeric IDs from requirements.md (e.g. [1.1], [1.2], [2.1]).
   - Setup phase: NO requirement label  
   - Foundational phase: NO requirement label  
   - Requirement phases: MUST have requirement label  
   - Polish phase: NO requirement label  
5. **Description**: Clear action with exact file path so each task is immediately executable.

### Examples

- ✅ `- [ ] T001 Create project structure per design.md`
- ✅ `- [ ] T005 [P] Implement authentication middleware in src/middleware/auth.py`
- ✅ `- [ ] T012 [P] [1.1] Create User model in src/models/user.py`
- ✅ `- [ ] T014 [1.1] Implement UserService in src/services/user_service.py`
- ❌ `- [ ] Create User model` (missing Task ID and requirement label)
- ❌ `T001 [1.1] Create model` (missing checkbox)
- ❌ `- [ ] [1.1] Create User model` (missing Task ID)
- ❌ `- [ ] T001 [1.1] Create model` (missing file path)

---

## Phase Structure

- **Phase 1**: Setup (project initialization)
- **Phase 2**: Foundational (blocking prerequisites — MUST complete before any requirement work)
- **Phase 3+**: One phase per requirement, in priority order from requirements.md  
  - Within each phase: tests (if requested) → implementation tasks  
  - Each phase must be a complete, independently testable increment
- **Final Phase**: Polish & Cross-Cutting Concerns

---

## Task Organization

### 1. From Requirements (requirements.md) — PRIMARY

- Each requirement (with numeric IDs 1.1, 1.2, 2.1...) gets its own phase.
- Map to each requirement:
  - Models/entities needed
  - Services needed
  - Endpoints/UI needed
  - If tests requested: tests specific to that requirement
- Most requirements should be independently implementable and testable.

### 2. From Design (design.md)

- Map contracts/endpoints and components to the requirement they serve.
- If tests requested: contract/interface tests [P] before implementation in that requirement’s phase.
- Respect Architecture Pattern & Boundary Map and interface contracts.

### 3. From Setup/Infrastructure

- Shared infrastructure → Phase 1 (Setup)
- Blocking prerequisites for all requirements → Phase 2 (Foundational)
- Requirement-specific setup → within that requirement’s phase

---

## Task Integration & Progression

Every task must:

- Build on previous outputs (no orphaned code)
- Connect to the overall system (no hanging features)
- Progress in a logical, incremental order
- Respect architecture boundaries and contracts in design.md

End with integration tasks where needed to wire components together.

---

## Requirements Coverage

- **Mandatory**: ALL requirements in requirements.md MUST be covered by at least one task.
- Use numeric requirement IDs (e.g. N.M: Requirement 1 → 1.1, 1.2; Requirement 2 → 2.1, 2.2). All requirements MUST have numeric IDs; if any lack an ID, fix requirements.md before generating tasks.
- Cross-reference every requirement ID with task mappings. If gaps exist, return to requirements or design phase.
- Document any intentionally deferred requirements with rationale.

---

## Code-Only Focus

**Include ONLY**:

- Implementation tasks (coding)
- Testing tasks (unit, integration, E2E) when requested
- Technical setup (infrastructure, configuration)

**Exclude**:

- Deployment, documentation, user testing, marketing/business activities

---

## Optional Test Coverage

- When MVP delivery is prioritized and design already gives functional coverage, mark purely test-oriented follow-up work (e.g. extra unit tests for acceptance criteria) as **optional** with the `- [ ]*` checkbox.
- Use `- [ ]*` only for sub-tasks that directly reference acceptance criteria and can be deferred post-MVP.
- Never mark implementation or integration-critical verification as optional.

---

## Parallel Analysis

- By default, identify tasks that can run in parallel when **all** of the following hold:
  - No data dependency on other pending tasks
  - No shared file or resource contention
  - No prerequisite review/approval from another task
- Append **[P]** to the task line for each parallel-capable task (e.g. `- [ ] T005 [P] ...`).
- If sequential mode is requested, omit [P] entirely.
- See `docs/settings/rules/tasks-parallel-analysis.md` for full criteria and grouping guidelines.

---

## Task Sizing

- Aim for tasks that are completable in roughly 1–3 hours.
- Balance granularity: specific enough to execute without extra context, not so fine that overhead dominates.
- Let logical grouping (by requirement and dependency order) drive structure; avoid arbitrary limits on count.
