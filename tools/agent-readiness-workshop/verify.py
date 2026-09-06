#!/usr/bin/env python3
"""Mechanical QA for Agent Readiness Workshop v0.2."""
from pathlib import Path
from zipfile import ZipFile
import html
import re
import subprocess

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
OUT = ROOT / "assets" / "downloads"
PPTX = OUT / "agent-readiness-workshop-v0.2-2026-09-06.pptx"
DECK_PDF = OUT / "agent-readiness-workshop-v0.2-2026-09-06.pdf"
KIT_PDF = OUT / "agent-readiness-workshop-print-kit-v0.2-2026-09-06.pdf"
KIT_HTML = HERE / "qa" / "print-kit-preview.html"

HEADLINES = [
    "Agent readiness is a decision-system check",
    "One workflow should leave the room",
    "The safest starting point is one repeated workflow",
    "A workflow is not ready until its start, stop",
    "Every consequential agent action needs one accountable",
    "The agent can operate only inside a declared permission envelope",
    "Readiness is visible only when all seven dimensions",
    "Score what is on the table",
    "A single hard blocker can stop the pilot",
    "If the agent is confidently wrong",
    "Human review belongs where judgment changes",
    "Governance must name who changes",
    "Readiness is decided by blockers and controls",
    "A boring coordination workflow becomes useful",
    "Leave with one label, one evidence action",
]


def pdf_pages(path: Path) -> int:
    text = subprocess.check_output(["pdfinfo", str(path)], text=True)
    return int(re.search(r"^Pages:\s+(\d+)", text, re.MULTILINE).group(1))


def pdf_text(path: Path, first=None, last=None) -> str:
    cmd = ["pdftotext"]
    if first is not None:
        cmd += ["-f", str(first), "-l", str(last)]
    return subprocess.check_output(cmd + [str(path), "-"], text=True)


for path in (PPTX, DECK_PDF, KIT_PDF):
    assert path.exists() and path.stat().st_size > 100_000, f"Missing or suspiciously small: {path}"

with ZipFile(PPTX) as archive:
    slide_names = [n for n in archive.namelist() if re.fullmatch(r"ppt/slides/slide\d+\.xml", n)]
    sizes = []
    all_text = []
    for name in slide_names:
        xml = archive.read(name).decode("utf-8", errors="ignore")
        sizes.extend(int(v) / 100 for v in re.findall(r'<a:(?:rPr|defRPr)[^>]* sz="(\d+)"', xml))
        all_text.extend(html.unescape(v) for v in re.findall(r"<a:t>(.*?)</a:t>", xml))
    assert len(slide_names) == 15, len(slide_names)
    for name in archive.namelist():
        if re.fullmatch(r"ppt/slideMasters/slideMaster\d+\.xml", name):
            xml = archive.read(name).decode("utf-8", errors="ignore")
            sizes.extend(int(v) / 100 for v in re.findall(r'<a:(?:rPr|defRPr)[^>]* sz="(\d+)"', xml))
    assert min(sizes) >= 10, min(sizes)
    joined = "\n".join(all_text).lower()
    for phrase in ("hard blocker", "one named owner", "no evidence means zero"):
        assert phrase in joined, phrase
    for private_term in ("roche", "customer name", "supplier name", "employee name"):
        assert private_term not in joined, private_term
    hyperlinks = []
    for name in archive.namelist():
        if re.fullmatch(r"ppt/slides/_rels/slide\d+\.xml\.rels", name):
            hyperlinks.extend(re.findall(r'Target="(https?://[^"]+)"', archive.read(name).decode()))
    assert set(hyperlinks) == {
        "https://kienlef.github.io/labs/agent-readiness-canvas.html",
        "https://kienlef.github.io/ai-agents-in-operations/",
    }

assert pdf_pages(DECK_PDF) == 15
assert pdf_pages(KIT_PDF) == 6
for index, headline in enumerate(HEADLINES, 1):
    page = " ".join(pdf_text(DECK_PDF, index, index).split()).lower()
    assert headline.lower() in page, f"Slide {index}: {headline}"

kit = re.sub(r"\s+", "", pdf_text(KIT_PDF)).lower()
for phrase in ("stop", "decisionownerbaton", "facilitatorguide", "noevidencemeansnotready"):
    assert phrase in kit, phrase

kit_html = KIT_HTML.read_text()
assert kit_html.count('class="ecard"') == 14
token_values = re.findall(r'<div class="tok">([012])</div>', kit_html)
assert len(token_values) == 21
assert {value: token_values.count(value) for value in "012"} == {"0": 7, "1": 7, "2": 7}

print("PASS: 15-slide PPTX, matching 15-page PDF, six-page kit, 10pt PPTX minimum, 14 evidence cards and 21 score tokens present.")
