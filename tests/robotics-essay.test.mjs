import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { postSlugs } from "../scripts/bilingual-routes.mjs";
import { postPublicationTimes } from "../scripts/post-publication-times.mjs";

const slug = "robots-beyond-human-form-and-hype";

test("the robotics essay retains both arguments and its source boundaries in both languages", () => {
  assert.ok(postSlugs.includes(slug));
  assert.equal(postPublicationTimes[slug], "2026-09-15T16:00:00+08:00");
  const en = fs.readFileSync(new URL("../posts/" + slug + "/index.html", import.meta.url), "utf8");
  const zh = fs.readFileSync(new URL("../zh/posts/" + slug + "/index.html", import.meta.url), "utf8");
  for (const html of [en, zh]) {
    assert.equal((html.match(/<h1>/g) || []).length, 1);
    assert.match(html, /RT-1/);
    assert.match(html, /RT-2/);
    assert.match(html, /13/);
    assert.match(html, /17/);
    assert.match(html, /6,000/);
    for (const source of [
      "https://deepmind.google/blog/rt-2-new-model-translates-vision-and-language-into-action/",
      "https://www.worldlabs.ai/blog/real-to-sim-to-real",
      "https://www.12371.cn/2021/11/09/ARTI1636454249781129.shtml",
    ]) assert.equal(html.split('href="' + source + '"').length - 1, 1);
    assert.doesNotMatch(html, /Now I want you|help me to post/);
  }
  assert.match(en, /Humanoid form should be a conclusion reached through comparison/);
  assert.match(zh, /人形应该是比较的结论/);
  assert.match(en, /not equating contemporary research/);
  assert.match(zh, /并不把今天的科研活动与当年的政治运动及其灾难后果等同/);
  assert.match(en, /not an allegation about a particular statement/);
  assert.match(zh, /不是对上述研究者具体言论的指控/);
});
