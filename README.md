# Frank Kienle — Practical AI, Analytics, and Operations

This repository powers the GitHub Pages site for Frank Kienle:

https://kienlef.github.io

The site is now aligned with the **Frank Kienle Blue Trust System**: calm institutional blues, Inter typography, Phosphor icons, white/soft-blue editorial sections, dark navy CTA bands, rounded proof cards, and restrained evidence-led messaging.

## Public routes

- [Homepage](https://kienlef.github.io/) — positioning, trust anchors, featured topics, GitHub proof layer
- [Topics](https://kienlef.github.io/topics/) — knowledge hub for the four public pillars
- [Supply Chain Analytics](https://kienlef.github.io/supply-chain-analytics/) — operations analytics and AI use-case prioritization
- [SDG Analytics](https://kienlef.github.io/sdg-analytics/) — responsible public-data analytics
- [Analytics Translator 2.0](https://kienlef.github.io/analytics-translator/) — business/data/IT/process translation in the AI era
- [AI Agents in Operations](https://kienlef.github.io/ai-agents-in-operations/) — bounded, reviewable agent-workflow readiness
- [GitHub Projects](https://kienlef.github.io/github-projects/) — proof artifacts for public learning paths
- [Agent Readiness Checklist](https://kienlef.github.io/register/) — future free resource registration placeholder

## Design system implementation

Core implementation files:

- `_sass/skins/_blue-trust.scss` — TeXt theme skin token mapping
- `_sass/custom.scss` — Inter font, button overrides, helper classes, cards, repo chips, dark bands
- `_includes/head/custom.html` — Phosphor Icons CDN
- `_config.yml` — `text_skin: blue-trust`
- `index.html` — homepage using Blue Trust components

Reusable content classes:

- `kf-eyebrow`
- `kf-card`
- `kf-icon`
- `kf-grid-2` / `kf-grid-3`
- `kf-section soft` / `kf-section dark`
- `kf-repo-row` / `kf-repo-chip`
- `kf-trust-list`
- `kf-note`

## Content quality rules

- Keep content practical, educational, and evidence-led.
- Link every major claim path to a topic page, YouTube learning route, GitHub proof artifact, or future package placeholder.
- Do not promise live downloads, products, or forms until Frank has reviewed and approved them.
- Avoid generic AI hype and generic SaaS visuals.
- Use blue hierarchy first; do not introduce bright green/red semantic styling.

## Local development

The repository uses Jekyll and the TeXt theme structure. If local Jekyll is unavailable, use GitHub Pages for the production build and a standalone local preview for visual QA.

```bash
bundle install
bundle exec jekyll serve
```

## Proof repositories

- https://github.com/kienlef/supplychainanalytics
- https://github.com/kienlef/data_science_on_SDGs
- https://github.com/kienlef/analyticstranslator
- https://github.com/kienlef/operations_use_case_selection
