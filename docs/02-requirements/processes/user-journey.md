# Plant Care — User Journey (As-is / To-be)

> **Status:** Draft business process · **Not an existing UI screenshot or implemented UX**

## Primary persona and trigger

**Beginner indoor plant owner** has a plant, wants to know what it is and how to maintain it without forgetting key checks.

## As-is journey (hypothesis to validate)

```mermaid
flowchart LR
  A["Unknown plant / unclear symptoms"] --> B["Search web or ask others"]
  B --> C["Remember or write down advice"]
  C --> D["Check plant irregularly"]
  D --> E["Uncertainty remains"]
```

No user research has yet validated every step of this as-is journey.

## To-be journey (MVP proposal)

```mermaid
journey
    title Plant Care — planned user experience
    section Discover
      Upload plant photo: 4: User
      Read identity and basic care guidance: 4: User
    section Organize
      Save plant profile: 4: User
      Supply or skip context questions: 3: User
    section Plan
      Read AI proposed care plan: 4: User
      Accept or reject: 3: User
    section Maintain
      Review scheduled checklist: 4: User
      Complete, skip or undo a task: 4: User
      Check overdue and task history: 4: User
```

Scores in Mermaid are **illustrative sentiment only** and not measured satisfaction data.

## Journey details

| Stage | User action | System response | Potential friction | Related feature |
|---|---|---|---|---|
| Discover | Upload image | Return identity, requirements, textual care recommendation | Wrong/uncertain identification | Plant Identification — API exists |
| Organize | Save plant | Persist plant profile | Login and plant ownership not chosen | My Plant Collection — Planned |
| Personalize | Answer or skip questions | Preserve unknown data; distinguish generic vs personalized | Extra questions cause abandonment | Progressive Personalization — Planned |
| Approve | Accept/Reject proposed plan | Accept activates schedules; Reject does not | Reject without alternative is dead-end | Care Planning — Planned |
| Maintain | Complete/Skip/Undo each task | Update only selected occurrence | Many overdue occurrences could be confusing | Care Tracking — Planned |
| Diagnose | Upload two images for symptom check | Return preliminary condition/causes/treatment | False confidence in AI output | Diagnose — API exists |

## Critical branch: plan rejected

```mermaid
flowchart TD
  A["AI proposes care plan"] --> B{"User decision"}
  B -->|Accept| C["Activate schedules"]
  B -->|Reject| D["No active plan"]
  D --> E["Next screen / usable features TBD"]
```

## Validation plan

Run lightweight usability tests for image upload, skipping context, reviewing plan and updating a task. Observe if users understand that fixed schedule may mean **check conditions**, not automatically water.

Related: [Care Planning](../features/care-planning.md), [BACCM](../../01-product/baccm-analysis.md), [Roadmap](../../01-product/roadmap.md).
