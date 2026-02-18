---
description: 'Task list template for feature implementation'
---

# Tasks: [FEATURE NAME]

**Input**: Spec documents from `/docs/specs/$1/`
**Prerequisites**: requirements.md (required), design.md (required), research.md

**Tests**: The examples below include test tasks. Tests are OPTIONAL - only include them if explicitly requested in the feature specification.

**Organization**: Tasks are grouped by requirement to enable independent implementation and testing of each requirement.

## Format: `[ID] [P?] [Requirement] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Requirement]**: Which requirement this task belongs to (e.g., 1.1, 1.2, 2.1 — matches design.md traceability)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- **Web app**: `backend/src/`, `frontend/src/`
- **Mobile**: `api/src/`, `ios/src/` or `android/src/`
- Paths shown below assume single project - adjust based on design.md structure

<!--
  ============================================================================
  IMPORTANT: The tasks below are SAMPLE TASKS for illustration purposes only.

  The /kiro/spec-tasks command MUST replace these with actual tasks based on:
  - Requirements from requirements.md (with their priorities P1, P2, P3...)
  - Feature scope, data models, and contracts from design.md

  Tasks MUST be organized by requirement so each requirement can be:
  - Implemented independently
  - Tested independently
  - Delivered as an MVP increment

  DO NOT keep these sample tasks in the generated tasks.md file.
  ============================================================================
-->

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create project structure per design.md
- [ ] T002 Initialize [language] project with [framework] dependencies
- [ ] T003 [P] Configure linting and formatting tools

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY requirement can be implemented

**⚠️ CRITICAL**: No requirement work can begin until this phase is complete

Examples of foundational tasks (adjust based on your project):

- [ ] T004 Setup database schema and migrations framework
- [ ] T005 [P] Implement authentication/authorization framework
- [ ] T006 [P] Setup API routing and middleware structure
- [ ] T007 Create base models/entities that all requirements depend on
- [ ] T008 Configure error handling and logging infrastructure
- [ ] T009 Setup environment configuration management

**Checkpoint**: Foundation ready - requirement implementation can now begin in parallel

---

## Phase 3: Requirement 1 - [Title] (Priority: P1) 🎯 MVP

**Objective**: [Brief description of what this requirement delivers]

**Independent Test**: [How to verify this requirement works on its own]

### Tests for Requirement 1 (OPTIONAL - only if tests requested) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T010 [P] [1.1] Contract test for [endpoint] in tests/contract/test\_[name].py
- [ ] T011 [P] [1.1] Integration test for [user journey] in tests/integration/test\_[name].py

### Implementation for Requirement 1

- [ ] T012 [P] [1.1] Create [Entity1] model in src/models/[entity1].py
- [ ] T013 [P] [1.1] Create [Entity2] model in src/models/[entity2].py
- [ ] T014 [1.1] Implement [Service] in src/services/[service].py (depends on T012, T013)
- [ ] T015 [1.1] Implement [endpoint/feature] in src/[location]/[file].py
- [ ] T016 [1.1] Add validation and error handling
- [ ] T017 [1.1] Add logging for requirement 1 operations

**Checkpoint**: At this point, Requirement 1 should be fully functional and testable independently

---

## Phase 4: Requirement 2 - [Title] (Priority: P2)

**Objective**: [Brief description of what this requirement delivers]

**Independent Test**: [How to verify this requirement works on its own]

### Tests for Requirement 2 (OPTIONAL - only if tests requested) ⚠️

- [ ] T018 [P] [2.1] Contract test for [endpoint] in tests/contract/test\_[name].py
- [ ] T019 [P] [2.1] Integration test for [user journey] in tests/integration/test\_[name].py

### Implementation for Requirement 2

- [ ] T020 [P] [2.1] Create [Entity] model in src/models/[entity].py
- [ ] T021 [2.1] Implement [Service] in src/services/[service].py
- [ ] T022 [2.1] Implement [endpoint/feature] in src/[location]/[file].py
- [ ] T023 [2.1] Integrate with Requirement 1 components (if needed)

**Checkpoint**: At this point, Requirements 1 AND 2 should both work independently

---

## Phase 5: Requirement 3 - [Title] (Priority: P3)

**Objective**: [Brief description of what this requirement delivers]

**Independent Test**: [How to verify this requirement works on its own]

### Tests for Requirement 3 (OPTIONAL - only if tests requested) ⚠️

- [ ] T024 [P] [3.1] Contract test for [endpoint] in tests/contract/test\_[name].py
- [ ] T025 [P] [3.1] Integration test for [user journey] in tests/integration/test\_[name].py

### Implementation for Requirement 3

- [ ] T026 [P] [3.1] Create [Entity] model in src/models/[entity].py
- [ ] T027 [3.1] Implement [Service] in src/services/[service].py
- [ ] T028 [3.1] Implement [endpoint/feature] in src/[location]/[file].py

**Checkpoint**: All requirements should now be independently functional

---

[Add more requirement phases as needed, following the same pattern]

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple requirements

- [ ] TXXX [P] Documentation updates in docs/
- [ ] TXXX Code cleanup and refactoring
- [ ] TXXX Performance optimization across all requirements
- [ ] TXXX [P] Additional unit tests (if requested) in tests/unit/
- [ ] TXXX Security hardening

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all requirements
- **Requirements (Phase 3+)**: All depend on Foundational phase completion
  - Requirements can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired requirements being complete

### Requirement Dependencies

- **Requirement 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other requirements
- **Requirement 2 (P2)**: Can start after Foundational (Phase 2) - May integrate with 1.1 but should be independently testable
- **Requirement 3 (P3)**: Can start after Foundational (Phase 2) - May integrate with 1.1/2.1 but should be independently testable

### Within Each Requirement

- Tests (if included) MUST be written and FAIL before implementation
- Models before services
- Services before endpoints
- Core implementation before integration
- Requirement complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all requirements can start in parallel (if team capacity allows)
- All tests for a requirement marked [P] can run in parallel
- Models within a requirement marked [P] can run in parallel
- Different requirements can be worked on in parallel by different team members

---

## Parallel Example: Requirement 1

```bash
# Launch all tests for Requirement 1 together (if tests requested):
Task: "Contract test for [endpoint] in tests/contract/test_[name].py"
Task: "Integration test for [user journey] in tests/integration/test_[name].py"

# Launch all models for Requirement 1 together:
Task: "Create [Entity1] model in src/models/[entity1].py"
Task: "Create [Entity2] model in src/models/[entity2].py"
```

---

## Implementation Strategy

### MVP First (Requirement 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all requirements)
3. Complete Phase 3: Requirement 1
4. **STOP and VALIDATE**: Test Requirement 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add Requirement 1 → Test independently → Deploy/Demo (MVP!)
3. Add Requirement 2 → Test independently → Deploy/Demo
4. Add Requirement 3 → Test independently → Deploy/Demo
5. Each requirement adds value without breaking previous requirements

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: Requirement 1
   - Developer B: Requirement 2
   - Developer C: Requirement 3
3. Requirements complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Requirement] label maps task to specific requirement for traceability
- Each requirement should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate requirement independently
- Avoid: vague tasks, same file conflicts, cross-requirement dependencies that break independence
