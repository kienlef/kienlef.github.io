"""Pages with an authored H1 must suppress the TeXt generated H1."""
from pathlib import Path
import re
import unittest

ROOT = Path(__file__).resolve().parents[1]

class PageHeaderTests(unittest.TestCase):
    def test_authored_headlines_disable_duplicate_theme_title(self):
        for name in ('index.html', 'about.md', 'contact.md', 'agent-workbench.md'):
            with self.subTest(page=name):
                content = (ROOT / name).read_text(encoding='utf-8')
                frontmatter = content.split('---', 2)[1]
                self.assertRegex(frontmatter, r'(?m)^article_header:\s*false\s*$')

if __name__ == '__main__':
    unittest.main()
