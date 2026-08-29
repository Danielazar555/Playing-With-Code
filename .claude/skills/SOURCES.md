# Imported skills — the 5 selected, and why

Searched GitHub + Hugging Face / skill marketplaces for the most relevant,
best-recommended skills for **planning, building, and designing a polished
UI/UX web app**. Selected these five (official Anthropic skills + the most-cited
community picks in curated lists like `travisvn/awesome-claude-skills`):

| Skill | Source | Why it made the cut |
|---|---|---|
| **frontend-design** | `anthropics/skills` (official) | The single most-recommended design skill — pushes past "AI slop" to intentional palette, type, and a signature element. |
| **ux-designer** | `szilu/ux-designer-skill` | The most thorough UX rubric in the ecosystem: WCAG 2.2 AA, touch targets, forms, navigation, reduced-motion, anti-pattern catalog, reference values. |
| **webapp-testing** | `anthropics/skills` (official) | Playwright-based visual verification — screenshot the running UI at device size and self-critique. Matches how this project is QA'd. |
| **web-artifacts-builder** | `anthropics/skills` (official) | Modern frontend build guidance (React/Tailwind/shadcn) with an explicit anti-slop directive; useful when scaling the UI up. |
| **frontend-design-toolkit** | `wilwaldon/Claude-Code-Frontend-Design-Toolkit` | Curated meta-collection of frontend-quality techniques; ties the above together. |

## How they were integrated into this project

These skills were used as a **review rubric** to roast and then rebuild the
Philippines trip app. The concrete changes are recorded in `app/DESIGN.md`
(section "Skill-driven roast v2"). Headline fixes: visible keyboard focus,
`prefers-reduced-motion`, ≥44px touch targets, WCAG-AA contrast on muted text,
keyboard-operable cards/pins/checklist, a serif display face for editorial type
personality (offline-safe, no web fonts), and larger base body text.

## Added later (user request): planner, superpowers, UI/UX Pro Max

| Skill | Source | Role |
|---|---|---|
| **ui-ux-pro-max** | `nextlevelbuilder/ui-ux-pro-max-skill` | Design-intelligence rulebook — priority table (accessibility, touch, style, type/color, motion…), anti-patterns (incl. "emoji as icons"), and a searchable palette/font/UX database. Used as the lens for the map redesign + emoji cleanup. |
| **ui-ux-pro-max-design** | same repo (`design` skill) | Brand identity / design-token / asset-generation companion. |
| **superpowers-brainstorming** | `obra/superpowers-skills` | Socratic idea-refinement before building ("planner" front half). |
| **superpowers-writing-plans** | `obra/superpowers-skills` | Turns a design into bite-sized implementation tasks ("planner" back half). |

Note: the `ui-ux-pro-max` search tool (`scripts/search.py`) and its CSV
databases live in the upstream repo and were not vendored — only the SKILL.md
entrypoints are here, which carry the rule tables and workflow. To use the live
search, clone the upstream repo. Everything else in this doc still applies.

Only the `SKILL.md` entrypoints are vendored here (progressive-disclosure —
the reference sub-files of `ux-designer` live in its upstream repo). Upstream:
- https://github.com/anthropics/skills
- https://github.com/szilu/ux-designer-skill
- https://github.com/wilwaldon/Claude-Code-Frontend-Design-Toolkit
- https://github.com/travisvn/awesome-claude-skills (discovery)
