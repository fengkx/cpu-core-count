import * as spwan from "@jsdevtools/ez-spawn";
import { randomUUID } from "crypto";
import assert from "node:assert";
import { after, before, describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const dockerImage = `cpu-core-count:${randomUUID().slice(0, 5)}`.trimEnd();

const projectDir = fileURLToPath(new URL("..", import.meta.url));
before(() => {
  spwan.sync(`docker build -t ${dockerImage} ${projectDir}`, { stdio: "inherit" });
});

after(() => {
  spwan.sync(`docker image rm ${dockerImage}`.trim());
});

after(async () => {
});

describe("report correct cpu count", () => {
  const binCompatiblePlatforms = ["node", "bun"];
  for (const platform of binCompatiblePlatforms) {
    it(`should work in ${platform}`, () => {
      const expected = 1.5;
      const { stdout } = spwan.sync(`docker run -i --rm --cpus ${expected} cpu-core-count ${platform} dist/bin.js`, {
        stdio: "pipe",
      });
      assert.strictEqual(Number(stdout), expected);
    });
  }

  it("should work in deno", () => {
    const expected = 1.5;
    const { stdout } = spwan.sync(`docker run -i --rm --cpus ${expected} cpu-core-count deno run -A tests/deno.ts`, {
      stdio: "pipe",
    });
    assert.strictEqual(Number(stdout), expected);
  });
});
