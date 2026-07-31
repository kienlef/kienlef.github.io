---
layout: article
title: Agent workbench
permalink: /agent-workbench/
show_date: false
sharing: false
license: false
article_header: false
---

<span class="kf-eyebrow"><i class="ph ph-hammer"></i> Agent workbench</span>

# Small things agents can build, check, and improve.

<p class="kf-page-lead">This page is deliberately broader than AI in operations. Some experiments support the business material directly. Others are here because they show a useful pattern: an agent should inspect the source, make a bounded change, verify the result, and leave something a human can review.</p>

<div class="kf-note"><strong>My rule:</strong> a polished answer is not proof. A working page, repository, test result, or deployment link is much more interesting.</div>

## Try the public prototypes

<div class="kf-grid-3">
  <div class="kf-card">
    <div class="kf-icon"><i class="ph ph-graph"></i></div>
    <h3><a href="/operations-intelligence-map/">Operations intelligence map</a></h3>
    <p>Twenty-seven decisions connected through six lenses: SCOR process, operating area, roles, systems, data, and AI role. Change the lens instead of pretending one diagram explains the whole operating system.</p>
    <p><a href="/operations-intelligence-map/">Explore the map</a></p>
  </div>
  <div class="kf-card">
    <div class="kf-icon"><i class="ph ph-check-square-offset"></i></div>
    <h3><a href="/labs/agent-readiness-canvas.html">Agent readiness canvas</a></h3>
    <p>A small interactive HTML tool for checking workflow boundaries, data readiness, failure visibility, human review, and traceability before calling a use case agent-ready.</p>
    <p><a href="/labs/agent-readiness-canvas.html">Open the prototype</a></p>
  </div>
  <div class="kf-card">
    <div class="kf-icon"><i class="ph ph-presentation-chart"></i></div>
    <h3><a href="https://kienlef.github.io/operations_use_case_selection/index.html">One-page operations case library</a></h3>
    <p>Twenty-five searchable analytical briefs across source, transform, plan, and fulfill. The methods, data requirements, and KPIs now live on one page; the original slide versions remain available.</p>
    <p><a href="https://kienlef.github.io/operations_use_case_selection/index.html">Open all cases on one page</a> · <a href="https://github.com/kienlef/operations_use_case_selection">Inspect the source</a></p>
  </div>
</div>

## Reusable practices

<div class="kf-grid-2">
  <div class="kf-card"><div class="kf-icon"><i class="ph ph-list-checks"></i></div><h3><a href="/resources/agentic-operations-ai-resource-cheat-sheet.html">Evidence before enthusiasm</a></h3><p>A curated source sheet for agentic AI in operations. Claims should lead to inspectable evidence, not a synthetic confidence trick.</p></div>
  <div class="kf-card"><div class="kf-icon"><i class="ph ph-terminal-window"></i></div><h3><a href="/resources/hermes-agent-cheat-sheet.html">Hermes Agent field guide</a></h3><p>A practical reference for tools, skills, scheduled work, and verification. The interesting part is not prompting. It is dependable execution.</p></div>
  <div class="kf-card"><div class="kf-icon"><i class="ph ph-flow-arrow"></i></div><h3>Inspect → act → verify → hand over</h3><p>The pattern works for code, content, data, and operations: inspect the real source, make the smallest useful change, test it, then leave a crisp review path.</p></div>
  <div class="kf-card"><div class="kf-icon"><i class="ph ph-user-check"></i></div><h3>Keep the decision owner visible</h3><p>An agent may prepare a route, risk signal, maintenance recommendation, or publication. A human still owns the exception, commitment, and reputation risk.</p></div>
</div>

<section class="kf-section dark">
  <span class="kf-eyebrow"><i class="ph ph-github-logo"></i> Inspectable work</span>
  <h2>Code and content should survive curious people clicking on them.</h2>
  <p>The public GitHub layer includes operational use cases, supply-chain analytics, SDG analytics, analytics translation, and this homepage. Some repositories are mature learning artifacts; some are experiments. They are labelled rather than dressed up.</p>
  <p class="kf-page-actions"><a class="button button--primary button--pill" href="/github-projects/">View curated GitHub projects</a> <a class="button button--secondary button--pill" href="https://github.com/kienlef">Open the GitHub account</a></p>
</section>

## What belongs here next

- compact HTML explainers that make a difficult operating idea easier to inspect,
- small decision tools with synthetic or public data,
- agent workflows with visible review and failure paths,
- reproducible best practices that another person can run without private infrastructure.

What does not belong here: private dashboards, credentials, employer material, or a demo that only works while somebody narrates over the cracks.
