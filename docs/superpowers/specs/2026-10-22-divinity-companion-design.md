# Divinity Companion — Design Doc (v2)

Date: 2026-10-22
Owner: ufuomazech62-cpu
Status: awaiting owner approval
Supersedes: docs/superpowers/specs/2026-10-22-divinity-reflection-bot-design.md
(N.E.K.O-brain plan — kept as reference; that fork remains a concept/license
reference, not the base).

## Intent & why

The product base is now **Enclave** (yuanzui0728, MIT): a personal-assistant
world — AI residents with schedules and relationships, proactive outreach,
private knowledge base, **real document artifacts (PPT/Word/Excel
renderers in-code)**, iMessage-style social UI, Docker deploys, web +
desktop + Android/iOS shells. Our fork: `ufuomazech62-cpu/divinity-companion`.

We rebrand it **Divinity Companion**, blend the owner's purpose (a
reflective companion for students, kids, and adults in California-born-but-
global usage), and convert it from a self-hosted single-owner BYOK world
into a **multi-tenant SaaS**. Divinity-final (old React/Firebase UI) and
the N.E.K.O Python core are both retired as bases; their surviving ideas
re-enter as content/design below.

## Locked decisions (owner-confirmed)

- Hosting: **Oracle-class Ubuntu VM(s) + Docker Compose, Cloudflare front**
  (Pages for web, CF proxy/WAF to origin), **MongoDB Atlas** (free tier →
  paid tiers with growth), artifacts → Cloudflare **R2** (zero egress) later.
  Rejected: Cloud Run (WebSocket+cron rework, always-warm + egress bills),
  Cloudflare-Workers-for-everything (breaking rewrite), Sealos.
- Auth: **Google OIDC only** → our JWT sessions; parent-managed child
  slots for minors. No student-email path.
- AI keys: **platform-hosted** central keys; users never supply keys;
  per-user/tier quotas (free daily cap, paid tiers — numbers set by owner
  before P3).
- Audience includes minors: **kid-safe moderation middleware** (hard-block
  generation + friendly deflect + short auto-purge review log), strictest
  good-faith minors policy (COPPA-style under-13 gate behind verified
  parent consent; Nigeria NDPA awareness).
- Brand: **"Divinity Companion"** — brand-layer rename now (strings, UI,
  README, titles); internal identifiers (`@enclave/*`, env names, schema)
  renamed later in test-green codemod stages. Nothing breaks.
- Language: **full English conversion** of the Chinese surface
  (~67k CJK lines / 1,155 files): i18n locale files first (mechanical),
  persona/character presets re-authored fresh in English, comments/docs
  translated as touched. CI green after every batch; logic untouched.
- Persona: original defaults — the companion answers to its user-chosen
  name (Enclave lets users name their AI; carry it forward); flagship
  default character "Lola" written fresh (warm mixed Afro-Caucasian look,
  California-born global audience). No third-party persona text copied.

## Architecture (what exists / what we add)

Existing (verified in-repo): NestJS api (socket.io gateway, Mongoose,
@nestjs/schedule cron, artifact skill renderers, ai-orchestrator with
OpenAI-protocol gateways, web search), web app + shells, Docker
compose (web/api/site), knowledge-base flows, Moments/groups/feed.

Additions (ours):
```
CF Pages (web build) → CF proxy (WAF/WSS) → Oracle VM: docker compose
   ├─ api        NestJS core (multi-tenant改造 on top)
   ├─ mongod/Atlas
   ├─ auth        Google OIDC → signed JWT sessions; tenant/user model
   ├─ billingless launch quotas  per-user-day ledger (tiered)
   ├─ moderation  pre/post-LLC middleware, age-aware strictness
   └─ artifacts   local disk at launch → R2 (zero-egress) when live
```

Multi-tenancy (plan B): one shared api; every query/agent path keyed by
tenant+user; global document filters; per-user memory namespaces; rate
gates; audit logs. Horizontal scale = more api containers/VMs behind CF
LB; Portal Mongo Atlas scales its own layer.

## Approaches considered (for the record)

1. **Enclave base (chosen)** — closest product to the vision; documents
   shipped; mobile shells shipped; MIT.
2. Airi base (rejected 2026-10-22 after verification): great avatar stack
   + agent runtime, but its hosted app's tool surface is thin (no
   document generation — owner's key complaint), Vue monorepo. Its MIT
   **model-driver-magic-live2d + VRM/lipsync packages are still adopted
   inside our web app for the avatar showcase (P2)**.
3. N.E.K.O brain (rejected): desktop-bound Python; its 5-dim memory +
   persona mechanics port as design concepts only.
4. Cloud Run / Workers / Sealos hosting (rejected — see constraints).

## Phasing

- **P0 Re-brand & skeleton:** fork → brand rename (safe layer), i18n
  locale conversion batch 1, Google OIDC auth-gateway + JWT, tenant/user
  schema + isolation wiring, deploy on 1 Oracle VM behind CF (staging).
- **P1 SaaS core:** hosted-key provider gateway + quota ledger + moderation
  middleware (+ age flag + parent-gate flow), multi-user onboarding UX,
  English persona/character content batch (incl. Lola).
- **P2 Experience:** Divinity glass reskin, avatar showcase (Airi drivers
  inside the web app), artifacts → R2, PWA/mobile polish (android/ios
  shells build test), rename-identifier codemod behind green CI.
- **P3 Launch:** Stripe tiers, load test, observability, docs (README
  rewrite English), public launch checklist (moderation + minors).

## Left to the builder

Tenant schema details, quota/ledger implementation, moderation provider
selection + thresholds, codemod plan details, Terraform/manual VM setup,
CF config, test strategy per phase, exact aura extraction (Airi packages
integration steps), pricing numbers (owner, pre-P3).
