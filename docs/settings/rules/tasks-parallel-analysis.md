# Parallel Task Analysis Rules

## Purpose

Provide a consistent way to identify implementation tasks that can be safely executed in parallel when generating `tasks.md`.

---

## When to Mark a Task as Parallel

Only mark a task with **[P]** when **all** of the following are true:

1. **No data dependency** on pending tasks.
2. **No conflicting files or shared mutable resources** — the task touches different files/resources than other parallel candidates.
3. **No prerequisite review/approval** from another task is required before this one.
4. **Environment/setup work** needed by this task is already done or covered within the task itself.

---

## Marking Convention

- Add **[P]** to the task line for each parallel-capable task.
  - Example: `- [ ] T005 [P] Implement authentication middleware in src/middleware/auth.py`
  - Example: `- [ ] T012 [P] [1.1] Create User model in src/models/user.py`
- Place [P] after the Task ID and before the requirement label (if any). Order: `TaskID [P?] [Requirement?] Description`.
- If sequential execution is requested (e.g. `--sequential` flag), omit **[P]** entirely.
- Keep **[P]** outside the checkbox so it is not confused with completion state.

---

## Grouping & Ordering

- Group parallel-capable tasks in the same phase when they belong to the same theme (e.g. same requirement).
- In the task description, note any prerequisites or ordering caveats (e.g. “Requires schema from T004”).
- When two tasks look similar but are not parallel-safe, state the blocking dependency in the description and do not mark with [P].
- Evaluate each task line individually; there are no “container” tasks — every task is a single checklist item.

---

## Quality Checklist

Before marking a task with **[P]**, ensure:

- Running this task concurrently will not create merge or deployment conflicts.
- Any shared state expectations are clear from the task description or design.
- The implementation can be tested independently.

If any check fails, **do not** add **[P]** and make the dependency explicit in the task description.
