# webdiff

**Minimal in-browser text diff tool for instant comparison**

`webdiff` is a lightweight, zero-build diff tool that runs entirely in your browser.  
Paste two texts and instantly see character-level differences with a clean, distraction-free UI.

👉 https://webdiff.notegridx.dev  

---

## Features

- **Character-level diff only**
  - Focused on precision, not heuristics
- **Side-by-side comparison**
  - Left: deletions
  - Right: additions
- **Line numbers**
  - Generated independently for each pane
- **Auto-growing editors**
  - Long text expands naturally; browser scroll handles overflow
- **Light / Dark / Auto theme**
  - Auto follows OS color scheme
- **i18n**
  - Japanese / English (auto-detected)
- **Offline-ready**
  - No server, no build step, no backend

---

## What this tool is for

- Comparing configuration files
- Reviewing small code or text changes
- Checking diffs where **whitespace and characters matter**
- Situations where a full IDE or Git client is overkill

---

## What this tool is *not* for

- Line-based or semantic diffs
- Large-scale repository comparison
- Git history or patch generation

This is intentionally a **single-purpose, minimal diff viewer**.

---

## How it works

- Runs entirely in the browser
- Uses [`jsdiff`](https://github.com/kpdecker/jsdiff) for diff calculation
- Diff granularity is **characters only**
- No data is sent anywhere; everything stays local

---

## Project structure

```text
/
├─ index.html        # HTML structure
├─ styles.css        # UI / theme styles
├─ app.js            # Diff logic and UI behavior
├─ .gitignore
└─ vendor/
   ├─ diff.min.js    # Vendored jsdiff (v5.2.0)
   └─ THIRD_PARTY_NOTICES.md
```

No build tools, no package manager, no dependencies at runtime.

---

## Development

Just open `index.html` in a browser.

```bash
open index.html
# or
python -m http.server
```

---

## Privacy / Security

webdiff runs entirely in your browser.  
No input data is sent, stored, or shared, and no tracking or analytics are used.

---

## License

MIT License  
See [LICENSE](./LICENSE) for details.

---

## Third-party software

This project includes third-party libraries.  
See [`vendor/THIRD_PARTY_NOTICES.md`](./vendor/THIRD_PARTY_NOTICES.md) for details.

---

## Author

notegridx  
https://github.com/notegridx
