# SYNCMFG

Private Lean Six Sigma workbench — paste Excel data, run analyses, email or print plain-English reports from any factory Wi‑Fi.

**Live site:** https://foxitup1776.github.io/SyncMFG/

## How to use it

1. **Start** — write the problem, tap what fits, get a short next step  
2. **Methods** — three-circle map (SPC · prove · Lean); open a tool when you are ready  
3. Pin reports into a **DMAIC project** to keep the story together. How-to library lives under Settings.  

## Tools

**Methods & coaching**
- Visual method pathways grouped by job (floor now, prove it, numbers, pace/cost, projects)
- Start form with a few situation chips, method tiles, and compact tool suggestions
- DMAIC project / A3 binder (pin stats evidence by phase)

**Problem solving**
- Fishbone (6M), 5 Whys, FMEA (RPN)
- Waste walk (DOWNTIME / 8 wastes), 5S workplace audit
- Before / After improvement check

**Stats**
- Data ingest + sample datasets (30-day local save)
- Histogram / Box / Run, multi-column compare
- I-MR with Western Electric rules, X̄-R
- Process capability (Cp/Cpk/Pp/Ppk)
- Attribute SPC (p / np / c / u)
- Pareto, 2-sample t-test, ANOVA (3+ groups), scatter/regression
- 1-proportion, 2-proportion, chi-square
- Sample size & power (Minitab 2-sample / paired t method)
- Process sigma / DPMO / RTY
- Gage R&R (lite), time-study Monte Carlo
- First-pass yield / scrap (startup vs steady), OEE lite, takt / SMED / COPQ

**Share & setup**
- Email, Print/PDF, optional Web3Forms send
- Settings: extra passwords, session length, how-to library
- Installable PWA (Add to Home Screen)

## Local development

```bash
npm install
npm test      # golden fixtures for the statistical engines
npm run dev
```

`npm run build` runs the same tests before Vite, and GitHub Pages CI will not deploy if they fail. Sign-in uses hashed site passwords (see `src/auth/passwords.ts`).

## GitHub Pages

Push to `main` — Actions builds and publishes automatically.
