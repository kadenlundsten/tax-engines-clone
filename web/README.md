# Web demo for tax-engines-clone

This directory contains a minimal static demo that imports the repository's ESM engines directly and fetches the JSON data files.

How to run locally

1. From the repository root, run a simple static server. Examples:

```bash
# using Node http-server (install if needed)
npx http-server -c-1 . -p 8000

# or Python 3
python -m http.server 8000
```

2. Open http://localhost:8000/web/index.html in your browser.

Notes

- Browsers require HTTP to fetch JSON and import modules correctly; opening the file:// URL will usually fail due to CORS / module import restrictions.
- The demo imports `../engines/paycheck-engine.js` and fetches `../data/tax-data-2026.json`. If you place the files elsewhere, adjust the relative paths in `index.html`.
- This demo is intentionally dependency-free (no bundler). If you'd prefer a nicer developer experience (hot reload, component library), I can scaffold a Vite + Preact/React project instead.
