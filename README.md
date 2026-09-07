# Frank Kienle — Practical AI, Analytics, and Operations

This repository powers the GitHub Pages site for Frank Kienle:

https://kienlef.github.io

The site is now aligned with the **Frank Kienle Blue Trust System**: calm institutional blues, Inter typography, Phosphor icons, white/soft-blue editorial sections, dark navy CTA bands, rounded proof cards, and restrained evidence-led messaging.

## Public routes

- [Homepage](https://kienlef.github.io/) — discover a use case, assess readiness, and inspect educational tools and evidence
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
- Do not promise live downloads, products, or forms until they are actually implemented and verified.
- Avoid generic AI hype and generic SaaS visuals.
- Use blue hierarchy first; do not introduce bright green/red semantic styling.

## Local development

The repository uses Jekyll and the TeXt theme structure. If local Jekyll is unavailable, use GitHub Pages for the production build and a standalone local preview for visual QA.

```bash
bundle install
bundle exec jekyll serve
```

### Homepage regression checks

```bash
python3 -m unittest discover -s tools -p 'test_*.py' -v
bundle exec ruby tools/test_build.rb
JEKYLL_ENV=production bundle exec jekyll build --destination /tmp/kienlef-site-review
```

`test_build.rb` checks generated route ownership before rendering. Only the current
`index.html` may write `/index.html`: legacy `landing.html` is excluded and homepage
pagination is disabled. `/docs/` continues to list posts directly. Development tools
and theme test fixtures are excluded from the public site.

The Python tests need only the standard library. Preservation checks compare the map
and decision-library source with the update's baseline commit `8c184e6`, so that commit
must be available locally. Changing the map later requires a deliberate baseline review.

The historical `Gemfile.lock` is unchanged. If its dependencies are unavailable, report
that separately from any alternate-toolchain build; do not describe an unpinned local
build as verification of the production dependency lock. Verify the rendered homepage,
links, mobile layout, and map interactions as well as the build exit code.

## Proof repositories

- https://github.com/kienlef/supplychainanalytics
- https://github.com/kienlef/data_science_on_SDGs
- https://github.com/kienlef/analyticstranslator
- https://github.com/kienlef/operations_use_case_selection
