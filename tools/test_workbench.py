#!/usr/bin/env python3
"""Tests for the Agent Workbench page framing.

Ensures the page carries a concrete operational purpose, labels the
prototypes as educational (not production automation), drops unverified
case counts, and leaves every existing href, Blue Trust class, and
Phosphor icon untouched. Prototype inventory and behavior are out of scope.

Run:  python3 tools/test_workbench.py
"""
import os
import unittest

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGE = os.path.join(REPO, "agent-workbench.md")


def read_page():
    with open(PAGE, encoding="utf-8") as fh:
        return fh.read()


class FramingTests(unittest.TestCase):
    """The page must frame a concrete operational purpose, not vague scope."""

    @classmethod
    def setUpClass(cls):
        cls.content = read_page()

    def test_lead_states_operational_purpose(self):
        """Lead gives a concrete purpose: test a workflow before giving an agent authority."""
        self.assertIn("before giving an agent authority", self.content)
        self.assertIn("operational", self.content)

    def test_vague_broad_scope_removed(self):
        """The old deliberately-broader framing is gone."""
        self.assertNotIn("deliberately broader", self.content)

    def test_h1_is_concise_and_concrete(self):
        """The old throwaway 'small things' H1 is gone."""
        self.assertNotIn("Small things agents can build", self.content)

    def test_prototypes_labeled_educational(self):
        """Prototypes are labelled educational and explicitly not production automation."""
        self.assertIn("educational", self.content)
        self.assertIn("not production automation", self.content)

    def test_publication_standard_replaces_roadmap_list(self):
        """End with a durable editorial standard, not a speculative roadmap list."""
        self.assertIn("## What earns a place in the workbench", self.content)
        for phrase in (
            "What belongs here next",
            "compact HTML explainers",
            "small decision tools with synthetic or public data",
            "What does not belong here",
            "narrates over the cracks",
        ):
            self.assertNotIn(phrase, self.content)
        for principle in ("public or synthetic material", "failure paths", "reproducible", "inspect"):
            self.assertIn(principle, self.content)


class PrototypeLimitationTests(unittest.TestCase):
    """Case counts that differ across branches must not be asserted here."""

    @classmethod
    def setUpClass(cls):
        cls.content = read_page()

    def test_no_unverified_case_counts(self):
        """No 25/27 style case counts; use 'searchable analytical briefs' instead."""
        self.assertNotIn("Twenty-seven", self.content)
        self.assertNotIn("Twenty-five", self.content)
        self.assertIn("searchable analytical briefs", self.content)

    def test_all_three_prototypes_present(self):
        """The three production prototype cards remain."""
        self.assertIn("/operations-intelligence-map/", self.content)
        self.assertIn("/labs/agent-readiness-canvas.html", self.content)
        self.assertIn("operations_use_case_selection", self.content)


class PreservationTests(unittest.TestCase):
    """Existing destinations, classes, and icons must be untouched."""

    EXPECTED_HREFS = {
        "/operations-intelligence-map/",
        "/labs/agent-readiness-canvas.html",
        "https://kienlef.github.io/operations_use_case_selection/index.html",
        "https://github.com/kienlef/operations_use_case_selection",
        "/resources/agentic-operations-ai-resource-cheat-sheet.html",
        "/resources/hermes-agent-cheat-sheet.html",
        "/github-projects/",
        "https://github.com/kienlef",
    }

    @classmethod
    def setUpClass(cls):
        cls.content = read_page()

    def test_blue_trust_classes_present(self):
        """Reusable Blue Trust classes are retained."""
        for cls_ in ("kf-eyebrow", "kf-card", "kf-icon", "kf-page-lead", "kf-grid-3"):
            self.assertIn(cls_, self.content)

    def test_phosphor_icons_present(self):
        """Phosphor icons are retained."""
        self.assertIn("ph ph-hammer", self.content)
        self.assertIn("ph ph-graph", self.content)
        self.assertIn("ph ph-check-square-offset", self.content)
        self.assertIn("ph ph-presentation-chart", self.content)

    def test_all_existing_hrefs_preserved(self):
        """Every existing href value is still present."""
        for href in self.EXPECTED_HREFS:
            self.assertIn('href="%s"' % href, self.content)


if __name__ == "__main__":
    unittest.main(verbosity=2)
