# Agent Readiness Workshop build source

This folder builds the version 0.2 Agent Readiness Workshop assets for Frank Kienle's GitHub Pages site.

## Outputs

- `assets/downloads/agent-readiness-workshop-v0.2-2026-09-06.pptx`
- `assets/downloads/agent-readiness-workshop-v0.2-2026-09-06.pdf`
- `assets/downloads/agent-readiness-workshop-print-kit-v0.2-2026-09-06.pdf`

The workshop deck has 15 editable 16:9 slides. The companion kit has six A4-landscape pages: a readiness canvas, evidence cards, score tokens, blocker tokens, decision labels, a Stop Card, an ownership baton, and a facilitator guide.

## Build

Prerequisites:

- Node.js 20+
- Google Chrome at `/Applications/Google Chrome.app`
- LibreOffice (`soffice`) for rendering the editable PowerPoint to the matching PDF
- Poppler (`pdfinfo`, `pdftoppm`, and `pdftotext`) for QA

```bash
npm install
npm run build
npm run verify
```

The script uses PptxGenJS for the editable deck, Phosphor Icons for consistent iconography, LibreOffice for the matching deck PDF, and headless Chrome for the printable-kit PDF. Generated HTML previews are written to `qa/` and are intentionally excluded from the public download links.

### Dependency note

As of 6 September 2026, `npm audit` reports two high-severity denial-of-service advisories in PptxGenJS's transitive `image-size` dependency. No patched `image-size` release is available. This build does not accept user-supplied images: it rasterizes bundled Phosphor SVG icons and writes static local files. Do not extend it to process untrusted ICNS, JXL, or HEIF input until the upstream dependency is patched. `sharp` is pinned to the patched 0.35 line.

## Quality rules

- one answer-first headline per slide
- PowerPoint text no smaller than 10 pt
- Blue Trust palette: navy, white, controlled blue, muted warm/plum blockers
- no employer, customer, supplier, or internally identifiable examples
- no “production ready” claim based on the score
- hard blockers override the total
- low readiness scores are useful findings

## Public page

After deployment:

- <https://kienlef.github.io/agent-readiness-workshop/>

The original version 0.1 checklist remains versioned separately. Version 0.2 is a workshop deck and physical facilitation kit, not a silent overwrite of the original document.
