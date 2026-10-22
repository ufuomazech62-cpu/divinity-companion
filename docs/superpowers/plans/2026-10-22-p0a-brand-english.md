# P0-A: Brand Rename + User-Facing English Conversion — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans
> (owner pre-approved native inline execution; no subagent handoff needed).

**Goal:** Enclave fork ships user-visible as "Divinity Companion" in
English: brand strings renamed and the three user-facing translation
catalogs (app, shared, site) fully English at their en-US bundles.

**Architecture:** Lingui gettext catalogs live in `packages/i18n/catalogs/`.
The en-US `.po` bundles are the shipped English UI; today they are largely
Chinese (`app/en-US.po`: 6,405 CJK lines). We translate en-US msgstrs
in-place (msgid immutable), rename brand strings at their definitions, and
add a CI-guard test that fails if CJK or the old brand leaks back into the
user-facing surface. Internal identifiers (`@yinjie/*`, schema, docker
names) are explicitly NOT touched this phase.

**Tech Stack:** pnpm monorepo (turbo), React 19 + Vite + Lingui (+
@lingui/react, @react-oauth/google already present), vitest (jsdom) in
`apps/app`.

**Spec:** `docs/superpowers/specs/2026-10-22-divinity-companion-design.md`
(phases P0-P2; this plan = P0 items: brand rename + English conversion
batch 1).

## Global Constraints

- Brand string everywhere user-visible: **`Divinity Companion`** (exact).
- Never edit `msgid` lines in `.po` files; only `msgstr ""` and header
  fields may change.
- Never invent persona/character content this phase; translate what
  exists into natural English (persona authoring is P1/Lola task).
- No logic changes outside string/i18n files; `pnpm -F @yinjie/app
  typecheck && pnpm -F @yinjie/app build` must pass after every task.
- Old-identifiers left quoting untouched: package names (`@yinjie/app`),
  env vars, routes, DB fields stay as-is (rename is P2 codemod phase).
- Every task commits separately with `feat|test|docs:` prefixes.

## Review Focus

1. CJK still reachable in first-paint before catalog load — known sink:
   `apps/app/src/i18n/static-dom-seed.ts`. Pin: Task 4's guard test
   asserts zero CJK in that file.
2. Brand leaks in hard-coded component strings (share cards, composer).
   Pin: Task 1 guard test asserts zero `Enclave|隐界` in the listed
   component set.
3. `$t`-context msgstrs (Lingui placeholders like `{name}`) broken during
   translation. Pin: Task 3 verification greps converted msgstrs for
   unmatched `{...}` placeholders vs msgid.
4. Catalog compile breaks (Lingui expects valid po). Pin: Task 3 step
   runs the catalog compile/build and requires exit 0.
5. Default-locale regression: app boot picking zh-CN. Pin: Task 5 adds
   the test asserting the boot default is `en-US`.

---

### Task 1: Brand/English guard test (failing first)

**Files:**
- Test: `apps/app/tests/brand-english.test.ts` (new)
- Modify: `apps/app/package.json` (scripts: add `"test:brand": "vitest run
  --environment jsdom tests/brand-english.test.ts"`)

**Interfaces:**
- Produces: exported test file no other task imports; other tasks run
  `pnpm -F @yinjie/app test:brand` as their gate. Test constants
  `BRAND = "Divinity Companion"` and
  `BRAND_FILES = ["apps/app/index.html", "apps/app/src/components/bootstrap-screen.tsx", "apps/app/src/components/chat-message-list.tsx", "apps/app/src/components/share-card-modal.tsx", "apps/app/src/components/feed-post-share-card-modal.tsx", "apps/app/src/components/chat-composer.tsx", "apps/app/src/i18n/static-dom-seed.ts"]` and
  `CATALOGS = ["packages/i18n/catalogs/app/en-US.po", "packages/i18n/catalogs/shared/en-US.po", "packages/i18n/catalogs/site/en-US.po", "apps/app/src/i18n/static-dom-seed.ts"]` (test
  resolves repo root from `new URL("../../../../", import.meta.url)`).

- [ ] **Step 1: Write the failing test** — three `describe` blocks:
  (a) each `BRAND_FILES` path contains no `/Enclave|隐界/`;
  (b) each `BRAND_FILES` html/ts file containing a product-name context
  (match `/>Divinity|title|品牌名/` loosely: just assert at least one
  file contains `Divinity Companion`) ;
  (c) each `CATALOGS` file contains no `/[\u4e00-\u9fff]/`.
- [ ] **Step 2: Run** `pnpm -F @yinjie/app test:brand` — Expected: FAIL.
- [ ] **Step 3: Commit** `test: add brand/english leak guard`

### Task 2: Brand rename in user-facing surface

**Files:** Modify the six component files + `apps/app/index.html` listed
in `BRAND_FILES` (Task 1), replacing user-visible `Enclave`/`隐界`
product-name occurrences with `Divinity Companion`. Where the legacy
string appears as a phrase with casing variants (e.g. "enclave"), match
visually and keep grammar; identifiers/keys (`enclave` in code, css vars,
imports) remain untouched.

- [ ] **Step 1:** `grep -n "Enclave\|隐界" <each file>` to enumerate exact
  lines; edit each occurrence (strings, JSX text, `<title>`, meta
  description in index.html).
- [ ] **Step 2: Run** `pnpm -F @yinjie/app test:brand` — blocks (a)/(b):
  Expected: brand tests PASS, po test still FAIL.
- [ ] **Step 3: Run** `pnpm -F @yinjie/app typecheck` — Expected: exit 0.
- [ ] **Step 4: Commit** `feat: rename user-facing brand to Divinity Companion`

### Task 3: Convert app + shared + site en-US catalogs to real English

**Files:** Modify `packages/i18n/catalogs/app/en-US.po`,
`packages/i18n/catalogs/shared/en-US.po`, `packages/i18n/catalogs/site/en-US.po`.
Reference (read-only): matching `zh-CN.po` for ambiguous msgids.

**Interfaces:**
- Consumes: nothing new. Produces: en-US catalogs whose every non-empty
  `msgstr` is CJK-free; `msgid` lines and `#~` obsolete entries untouched.

- [ ] **Step 1:** In each catalog, identify entries whose `msgstr` is
  empty or contains CJK: `grep -n -A1 "^msgid" <file>` — convert in
  batches of ~200 msgid/msgstr pairs per commit, preserving `{...}`
  placeholders exactly as in msgid, translating to natural English,
  persona-neutral. Keep plural forms (`msgstr[0/1]`) grammatical.
- [ ] **Step 2:** After each batch run
  `node packages/i18n/scripts/*compile*` (discover exact compile script
  name via `ls packages/i18n/scripts` at execution; it exists — use it;
  if it has a package.json bin, `pnpm -F @yinjie/i18n build`) —
  Expected: exit 0.
- [ ] **Step 3:** Once per file complete:
  `! grep -P "[\x{4e00}-\x{9fff}]" <file>` — Expected: no output.
- [ ] **Step 4:** Commit per batch `feat: english en-US po batch (app|shared|site) N`

### Task 4: English static-dom-seed

**Files:** Modify `apps/app/src/i18n/static-dom-seed.ts` only.

- [ ] **Step 1:** Translate all Chinese string literals to English,
  keeping DOM structure/classes unchanged; product name becomes
  `Divinity Companion`.
- [ ] **Step 2: Run** `pnpm -F @yinjie/app test:brand` — Expected: PASS all.
- [ ] **Step 3:** `pnpm -F @yinjie/app typecheck` — exit 0. Commit
  `feat: english static-dom-seed`.

### Task 5: Default locale = en-US at boot

**Files:** Discover then modify the boot locale call in `apps/app/src`
(`grep -rn "setLocale\|'zh-CN'\|\"zh-CN\"" apps/app/src | head`); likely
one definition site (src/i18n static advance or `client-provider` in
apps/site for web). Change initial/default to `en-US`; keep a lazily
loaded locale switcher intact if present.

**Interfaces:**
- Produces: boot default `en-US`.

- [ ] **Step 1:** Edit default(s). **Step 2:** extend
  `tests/brand-english.test.ts` with a boot-default test asserting the
  file(s) found in Step 1 contain the literal `en-US` as the default
  locale argument. Run `test:brand` → PASS. **Step 3:** Commit
  `feat: default locale en-US`.

### Task 6: Site README + final verification

**Files:** Modify root `README.md` (if upstream README is Chinese, replace
its body with the existing English README content — `README.en.md` or
READMEs in other languages present upstream — credited unchanged; if no
English README exists, write a 20-line original English README: product
one-para + run instructions copied from existing scripts).

- [ ] **Step 1:** README swap, keep upstream license references intact
  (MIT attribution preserved).
- [ ] **Step 2:** Final gates:
  `pnpm -F @yinjie/app test:brand && pnpm -F @yinjie/app typecheck &&
  pnpm -F @yinjie/app lint && pnpm -F @yinjie/app build` — Expected: all
  exit 0.
- [ ] **Step 3:** Commit `docs: english readme` then push branch
  `p0a-brand-english` to origin as PR head (no merge without owner CI).
