# us-tax-engines

Tested, sourced US tax and paycheck calculation engines for tax years 2025/2026,
extracted from the calculator suite running live at [tools-berry.com](https://tools-berry.com).
Every engine is a pure, dependency-free JS module (ESM, no framework, no network
calls) — it takes plain-object inputs plus a data-parameter object and returns a
plain result object, so it runs identically in a browser `<script type="module">`
tag or in Node. Statutory dollar amounts, brackets, and thresholds live in the
`data/*.json` files, not in the engine code, so a new tax year is a data change,
not a logic change. 1,754 assertions across 18 test files exercise the 14 engines
below; every fixture cites the primary source (IRC section, Treasury regulation,
Revenue Procedure, or IRS Notice) it was checked against.

This is an extraction, not a fork: the engines are copied verbatim from
`src/engine/*.js` in the tools-berry.com repo, with only import paths rewritten
to be standalone. Page templates, the static-site builder, ad/analytics code,
and SEO content are intentionally excluded — see "What's not here" below.

## Quick start

```bash
npm install
npm test
```

No dependencies are installed — `npm install` is a no-op (there are none). Each
test file is a standalone Node script; `npm test` runs all 18 in sequence and
exits non-zero on the first failure.

## Engines

Every engine file is pure logic; the "primary source" column is the statute or
IRS/Treasury/SSA guidance its numbers and mechanics were checked against (cited
verbatim in the engine's header comment). The "live calculator" column links to
the hosted tool the engine powers on tools-berry.com.

| Engine (`engines/…`) | Computes | Primary source | Live calculator |
|---|---|---|---|
| `paycheck-engine.js` | Federal + state paycheck withholding: bracket tax, standard deduction, FICA, per-state income tax (all 50 states + DC) | Rev. Proc. 2025-32 (federal brackets/std. deduction); SSA 2026 COLA ($184,500 SS wage base); each state's DOR bracket/flat-rate tables | [texas-paycheck-calculator](https://tools-berry.com/texas-paycheck-calculator) (1 of 51 state pages) |
| `obbba-deduction.js` — tips | "No tax on tips" above-the-line deduction | IRC §224 (added by OBBBA) | [tips-tax-calculator](https://tools-berry.com/tips-tax-calculator) |
| `obbba-deduction.js` — overtime | "No tax on overtime" above-the-line deduction | IRC §225 (added by OBBBA) | [overtime-tax-calculator](https://tools-berry.com/overtime-tax-calculator) |
| `obbba-deduction.js` — senior deduction | Temporary $6,000 senior bonus deduction | IRC §151(d)(5)(C), added by OBBBA §70103 | [senior-deduction-calculator](https://tools-berry.com/senior-deduction-calculator) |
| `obbba-deduction.js` — car loan interest | New-vehicle loan interest deduction | IRC §163(h)(4), added by OBBBA §70203 | [car-loan-interest-calculator](https://tools-berry.com/car-loan-interest-calculator) |
| `obbba-deduction.js` — SALT cap | State & local tax deduction cap and phase-down | IRC §164(b)(6), amended by OBBBA §70120 | [salt-cap-calculator](https://tools-berry.com/salt-cap-calculator) |
| `obbba-deduction.js` — charitable | Non-itemizer charitable deduction, 0.5%-of-AGI floor, §68 "2/37" haircut | IRC §170(p) (OBBBA §70424); IRC §68 (OBBBA §70111) | [charitable-deduction-calculator](https://tools-berry.com/charitable-deduction-calculator) |
| `obbba-deduction.js` — PMI/MIP | Mortgage insurance premium deduction revival + AGI phaseout | IRC §163(h)(3)(F), OBBBA §70108 | [pmi-deduction-calculator](https://tools-berry.com/pmi-deduction-calculator) |
| `obbba-deduction.js` — W-4 adjustment | Per-paycheck withholding adjustment for the tips/overtime deductions | IRC §224 / §225 applied to Form W-4 withholding | [w4-overtime-tips-withholding-calculator](https://tools-berry.com/w4-overtime-tips-withholding-calculator) |
| `employment-tax.js` | 1099 (self-employed) vs. W-2 take-home estimate | Rev. Proc. 2025-32 + SSA 2026 COLA; IRC §1401 SE tax | [1099-vs-w2-calculator](https://tools-berry.com/1099-vs-w2-calculator) |
| `dependent-care.js` | Dependent Care FSA (§129) vs. Child & Dependent Care Credit (§21) decision | OBBBA P.L. 119-21 §70404; IRC §§21, 129 | [dependent-care-fsa-vs-credit-calculator](https://tools-berry.com/dependent-care-fsa-vs-credit-calculator) |
| `roth-catchup.js` | SECURE 2.0 mandatory Roth catch-up determination | SECURE 2.0 Act §603; IRC §414(v)(7); 26 CFR 1.414(v)-2; IRS Notice 2025-67 | [roth-catchup-calculator](https://tools-berry.com/roth-catchup-calculator) |
| `bonus-tax.js` | Supplemental-wage (bonus) withholding vs. true tax liability | IRS Pub 15 flat 22%/37% federal method; per-state supplemental rates | [bonus-tax-calculator](https://tools-berry.com/bonus-tax-calculator) (+ 51 state variants) |
| `form-1099-checker.js` | 1099-K / 1099-NEC / 1099-MISC reporting-threshold checker | IRC §6050W, §6041(a); IRS Notice 2025-62 | [1099-threshold-checker](https://tools-berry.com/1099-threshold-checker) |
| `w2-box-engine.js` | W-2 Box 12 TA/TP/TT decoder + Treasury Tipped Occupation Code (TTOC) lookup | 2026 IRS General Instructions for Forms W-2/W-3; Federal Register Doc. 2026-07104 (TD 10044); 26 CFR 1.224-1 | [w2-box-decoder](https://tools-berry.com/w2-box-decoder) |
| `ss-maxout-engine.js` | Social Security wage-base max-out pay date | SSA 2026 COLA ($184,500 SS wage base, 6.2% employee rate) | [ss-wage-base-calculator](https://tools-berry.com/ss-wage-base-calculator) |
| `student-loan-cap.js` | Federal student loan borrowing caps (grad/professional/Parent PLUS/lifetime) | 20 U.S.C. §1087e(a) as amended by P.L. 119-21 §81001; ED RISE final rule, 91 FR 23768 | [student-loan-cap-calculator](https://tools-berry.com/student-loan-cap-calculator) |
| `able-contribution.js` | ABLE account (§529A) annual contribution limit | 26 U.S.C. §529A; SECURE 2.0 §124; OBBBA §70115; Rev. Proc. 2025-32; HHS poverty guidelines | [able-account-calculator](https://tools-berry.com/able-account-calculator) |
| `section-127.js` | Employer student loan repayment / educational assistance exclusion | IRC §127; made permanent by OBBBA §70412; IRS FS-2026-10; Pub 15-B | [employer-student-loan-repayment-calculator](https://tools-berry.com/employer-student-loan-repayment-calculator) |
| `qcd-comparison.js` | Qualified Charitable Distribution vs. take-and-deduct comparison | IRC §408(d)(8); IRS Notice 2025-67 (2026 QCD limit) | [qcd-vs-charitable-deduction-calculator](https://tools-berry.com/qcd-vs-charitable-deduction-calculator) |
| `adoption-credit.js` | Adoption tax credit (§23) + employer adoption-assistance exclusion (§137) | 26 U.S.C. §§23, 137; OBBBA §§70402–70403; Rev. Proc. 2025-32 §§4.04/4.18; 2025 Form 8839 | [adoption-credit-calculator](https://tools-berry.com/adoption-credit-calculator) |

14 engine files, 18 test files. `obbba-deduction.js` is the largest module — it
implements eight related OBBBA provisions that share a common phase-out/cap
shape and a dependency on `paycheck-engine.js` for marginal-rate math.

### Dependency graph

All 14 engines depend on nothing outside this package. Internal dependencies:

- `bonus-tax.js`, `obbba-deduction.js`, `dependent-care.js`, `qcd-comparison.js` → `paycheck-engine.js` (marginal-rate / bracket math)
- `qcd-comparison.js` → `obbba-deduction.js` (reuses `charitableComparison` for the take-and-deduct side, so QCD math never re-derives the charitable-deduction rules)

The remaining 9 engines (`employment-tax.js`, `form-1099-checker.js`,
`w2-box-engine.js`, `ss-maxout-engine.js`, `student-loan-cap.js`,
`able-contribution.js`, `section-127.js`, `roth-catchup.js`, and the base
`paycheck-engine.js` itself) are standalone.

## Data files

| File | Used by |
|---|---|
| `tax-data-2026.json` | `paycheck-engine.js`, `obbba-deduction.js`, `bonus-tax.js`, `qcd-comparison.js` — federal brackets/std. deduction/FICA + all 51 state tax tables |
| `obbba-deductions-2026.json` | `obbba-deduction.js`, `qcd-comparison.js` — caps, thresholds, phase-out steps for all 8 OBBBA provisions |
| `state-supplemental-2026.json` | `bonus-tax.js` — per-state supplemental-wage withholding method/rate (deliberately separate from the income-tax table; several states differ) |
| `form-1099-thresholds.json` | `form-1099-checker.js` |
| `secure2-catchup-2026.json` | `roth-catchup.js` |
| `able-limits-2026.json` | `able-contribution.js` |
| `section-127-2026.json` | `section-127.js` |
| `adoption-credit-2026.json` | `adoption-credit.js` |
| `student-loan-limits-2026.json` | `student-loan-cap.js` |
| `dependent-care-2026.json` | `dependent-care.js` |
| `ttoc-occupations.json` | `w2-box-engine.js` — the 71-occupation Treasury Tipped Occupation Code table |

## Data

Two of the reference tables above are also published as flat, ready-to-lift files:

- **`data/ttoc-occupations-2026.csv`** — the full 71-row Treasury Tipped Occupation
  Code table (code, occupation, category, description, illustrative examples, SOC
  code, and whether the row was added by the final rule). It is generated from
  `data/ttoc-occupations.json` — not hand-typed — so the two never drift, and the
  three final-rule additions (509 Visual Artists, 510 Floral Designers, 810 Gas
  Pump Attendant) are flagged in the last column.

The **canonical, always-current** version of this table lives on the site and is
the source you should cite:
**<https://tools-berry.com/data/treasury-tipped-occupation-codes/>**. That page is
searchable and sortable, offers the same data as CSV and JSON, gives every row a
stable `#code-<code>` deep-link anchor (e.g. `#code-101`), and is refreshed
whenever 26 CFR §1.224-1 changes. The CSV in this repo is a point-in-time
snapshot for offline/programmatic use; when in doubt, defer to the live page.

## What's not here

This extraction deliberately excludes everything that isn't calculation logic:

- Page templates, the static-site builder (`build.js`), and SEO/content HTML
- Ad and analytics code
- The ~40 non-tax engines in the source repo (unit converters, date math, BMI,
  password generator, etc.) and their tests
- `.env`, credentials, API tokens, and any Cloudflare/AWS deploy config
- `src/data/state-payroll-2026.json` and `src/data/states.json` — these feed
  the site's per-state content-generation pipeline (sourced-data commentary
  blocks in the HTML), not the calculation engines themselves; no engine or
  test in this package reads them

## Corrections we caught while building

Each provision below was built against a written spec that cross-checked an
initial draft/assumption against the primary source and documented what
changed. The `docs/…-spec.md` file each row cites is an internal build note,
not part of this extraction — it is listed only as provenance for where the
correction was recorded. What actually ships is the corrected figure itself,
encoded in the `data/*.json` files and asserted by the test suite (the one
`engines/w2-box-engine.js` citation is an in-repo engine header comment).

| Provision | Initial assumption | Corrected to | Source |
|---|---|---|---|
| Roth catch-up wage threshold | $145,000 (the statutory base amount, still widely quoted) | **$150,000** for 2026 — the statutory base is COLA-indexed off a Q3-2023 base period, rounded down to the nearest $5,000, and first moved for 2026 | `docs/roth-catchup-spec.md` §1.2 |
| QCD annual exclusion limit | $108,000 (2025 figure; first web search for "2026 QCD limit" returned this) | **$111,000** for 2026, per IRS Notice 2025-67 — the IRS's own newsroom QCD article still shows the stale $100,000 | `docs/qcd-vs-charitable-deduction-spec.md` §0 |
| PMI/MIP deduction phaseout ceiling | $110,000 AGI ($55,000 MFS) | **$109,000** ($54,500 MFS) — the statute phases out 10% per $1,000 "or fraction thereof," so the 10th step lands one dollar past $109,000, not at $110,000 | `docs/pmi-deduction-calculator-spec.md` §2, Correction 1 |
| Adoption credit refundable cap ($5,120 for 2026) | Applied once per return | **Per child** — Form 8839 line 11b is a per-column figure; two children can yield $10,240 refundable on one return. A per-return cap is the exact bug the engine's fixture F10 is built to catch | `docs/adoption-credit-calculator-spec.md` §Fixture F10 |
| North Carolina bonus/supplemental withholding rate | Assumed equal to NC's flat income-tax rate (3.99%) | **4.09%** — NC's supplemental-wage withholding rate is statutorily distinct from its income-tax rate; this is one of several states where the two rates deliberately differ | `docs/bonus-tax-calculator-spec.md` §Coverage table (NC row), §Risks |
| 1099-K reporting threshold for card processors (Stripe/Square) | Assumed the same $20,000 / 200-transaction rule as Venmo/PayPal | **No threshold** — §6050W splits "payment card" from "third-party network" transactions; only network transactions get the $20k/200 de-minimis rule, card processing has none ($0.01 triggers a form) | `docs/1099-threshold-checker-spec.md` Correction 2 |
| ABLE account base contribution limit ($20,000 for 2026) | Assumed still pegged to the annual gift-tax exclusion ($19,000 for 2026) | **Decoupled** — OBBBA §70115 broke that link; the ABLE base limit and the gift-tax exclusion are now independently indexed figures that happen to differ | `docs/able-account-calculator-spec.md` Correction 1 |
| Non-itemizer charitable deduction (§170(p)) AGI treatment | Assumed "above the line" meant it reduces AGI (as most tax press describes it) | **Does not reduce AGI** — IRC §63(b)(4) subtracts it after AGI is computed; it lowers federal income tax but does not help IRMAA, ACA subsidy, or Social Security taxability calculations | `docs/charitable-deduction-spec.md` Correction 2 |
| DCFSA vs. Child & Dependent Care Credit "optimal split" | Assumed a smooth optimum exists between maxing the FSA and claiming the credit | **Corner solution, not smooth** — §21(c) reduces the credit's expense cap dollar-for-dollar by the FSA exclusion; since the FSA max ($7,500) exceeds even the two-child credit cap ($6,000), maxing the FSA always zeroes the credit regardless of family size | `docs/dcfsa-child-care-credit-spec.md` Correction 1 |
| Parent PLUS loan caps under the new student-loan limits | Assumed simply excluded from the new $257,500 lifetime cap | **Gets its own new caps** — $20,000/year and $65,000 aggregate per dependent student, shared across all parents, non-restorable by repayment | `docs/student-loan-cap-calculator-spec.md` Correction 1 |
| Grad/professional $100k/$200k student-loan aggregates | Assumed lifetime odometers like the $257,500 cap | **Restorable by repayment** — ED's preamble: a borrower at the aggregate "may not receive additional Unsubsidized loans until they are repaid, whether in full or in part." Only the $257,500 and $65,000 Parent PLUS caps are true ever-borrowed odometers | `docs/student-loan-cap-calculator-spec.md` Correction 2 |
| W-2 Box 12 code TA (Trump account employer contributions) | Assumed included in Box 1 taxable wages like ordinary employer contributions | **Excluded from Box 1** — the 2026 W-2/W-3 instructions state this twice ("excluded from the gross income of the employee") | `engines/w2-box-engine.js` header comment, citing Federal Register Doc. 2026-07104 (TD 10044) and 26 CFR 1.224-1 |

## Scope and disclaimer

These engines model federal (and, for `paycheck-engine.js` / `bonus-tax.js`,
state) tax rules as enacted for tax years 2025/2026, including the 2025 One Big
Beautiful Bill Act (OBBBA, P.L. 119-21) provisions. They are estimation tools,
not tax preparation software: several intentionally omit edge cases documented
in their own header comments (e.g. `employment-tax.js` omits Additional
Medicare Tax and the QBI deduction; `dependent-care.js` models only the
FSA-vs-credit trade-off, not a full return). This is not tax advice.

## License

MIT — see [LICENSE](LICENSE). Copyright (c) 2026 Tools Berry (tools-berry.com).
