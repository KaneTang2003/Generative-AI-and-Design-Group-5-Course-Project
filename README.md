# Idea Atlas — Cluster & Interpret Update

This version builds on the original Idea Atlas prototype, adding selected principles from our **Cluster & Interpret skill**. The aim is to retain the prototype’s practical clustering workflow while making its interpretations more transparent, provisional, and open to discussion.

## What stays the same

The prototype remains the foundation. This update preserves:

- Purpose-based grouping, considering the problem, intended beneficiary, outcome, and context of each idea.
- The two-level structure of broad themes and specific clusters.
- Automatic or user-specified cluster counts.
- Overlapping memberships when an idea meaningfully belongs to multiple clusters.
- Outlier handling for ideas without a strong thematic fit.
- The existing map and card views, manual editing, browser storage, and TXT/JSON exports.

## What has changed

### 1. Interpretations are provisional

Theme and cluster explanations now describe **possible readings** of the supplied ideas rather than definitive conclusions.

The AI is instructed to explain meaningful relationships without inventing motives, context, or deeper meanings that the input cannot support. Brainstorming ideas must not be presented as verified research findings or established user needs.

### 2. Explanations reference their sources

Each newly generated theme and cluster includes references to the original idea IDs supporting its explanation. These references can be expanded in the interface to read the original text and are included in exports.

Here, “source” means a supplied brainstorming idea—not independently verified research evidence. This version does not introduce an external evidence upload workflow or generate external citations.

### 3. Alternative interpretations can coexist

Where the input supports more than one meaningful reading, the result can retain alternative interpretations without selecting a preferred one.

An alternative interpretation does not automatically create another cluster or change an idea’s membership. This keeps interpretive possibilities separate from the existing overlap mechanism.

Alternatives are optional: the AI should leave them empty when no supported alternative emerges.

### 4. Contradictions can contribute to interpretation

Ideas addressing the same context may express competing approaches, expectations, or outcomes. The revised logic allows these tensions to be explained and linked to the relevant original ideas.

An idea should not become an outlier simply because it disagrees with others. Genuinely unrelated ideas still follow the prototype’s existing outlier rules.

## How this is implemented

The update connects these principles across the AI prompt, response structure, validation, interface, and exports.

Existing `explanation` fields remain in use. A new `interpretationNotes` field records:

- The theme or cluster being discussed.
- The original idea IDs supporting its explanation.
- Supported alternative readings.
- Supported tensions or contrasting readings.

Programmatic checks validate references and coverage. They do **not** establish whether an interpretation is semantically convincing; that still requires human review.

The additional information appears within the existing theme and cluster explanation sections and is retained in TXT and JSON exports.

## Compatibility and manual editing

Existing saved boards and the fixed demo remain compatible. The demo has not been rewritten to simulate the new interpretation features.

Manual changes do not automatically regenerate AI explanations or interpretation notes. The interface and text export make clear that these reflect the original AI grouping.

The original sharing package is unchanged; this update was developed in a separate copy.

## Validation and current limitations

- **19 logic checks passed**, covering source references, existing grouping constraints, legacy demo compatibility, manual editing, and exports.
- **TypeScript checks passed for the modified application code and its dependencies.**
- Full-project TypeScript validation remains blocked by connector files missing from the original sharing package.
- Live Gemini output, browser rendering, and a complete deployment have not yet been verified.

These checks confirm structural behavior, not improved interpretation quality. The next evaluation should compare the original and revised versions on the same inputs, examining whether the added explanations remain grounded, useful, and appropriately cautious.
