# SYNCMFG

Private Lean Six Sigma workbench — paste Excel data, run analyses, email plain-English reports from any factory Wi‑Fi.

**Live site:** https://foxitup1776.github.io/SyncMFG/

## Tools

- **Data ingest** — paste from Excel or upload CSV/XLSX (auto-deletes after 30 days on the device)
- **Histogram / Box / Run** — first look at shape and order
- **I-MR control chart** — stability for one measurement column
- **Process capability** — Cp, Cpk, Pp, Ppk vs specs
- **Time-study Monte Carlo** — step times → risk and likely total time
- **Email / download / copy report** — send results to any address

## Local development

```bash
npm install
npm run dev
```

Password is set in `src/auth/passwords.ts`.

## GitHub Pages (automatic)

Push to `main` and GitHub Actions builds + publishes the site.

1. Repo → **Settings** → **Pages**
2. Source: **GitHub Actions**
3. After the workflow finishes, open https://foxitup1776.github.io/SyncMFG/

Data stays in the browser on each device (30-day purge). Emailing uses your device mail app so it works without the home Pi.
