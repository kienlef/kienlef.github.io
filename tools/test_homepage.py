#!/usr/bin/env python3
"""Acceptance tests for the bounded homepage (index.html) narrative update.

Parses index.html with the stdlib HTMLParser (no third-party deps). These
tests assert *structure, flow, and links* — not pinned marketing prose — so
copy edits stay easy while the required information architecture is enforced.

Run from the repo root:
    python3 tools/test_homepage.py
"""
import re
import subprocess
import sys
import unittest
from html.parser import HTMLParser
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
INDEX_PATH = REPO_ROOT / "index.html"

# Protected source files must stay byte-identical to production (8c184e6).
PROTECTED = ["operations-intelligence-map.html", "operations-use-cases.md"]

# The disclaimer paragraph must be preserved exactly.
DISCLAIMER = (
    "Personal educational content by Frank Kienle. Views are personal. "
    "Examples are based on public, educational, historical, or synthetic "
    "material unless stated otherwise. No employer-confidential, "
    "customer-confidential, or supplier-confidential information is shared."
)


class HomepageExtractor(HTMLParser):
    """Collect structure: h1/h2, sections-by-id, links, ids, iframes, text."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.headings = {"h1": [], "h2": [], "h3": []}
        self.id_list = []          # every id encountered, in document order
        self.links = []            # (href, text, is_hero)
        self.iframes = []
        self.section_text = {}     # id -> visible text inside that <section>
        self.section_links = {}    # id -> [href, ...] inside that <section>
        self._stack = []           # open tag names
        self._sec_stack = []       # open <section id=...> ids
        self._style = 0
        self._capture = None       # 'h1'|'h2'|'h3'|'a'|'p'
        self._buf = []
        self._href = None
        self._pending_p_after_h1 = False
        self.h1_lead = None
        self._saw_section = False  # True once the first <section> has opened

    # -- helpers ---------------------------------------------------
    def _sec(self):
        return self._sec_stack[-1] if self._sec_stack else None

    def _rec_text(self, data):
        sec = self._sec()
        if sec:
            self.section_text[sec] = self.section_text.get(sec, "") + data

    def _rec_link(self, href):
        sec = self._sec()
        if sec and href:
            self.section_links.setdefault(sec, []).append(href)

    # -- parser callbacks -----------------------------------------
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        self._stack.append(tag)
        if tag == "section":
            self._saw_section = True
            if attrs.get("id"):
                self._sec_stack.append(attrs["id"])
        if tag == "style":
            self._style += 1
        if tag in ("h1", "h2", "h3", "p", "a"):
            self._capture = tag
            self._buf = []
        if tag == "a":
            self._href = attrs.get("href")
        if tag == "iframe":
            self.iframes.append(attrs.get("src"))
        if attrs.get("id"):
            self.id_list.append(attrs["id"])

    def handle_endtag(self, tag):
        if tag == "style":
            self._style = max(0, self._style - 1)
        if tag in ("h1", "h2", "h3") and self._capture == tag:
            text = " ".join("".join(self._buf).split())
            self.headings[tag].append(text)
            self._capture = None
            if tag == "h1":
                self._pending_p_after_h1 = True
        elif tag == "a" and self._capture == "a":
            text = " ".join("".join(self._buf).split())
            self.links.append((self._href, text, not self._saw_section))
            self._rec_link(self._href)
            self._capture = None
        elif tag == "p" and self._capture == "p":
            text = " ".join("".join(self._buf).split())
            if self._pending_p_after_h1 and self.h1_lead is None and text:
                self.h1_lead = text
            self._pending_p_after_h1 = False
            self._capture = None
        if tag == "section" and self._sec_stack:
            self._sec_stack.pop()
        if tag in self._stack:
            self._stack.remove(tag)

    def handle_data(self, data):
        if self._style:
            return
        self._rec_text(data)
        if self._capture in ("h1", "h2", "h3", "p", "a"):
            self._buf.append(data)

    # ---- convenience queries -------------------------------------
    def link_hrefs(self):
        return [h for h, _, _ in self.links if h]

    def links_to(self, href):
        return [t for h, t, _ in self.links if h and href in h]

    def hero_links_to(self, href):
        """Exact-href links that live in the hero (before the first section)."""
        return [t for h, t, hero in self.links if hero and h == href]

    def section_text_of(self, sid):
        return " ".join(self.section_text.get(sid, "").split())

    def section_has_link(self, sid, href_substr):
        return any(href_substr in h for h in self.section_links.get(sid, []))


def strip_frontmatter(html):
    """Return the source with the leading Jekyll YAML block removed."""
    lines = html.split("\n")
    if lines and lines[0].strip() == "---":
        for i in range(1, len(lines)):
            if lines[i].strip() == "---":
                return "\n".join(lines[i + 1:])
    return html


class VisibleTextCounter(HTMLParser):
    """Count non-whitespace characters of visible copy (no tags/style)."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.count = 0
        self._style = 0
        self._script = 0

    def handle_starttag(self, tag, attrs):
        if tag == "style":
            self._style += 1
        elif tag == "script":
            self._script += 1

    def handle_endtag(self, tag):
        if tag == "style":
            self._style = max(0, self._style - 1)
        elif tag == "script":
            self._script = max(0, self._script - 1)

    def handle_data(self, data):
        if self._style or self._script:
            return
        self.count += len("".join(data.split()))


def visible_copy_chars(html):
    counter = VisibleTextCounter()
    counter.feed(strip_frontmatter(html))
    counter.close()
    return counter.count


def load_index():
    return Path(INDEX_PATH).read_text(encoding="utf-8")


def parse_index():
    parser = HomepageExtractor()
    parser.feed(load_index())
    parser.close()
    return parser


def git_show(commit, path):
    try:
        out = subprocess.run(
            ["git", "show", f"{commit}:{path}"],
            capture_output=True, cwd=REPO_ROOT,
        )
        if out.returncode == 0:
            return out.stdout
    except Exception:
        pass
    return None


class TestHomepageStructure(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.parser = parse_index()

    # ---------- protected files untouched ----------
    def test_protected_source_files_match_production(self):
        for path in PROTECTED:
            cur = (REPO_ROOT / path).read_bytes()
            prod = git_show("8c184e6", path)
            self.assertIsNotNone(
                prod,
                f"cannot read production baseline (8c184e6:{path}) to compare",
            )
            self.assertEqual(
                cur, prod,
                f"{path} must stay byte-identical to production (8c184e6)",
            )

    # ---------- hero ----------
    def test_page_title_complements_site_name(self):
        frontmatter = load_index().split("---", 2)[1]
        match = re.search(r"(?m)^title:\s*(.+?)\s*$", frontmatter)
        self.assertIsNotNone(match, "homepage needs a frontmatter title")
        title = match.group(1).lower()
        self.assertNotEqual(title, "ai in operations",
                            "page title must not duplicate the site title")
        self.assertTrue("use case" in title and "readiness" in title,
                        "page title should summarize the homepage objective")

    def test_hero_headline_informative(self):
        self.assertEqual(len(self.parser.headings["h1"]), 1,
                         "expected exactly one <h1>")
        h1 = self.parser.headings["h1"][0]
        self.assertGreaterEqual(len(h1.split()), 4,
                                "hero h1 must be an informative phrase")
        self.assertTrue("use case" in h1.lower() or "automate" in h1.lower(),
                        "hero h1 should signal the use-case/readiness framing")

    def test_primary_hero_cta_is_use_case_map(self):
        self.assertTrue(
            self.parser.hero_links_to("/operations-intelligence-map/"),
            "hero must link exactly the public use-case map",
        )

    def test_secondary_hero_cta_is_register_checklist(self):
        self.assertTrue(
            self.parser.hero_links_to("/register/"),
            "hero must expose exactly the /register/ readiness checklist path",
        )

    def test_lead_bound_and_targets_operations_readiness(self):
        lead = (self.parser.h1_lead or "").lower()
        self.assertIsNotNone(self.parser.h1_lead, "no lead paragraph found")
        self.assertLessEqual(len(lead), 700, "intro/lead must stay concise")
        self.assertTrue(
            "operations" in lead or "supply chain" in lead,
            "lead must be addressed to operations/supply-chain professionals",
        )
        self.assertTrue("library" in lead,
                        "lead should name the public decision library")
        self.assertTrue("readiness" in lead,
                        "lead should mention readiness checks")
        self.assertTrue(
            any(k in lead for k in ("inspect", "prototype", "artifact", "source")),
            "lead should point at inspectable tools/prototypes",
        )

    # ---------- section flow ----------
    def test_required_section_ids_present_and_unique(self):
        for sid in ("use-cases", "readiness", "workbench"):
            self.assertIn(sid, self.parser.section_text,
                          f"missing section id='{sid}'")
        self.assertEqual(
            len(self.parser.id_list), len(set(self.parser.id_list)),
            f"element ids must be unique; duplicates in {self.parser.id_list}",
        )

    def test_h2_headings_present(self):
        self.assertTrue(len(self.parser.headings["h2"]) >= 3,
                        "page should have clear h2 section headings")

    # ---------- readiness / register signup ----------
    def test_readiness_is_email_signup_linking_register(self):
        text = self.parser.section_text_of("readiness").lower()
        self.assertTrue(self.parser.section_has_link("readiness", "/register/"),
                        "readiness section must link to /register/")
        self.assertIn("email", text,
                      "readiness section must be framed as an email signup")
        self.assertIn("checklist", text,
                      "readiness section should name the checklist")

    def test_readiness_explains_the_four_checks(self):
        text = self.parser.section_text_of("readiness").lower()
        for term in ("workflow", "data", "fail", "human"):
            self.assertIn(term, text,
                          f"readiness section should explain the '{term}' check")

    def test_no_form_embed_on_homepage(self):
        self.assertEqual(self.parser.iframes, [],
                         "homepage must NOT embed the signup form; link to /register/ instead")

    def test_register_not_promoted_as_instant_download(self):
        text = self.parser.section_text_of("readiness").lower()
        for banned in ("instant", "download now", "sign in", "login"):
            self.assertNotIn(banned, text,
                             f"readiness must not imply '{banned}' delivery")
        self.assertTrue(
            any(k in text for k in ("confirm", "double opt", "inbox")),
            "should mention the email confirmation step",
        )

    # ---------- workbench ----------
    def test_workbench_concrete_jobs_no_workshop(self):
        text = self.parser.section_text_of("workbench").lower()
        self.assertTrue(self.parser.section_has_link(
            "workbench", "/labs/agent-readiness-canvas.html"),
            "workbench should offer the readiness canvas prototype")
        self.assertTrue(self.parser.section_has_link(
            "workbench", "/resources/hermes-agent-cheat-sheet.html"),
            "workbench should offer the Hermes Agent field guide")
        self.assertTrue(self.parser.section_has_link("workbench", "github"),
                        "workbench should offer inspectable source")
        self.assertNotIn("workshop", text,
                         "no workshop link — that branch is unmerged")
        self.assertIn("inspect", text,
                      "workbench frames jobs as inspectable artifacts")

    # ---------- compression: removals ----------
    def test_no_registry_links(self):
        for href in self.parser.link_hrefs():
            self.assertNotIn("/registry", href,
                             f"found stale /registry link: {href}")

    def test_no_selected_oee_promotion(self):
        for href, _text, _hero in self.parser.links:
            if href and "oee-before-ai-hype" in href:
                self.fail("selected-case OEE promotion link must be removed")
        self.assertNotIn(
            "oee-before-ai-hype", load_index(),
            "no fragment link promoting the OEE selected case on the homepage",
        )

    def test_no_long_selected_case_grid_duplication(self):
        # The old "START HERE" grid and four-card decision journey are removed.
        text = load_index()
        for stale in (
            "Twenty-seven decisions agents should not own alone",
            "From use cases to operating system",
            "Explore 9 decisions",
            "Decision ownership",
            "Use-case readiness",
        ):
            self.assertNotIn(stale, text,
                             f"stale section/card text still present: {stale!r}")

    # ---------- learning / proof + about/contact ----------
    def test_compact_learning_proof_route(self):
        # Existing learning/proof routes kept concise (no long duplication).
        routes = {
            "topic": self.parser.links_to("/ai-agents-in-operations/"),
            "topics": self.parser.links_to("/topics/"),
            "github": self.parser.links_to("github"),
        }
        self.assertTrue(
            any(routes.values()),
            "should keep a compact learning/proof route (topic / github)",
        )

    def test_about_contact_distinct(self):
        # Credibility paragraph with /about.html, distinct from action /contact/
        about = self.parser.links_to("/about.html")
        contact = self.parser.links_to("/contact/")
        self.assertTrue(about, "must link the credibility /about.html page")
        self.assertTrue(contact, "must keep the distinct /contact/ action link")
        self.assertIn("about", load_index().lower(),
                      "credibility narrative should be present")

    # ---------- unsupported claims removed ----------
    def test_no_unsupported_social_metric(self):
        html = load_index()
        self.assertNotRegex(html, r"19k|20k|\d+k\+?\s*LinkedIn",
                            "unsupported LinkedIn follower counts removed")
        self.assertNotIn("LinkedIn community", html)

    def test_no_stale_future_signup_language(self):
        html = load_index()
        for stale in ("can be added later", "coming soon", "future",
                      "will be live", "sign up soon", "available soon"):
            self.assertNotIn(stale, html.lower(),
                             f"stale future-signup phrasing present: {stale!r}")

    # ---------- disclaimer preserved exactly ----------
    def test_disclaimer_preserved_exactly(self):
        self.assertIn(DISCLAIMER, load_index(),
                      "disclaimer must be preserved exactly")

    # ---------- anchors ----------
    def test_fragment_anchors_resolve(self):
        html_ids = set(self.parser.id_list)
        for href in self.parser.link_hrefs():
            if not href:
                continue
            if href.startswith("#"):
                self.assertIn(href[1:], html_ids,
                              f"fragment anchor does not resolve: {href!r}")

    # ---------- overall visible copy materially shorter ----------
    def test_homepage_visible_copy_materially_shorter(self):
        cur = visible_copy_chars(load_index())
        prod = git_show("8c184e6", "index.html")
        self.assertIsNotNone(
            prod, "cannot read production index.html baseline to compare")
        prod_text = prod.decode("utf-8", errors="replace")
        prod_len = visible_copy_chars(prod_text)
        self.assertLess(
            cur, int(prod_len * 0.82),
            f"visible copy not materially shorter: {cur} vs {prod_len} chars",
        )

    # ---------- footer contact link ----------
    def test_footer_contact_link(self):
        contact = self.parser.links_to("/contact/")
        self.assertTrue(contact, "footer/ending must include the /contact/ link")


if __name__ == "__main__":
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(TestHomepageStructure)
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    sys.exit(0 if result.wasSuccessful() else 1)
