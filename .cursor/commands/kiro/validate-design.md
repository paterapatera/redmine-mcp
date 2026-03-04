<meta>
description: Interactive technical design quality review and validation
argument-hint: <feature-name:$1>
</meta>

## Outline

**Goal:** Conduct interactive quality review of technical design for feature **$1**. Critical issues are presented one at a time; you choose how to address each (fix, accept risk, or reject), then the design document is updated and a GO/NO-GO decision is given.

**Success criteria:**
- Critical issues limited to at most 3
- Balanced assessment with strengths recognized
- Clear GO/NO-GO decision with rationale
- Actionable corrections applied to design.md based on your choices

Execution steps:

1. **Load Context**
   - Read `docs/specs/$1/spec.json` for language and metadata
   - Read `docs/specs/$1/requirements.md` for requirements
   - Read `docs/specs/$1/design.md` for design document
   - **Load ALL steering context**: Read entire `docs/steering/` directory including:
     - Default files: `structure.md`, `tech.md`, `product.md`
     - All custom steering files (regardless of mode settings)
   - Read `docs/settings/rules/design-review.md` for review criteria and process

2. **Perform Design Review (Internal)**
   - Follow design-review.md: Analysis → Critical Issues (≤3) → Strengths → tentative GO/NO-GO
   - Limit to 3 most important concerns; only those significantly impacting success
   - For each critical issue, prepare: Brief title, Concern, Impact, Suggestion (concrete improvement), Traceability (requirement ID/section), Evidence (design.md section)
   - Use language specified in spec.json for all user-facing output

3. **Present Summary and Start Correction Loop**
   - Output a short **Review Summary** (2–3 sentences) and **Design Strengths** (1–2 points)
   - If there are **no critical issues**: skip to step 6 (Final Assessment)
   - If there are critical issues: list only their **titles** (e.g. "Issue 1: …", "Issue 2: …"), then state that you will address each one in turn with choices. Do **not** reveal the full text of issues 2 and 3 until their turn.

4. **Sequential Correction Loop (One Issue at a Time)**
   - For each critical issue (1, then 2, then 3):
     - Present **only that issue** in full: title, Concern, Impact, Evidence (design section). Optionally one line of Suggestion.
     - Propose a **recommended option** with brief reasoning (1–2 sentences), e.g. "**Recommended:** Option A - <reasoning>"
     - Present choices in a Markdown table:

     | Option | Description |
     |--------|-------------|
     | A | Apply the suggested fix to design.md (concretely describe the change) |
     | B | Apply an alternative fix (describe it briefly; omit if no sensible alternative) |
     | C | Accept risk / document as known limitation (add one line to design.md) |
     | D | Reject the concern (no change; you disagree with the assessment) |

     - After the table, add: `You can reply with the option letter (e.g., "A"), accept the recommendation by saying "yes" or "recommended", or describe a different short correction.`
   - After the user answers:
     - If the user says "yes" or "recommended", treat the answer as the recommended option.
     - If the user gives a free-form correction, treat it as a variant of A (apply that correction to design.md).
     - Once the choice is clear, **apply the outcome** (see step 5) and then move to the **next** issue. Do not reveal the next issue’s full text until the previous one is resolved.
   - Stop after all identified critical issues (max 3) have been processed, or if the user signals completion ("done", "proceed", "no more").

5. **Apply Corrections to design.md (Incremental)**
   - For **Option A or B** (or user’s custom fix): Edit `docs/specs/$1/design.md` so that the agreed fix is reflected in the relevant section. Preserve structure and formatting; make minimal, testable edits.
   - For **Option C**: Append or add one short line in the appropriate section (e.g. "Known limitation: …") and save.
   - For **Option D**: No edit; record that the concern was rejected.
   - Save the file **after each** accepted correction to avoid context loss.
   - If the correction invalidates earlier text in design.md, update or remove that text instead of leaving contradictions.

6. **Final Assessment**
   - After the correction loop (or when there were no critical issues), output **Final Assessment**:
     - **Decision**: GO or NO-GO with clear rationale (1–2 sentences)
     - **Next steps**:
       - **If GO**: Suggest reviewing the updated design, then `/kiro/spec-tasks $1` (or `-y` to auto-approve)
       - **If NO-GO**: Suggest addressing remaining critical gaps, re-running `/kiro/spec-design $1`, then `/kiro/validate-design $1` again

7. **Report**
   - Number of critical issues presented and how each was resolved (Fixed / Accept risk / Rejected)
   - Path to updated design: `docs/specs/$1/design.md`
   - Sections touched (if any)
   - Suggested next command

## Important Constraints
- **Quality assurance, not perfection seeking**: Accept acceptable risk
- **Critical focus only**: Maximum 3 issues; only those significantly impacting success
- **One issue at a time**: Never show the next issue’s full detail until the current one is resolved
- **Balanced assessment**: Always state strengths before or with the summary
- **Actionable feedback**: All suggestions must be implementable; options A/B must be concrete

## Tool Guidance
- **Read first**: Load all context (spec, steering, design-review rules) before the review
- **Grep if needed**: Search codebase for pattern validation or integration checks
- **Interactive**: One question (one issue) per turn; wait for user choice before proceeding

## Safety & Fallback

### Error Scenarios
- **Missing design**: If `design.md` does not exist, stop with: "Run `/kiro/spec-design $1` first to generate design document."
- **Design not generated**: If design phase is not marked as generated in spec.json, warn but proceed with review
- **Empty steering directory**: Warn that project context is missing and may affect review quality
- **Language undefined**: Default to English (`en`) if spec.json does not specify language

### Next Phase: Task Generation
- **If GO**: Apply any remaining edits from the loop, then suggest `/kiro/spec-tasks $1` or `/kiro/spec-tasks $1 -y`
- **If NO-GO**: Suggest fixing critical issues, re-running `/kiro/spec-design $1`, then `/kiro/validate-design $1` again

**Note:** Design validation is recommended but optional. This flow uses dialogue and multiple-choice corrections so you can steer how each concern is resolved before the final GO/NO-GO.
