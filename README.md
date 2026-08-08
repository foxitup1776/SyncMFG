# SYNCMFG

Private Lean Six Sigma workbench — paste Excel data, run analyses, email or print plain-English reports from any factory Wi‑Fi.

**Live site:** https://foxitup1776.github.io/SyncMFG/

## Tools

- Data ingest + sample datasets (30-day local save)
- Histogram / Box / Run, multi-column compare
- I-MR with Western Electric rules, X̄-R
- Process capability (Cp/Cpk/Pp/Ppk)
- Pareto, 2-sample t-test, scatter/regression
- Gage R&R (lite), time-study Monte Carlo
- Email, Print/PDF, optional Web3Forms send
- Settings: extra passwords, session length, FoxHome CouchDB sync
- Installable PWA (Add to Home Screen)

## Local development

```bash
npm install
npm run dev
```

Sign-in uses hashed site passwords (see `src/auth/passwords.ts`).

## GitHub Pages

Push to `main` — Actions builds and publishes automatically.
