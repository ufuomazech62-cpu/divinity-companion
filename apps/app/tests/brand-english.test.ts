import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// vitest rewrites import.meta.url to a virtual module id; resolve the repo
// root from the working directory instead (script runs with cwd = apps/app).
const ROOT = `${path.resolve(process.cwd(), "..", "..")}/`;

const BRAND = "Divinity Companion";

const BRAND_FILES = [
  "apps/app/index.html",
  "apps/app/src/components/bootstrap-screen.tsx",
  "apps/app/src/components/chat-message-list.tsx",
  "apps/app/src/components/share-card-modal.tsx",
  "apps/app/src/components/feed-post-share-card-modal.tsx",
  "apps/app/src/components/chat-composer.tsx",
];

const CATALOGS = [
  "packages/i18n/catalogs/app/en-US.po",
  "packages/i18n/catalogs/shared/en-US.po",
  "packages/i18n/catalogs/site/en-US.po",
  "apps/app/src/i18n/static-dom-seed.ts",
];

function read(rel: string): string {
  return readFileSync(`${ROOT}${rel}`, "utf8");
}

describe("brand rename to Divinity Companion", () => {
  for (const rel of BRAND_FILES) {
    it(`${rel} has no legacy brand strings`, () => {
      const content = read(rel);
      expect(content).not.toMatch(/Enclave|隐界/);
    });
  }

  it("at least one brand file names the product", () => {
    const hits = BRAND_FILES.filter((rel) => read(rel).includes(BRAND));
    expect(hits.length).toBeGreaterThan(0);
  });
});

describe("user-facing english catalogs", () => {
  for (const rel of CATALOGS) {
    it(`${rel} contains no CJK`, () => {
      const content = read(rel);
      expect(content).not.toMatch(/[\u4e00-\u9fff]/);
    });
  }
});
