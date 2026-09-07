#!/usr/bin/env python3
"""Streamline About/Contact checks.

About and Contact must serve distinct jobs: About = credibility/context with
inspectable evidence; Contact = a concrete LinkedIn action path for talks,
guest lectures, and professional education.

Run: python3 tools/test_about_contact.py
"""
import os
import re
import unittest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ABOUT = os.path.join(ROOT, "about.md")
CONTACT = os.path.join(ROOT, "contact.md")

LINKEDIN = "https://www.linkedin.com/in/frank-kienle-0040b99b"
GITHUB = "https://github.com/kienlef"
YOUTUBE = "https://www.youtube.com/@frankkienle7312"


def read(path):
    with open(path, encoding="utf-8") as fh:
        return fh.read()


def links(text):
    """Collect href targets from both markdown and HTML link forms."""
    out = set()
    out |= set(re.findall(r"\]\(([^)#\s]+)", text))   # [text](url)
    out |= set(re.findall(r'href="([^"]+)"', text))   # href="..."
    return out


class TestContactAction(unittest.TestCase):
    """Contact is the action page: a concrete LinkedIn CTA, no meta-comment."""

    def setUp(self):
        self.contact = read(CONTACT)

    def test_explicit_linkedin_cta(self):
        self.assertIn(LINKEDIN, self.contact, "No explicit LinkedIn URL in contact.md")
        self.assertIn("on linkedin", self.contact.lower(),
                      "LinkedIn link should name the action target (e.g. 'Message Frank on LinkedIn')")
        self.assertTrue(
            any(w in self.contact.lower() for w in ("message", "connect", "reach", "invite", "contact")),
            "LinkedIn CTA should use an explicit action verb",
        )

    def test_suitable_inquiries_described(self):
        for phrase in ("talk", "guest lecture", "professional education"):
            self.assertIn(phrase.lower(), self.contact.lower(),
                          f"Contact should describe suitable {phrase!r} inquiries")

    def test_useful_inquiry_details(self):
        for detail in ("audience", "topic", "format"):
            self.assertIn(detail.lower(), self.contact.lower(),
                          f"Contact should ask for useful inquiry detail: {detail!r}")

    def test_public_profiles_preserved(self):
        for url in (LINKEDIN, GITHUB, YOUTUBE):
            self.assertIn(url, self.contact, f"Missing preserved profile URL {url}")

    def test_route_and_permalink(self):
        self.assertIn("permalink: /contact/", self.contact)

    def test_no_obsolete_placeholder_copy(self):
        blocked = (
            "registration placeholder",
            "future knowledge package",
            "future package",
            "consulting-first funnel",
            "intentionally secondary",
            "main purpose of the site",
        )
        for phrase in blocked:
            self.assertNotIn(phrase.lower(), self.contact.lower(),
                             f"Obsolete placeholder copy still present: {phrase!r}")

    def test_no_invented_email_or_form(self):
        self.assertNotRegex(self.contact, r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}",
                            "Do not invent an email address")
        self.assertNotIn("<form", self.contact, "Do not invent a form")
        self.assertNotIn("<iframe", self.contact, "Do not invent an embedded form")


class TestAboutCredibility(unittest.TestCase):
    """About is the credibility page: real background + inspectable evidence."""

    def setUp(self):
        self.about = read(ABOUT)
        self.about_links = links(self.about)

    def test_background_claims_present(self):
        for claim in ("university lecturer", "industry", "analytics"):
            self.assertIn(claim.lower(), self.about.lower(),
                          f"Missing background claim {claim!r}")

    def test_inspectable_evidence(self):
        self.assertIn("github", self.about.lower(),
                       "About should point to inspectable GitHub evidence")
        self.assertTrue(
            any("github.com/kienlef" in l or "github-projects" in l for l in self.about_links),
            "About should link to inspectable GitHub artifacts",
        )

    def test_repeated_four_topic_catalog_removed(self):
        stale = ("supply chain analytics", "sdg analytics", "analytics translation",
                 "ai agents in operations")
        present = [c for c in stale if c in self.about.lower()]
        self.assertFalse(present, f"Repeated four-topic card catalog still present: {present}")


class TestCrosslinks(unittest.TestCase):
    """About and Contact crosslink so each points to the other's job."""

    def test_about_links_to_contact(self):
        about_links = links(read(ABOUT))
        self.assertTrue(any("contact" in l for l in about_links),
                        "about.md should crosslink to the contact page")

    def test_contact_links_to_about(self):
        contact_links = links(read(CONTACT))
        self.assertTrue(any("about" in l for l in contact_links),
                        "contact.md should crosslink back to the about page")


if __name__ == "__main__":
    unittest.main(verbosity=2)
