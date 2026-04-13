#!/usr/bin/env python3
"""Import articles from Shopify blog into Astro content collection."""

import json
import re
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

# Try to import html2text, install if missing
try:
    import html2text
except ImportError:
    print("Installing html2text...")
    os.system(f"{sys.executable} -m pip install html2text --break-system-packages -q")
    import html2text

try:
    import urllib.request
    import urllib.error
except ImportError:
    pass

# Read token
token_path = Path("/tmp/shopify_token.txt")
if not token_path.exists():
    print("ERROR: /tmp/shopify_token.txt not found")
    sys.exit(1)

token = token_path.read_text().strip()

SHOPIFY_URL = "https://lifeeaseessentials-2.myshopify.com/admin/api/2024-01/blogs/110419837285/articles.json?limit=50"
OUTPUT_DIR = Path(__file__).parent / "src" / "content" / "articles"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Configure html2text
converter = html2text.HTML2Text()
converter.ignore_links = False
converter.ignore_images = False
converter.body_width = 0  # Don't wrap lines

print(f"Fetching articles from Shopify...")

import socket
socket.setdefaulttimeout(30)

req = urllib.request.Request(
    SHOPIFY_URL,
    headers={
        "X-Shopify-Access-Token": token,
        "Content-Type": "application/json",
    }
)

try:
    with urllib.request.urlopen(req, timeout=30) as response:
        data = json.loads(response.read().decode())
except urllib.error.HTTPError as e:
    print(f"HTTP Error {e.code}: {e.reason}")
    sys.exit(1)
except Exception as e:
    print(f"Error fetching articles: {e}")
    sys.exit(1)

articles = data.get("articles", [])
print(f"Found {len(articles)} articles")

imported = 0
for article in articles:
    handle = article.get("handle", "").strip()
    if not handle:
        handle = re.sub(r'[^a-z0-9-]', '-', article.get("title", "untitled").lower())
        handle = re.sub(r'-+', '-', handle).strip('-')

    title = article.get("title", "Untitled").replace('"', '\\"')

    # Description from summary_html
    summary_html = article.get("summary_html") or article.get("summary") or ""
    if summary_html:
        summary_text = converter.handle(summary_html).strip()
        # Take first sentence or 160 chars
        summary_text = summary_text.split('\n')[0][:160].replace('"', '\\"')
    else:
        summary_text = ""

    author = article.get("author", "Weekend Basecamp Team").replace('"', '\\"')

    # Parse date
    created_at = article.get("created_at", "")
    try:
        dt = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
        pub_date = dt.strftime("%Y-%m-%d")
    except Exception:
        pub_date = datetime.now().strftime("%Y-%m-%d")

    # Category from first tag
    tags = article.get("tags", "")
    if isinstance(tags, str) and tags:
        category = tags.split(",")[0].strip().replace('"', '\\"')
    elif isinstance(tags, list) and tags:
        category = str(tags[0]).strip().replace('"', '\\"')
    else:
        category = ""

    # Convert body_html to markdown
    body_html = article.get("body_html", "")
    body_md = converter.handle(body_html) if body_html else ""

    # Build frontmatter
    fm_lines = [
        "---",
        f'title: "{title}"',
    ]
    if summary_text:
        fm_lines.append(f'description: "{summary_text}"')
    fm_lines.append(f'author: "{author}"')
    fm_lines.append(f"pubDate: {pub_date}")
    if category:
        fm_lines.append(f'category: "{category}"')
    fm_lines.append("---")
    fm_lines.append("")

    content = "\n".join(fm_lines) + body_md

    out_path = OUTPUT_DIR / f"{handle}.md"
    out_path.write_text(content, encoding="utf-8")
    print(f"  ✓ {handle}.md")
    imported += 1

print(f"\nDone! Imported {imported} articles to {OUTPUT_DIR}")
