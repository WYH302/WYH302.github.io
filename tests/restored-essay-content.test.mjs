import assert from "node:assert/strict";
import fs from "node:fs";
import { createHash } from "node:crypto";
import test from "node:test";

// Full-length baseline restored from 21b8e1a^, then edited with user approval.
// The 2026-09-19 pass preserves substance and expands examples; it is not a rollback.
// Update these snapshots only after reviewing intentional body changes.
const snapshots = [
  [
    "posts/academic-hiring-risk-and-research-work/index.html",
    "9ca30e82dc75ca50b6dbc242e55122c8b704588e9f9996ecdf76c83b59db6b55"
  ],
  [
    "posts/ai-audits-power-algorithmic-governance/index.html",
    "62303e575e99d29d81b56fe90a1edb0b9df57c1f6b2c18978368e30ee062e8d0"
  ],
  [
    "posts/civil-service-security-and-ambition/index.html",
    "43f27eaf9f4b44e89a79722d97229761574f0bc68b0f2432a2c18e87b1ee5819"
  ],
  [
    "posts/education-credential-scarcity-demographic-transition/index.html",
    "f3d41cd273b8e15a5230bcedcfd3ffd729ed377c363b0fbe699894ab52875b91"
  ],
  [
    "posts/grammar-expression-information-structure/index.html",
    "ec615acdac8bb7160661aca775d1619b48d3bfb7d778803b85413c57b97941c4"
  ],
  [
    "posts/language-as-lossy-compression/index.html",
    "114be5157e6db2bb65c3f212be9139c9ddb8c7934f4dee0144815b3fc15c9417"
  ],
  [
    "posts/language-gravity-ai-bias-compression/index.html",
    "d80cd4cd0af81d353dc098cf1b96320fb828709f47ec5b767e2b6ec54691f444"
  ],
  [
    "posts/leakage-controlled-evaluation/index.html",
    "b25da1508d9564ff975e8c9b6eadcc26aab2519805e64ce50019d763bca8e327"
  ],
  [
    "posts/learning-without-context/index.html",
    "908ab908a633d2553588e7ca64d95de35b661e9f01e22dce3fd9615b7d5a0850"
  ],
  [
    "posts/machine-native-interfaces-human-centered-ai/index.html",
    "c3ae4863ce16669d2a2d2798bddec450d5f097b8bf6fe6e64293a2293b4519c2"
  ],
  [
    "posts/multimodal-agents-computational-imaging/index.html",
    "3d5bcee14698cd26d35d1a6a29b677d49ae722ed3073ce51e549ab33a278caf7"
  ],
  [
    "posts/population-property-policy-feedback/index.html",
    "30de41319d4bf92c76b559fef41834d9a2ada370997aac9c0a35fc1667fc3362"
  ],
  [
    "posts/robots-beyond-human-form-and-hype/index.html",
    "dd135d6157f8efd40c1828e2f3cac5927729255de5bdc52ed09a1775c399a33e"
  ],
  [
    "posts/tailwinds-headwinds-path-dependence-2026/index.html",
    "69afac301d4bb683c83a28eeeb8744d20016465ef2ed91f859e0cabdb5667b84"
  ],
  [
    "posts/tenure-review-youth-and-university-renewal/index.html",
    "d54b96cc7555ec417f357bfa260c8643be93b7a6ecaf0aaee98985118d8b72a6"
  ],
  [
    "posts/three-pillars-programming-ai-economics/index.html",
    "46a0cc411b499be2bacc6df26cafd673356dbd0b34b327e0c21485c265ecf56e"
  ],
  [
    "posts/two-high-one-low-social-expectations/index.html",
    "4ec6af34cf0bcbcca0b8e5da705eca19210450f1e08e9ac760b3980f51feabb9"
  ],
  [
    "posts/verifiable-multimodal-engineering/index.html",
    "d1bc56dc767baa7f725d9cb2f32b59df7ae622d3ca270d2cb76ec75d607c5838"
  ],
  [
    "posts/youth-defensive-withdrawal-and-social-trust/index.html",
    "dfdf52ce3dbc80e8354ed8044d649aab887d40a92f788d0429fb6e9857edb8b7"
  ],
  [
    "zh/posts/academic-hiring-risk-and-research-work/index.html",
    "b5fb5729c8c70e9b0b23e5fb841c0e67767efcead6a90dcc537fe82693244b0e"
  ],
  [
    "zh/posts/ai-audits-power-algorithmic-governance/index.html",
    "39c32b7f288432b38178edf5cbb6896a4d87f28c878fd85cef8159eea8e0d50a"
  ],
  [
    "zh/posts/civil-service-security-and-ambition/index.html",
    "e22663ac5f4cfb24eabfc27083718bf3d14dab7c35ad395abd9212db53e14195"
  ],
  [
    "zh/posts/education-credential-scarcity-demographic-transition/index.html",
    "9ca960718521c5ba8b7e22c960b592429c99ba886dcc5f1b9e2bf5e86810b5f0"
  ],
  [
    "zh/posts/grammar-expression-information-structure/index.html",
    "c9cff9c67a31fdf8e05f2a9bdf05b4e22fa9e0099c7e68ee79a6f368930815b8"
  ],
  [
    "zh/posts/language-as-lossy-compression/index.html",
    "671c11fb19b010270d5f8ef5b402fdb5bc9f4efd4a9866a7bb9c90c5c3b4a316"
  ],
  [
    "zh/posts/language-gravity-ai-bias-compression/index.html",
    "a787fa85ef6f0507d63901127409330cf26fbf4f1ef3b1014f6ebfcf41a958fd"
  ],
  [
    "zh/posts/leakage-controlled-evaluation/index.html",
    "5c98bee086fd420b8eff5aa0d67afc454d6c4a498f747f0c95df34fb395fa8e8"
  ],
  [
    "zh/posts/learning-without-context/index.html",
    "07a116d8130c6569ee3c7fba45d2890cd73e22a78205b28ec8b8983e0947e065"
  ],
  [
    "zh/posts/machine-native-interfaces-human-centered-ai/index.html",
    "609bb07ddaed3b0dbd37394621e80020824ff992f18db2c7f245e7d6053ba6c9"
  ],
  [
    "zh/posts/multimodal-agents-computational-imaging/index.html",
    "1941aa7c6a315537ee4514fa35aa783e00a88e523a171e7b67f27d7ec4ab7bf2"
  ],
  [
    "zh/posts/population-property-policy-feedback/index.html",
    "6d7659bb07aabdfe93040e3a65a38820618f5dbccd960caf5bb00ac8a6edc33f"
  ],
  [
    "zh/posts/robots-beyond-human-form-and-hype/index.html",
    "c4f58d6cc9d9b67c5a382279bb618182984144fbda893fc347939d7a66274b56"
  ],
  [
    "zh/posts/tailwinds-headwinds-path-dependence-2026/index.html",
    "ab5028040047fa40d3a1cfbfef0c6789f3417f38047fb92a241a853ab515c098"
  ],
  [
    "zh/posts/tenure-review-youth-and-university-renewal/index.html",
    "90ba63ef6d327104aa4471371d5265e62a2670bd85786aa619477dde44e18d20"
  ],
  [
    "zh/posts/three-pillars-programming-ai-economics/index.html",
    "2a9bfeed0fd1764184c7e297ab61fd730eb8c7cc11e44c2508714aa625faacbf"
  ],
  [
    "zh/posts/two-high-one-low-social-expectations/index.html",
    "8a75237eca1ca6c899ea4a718ce1e59288fac492c62f595aa6da36d32c8db7f3"
  ],
  [
    "zh/posts/verifiable-multimodal-engineering/index.html",
    "ba9a667fe7d7baffae41daa4dea66dac4ee129dfcb3f11779c1196cd036dde52"
  ],
  [
    "zh/posts/youth-defensive-withdrawal-and-social-trust/index.html",
    "94239ac9024114bb26b222bffaca6d91583a0cc15659002e18ca808c9a4ec5a0"
  ]
];

test("the 19 bilingual essays retain their approved editorial content", () => {
  assert.equal(snapshots.length, 38);
  for (const [route, expected] of snapshots) {
    const html = fs.readFileSync(new URL("../" + route, import.meta.url), "utf8").replace(/\r\n/g, "\n");
    const body = html.match(/<main\b[^>]*>[\s\S]*?<\/main>/)?.[0];
    assert.ok(body, route);
    assert.equal(createHash("sha256").update(body).digest("hex"), expected, route);
  }
});

test("the Chinese result-first example matches its English explanation", () => {
  const zh = fs.readFileSync(new URL("../zh/posts/grammar-expression-information-structure/index.html", import.meta.url), "utf8");
  const en = fs.readFileSync(new URL("../posts/grammar-expression-information-structure/index.html", import.meta.url), "utf8");
  assert.match(zh, /结果在前更有效：“发布取消，因为安全检查没有通过。”/);
  assert.match(en, /We are cancelling the launch because the safety check\s+failed/);
});

test("short research notes retain concrete examples and their evidence boundaries", () => {
  const cases = [
    ["multimodal-agents-computational-imaging", "待检验的流程设计，并非已有实验结果", "a workflow to test, not a report"],
    ["leakage-controlled-evaluation", "测试期的分布已经参与了预处理", "test distribution has already influenced preprocessing"],
    ["verifiable-multimodal-engineering", "假设的石材排样任务", "hypothetical stone-nesting task"],
  ];
  for (const [slug, zhText, enText] of cases) {
    assert.ok(fs.readFileSync(new URL("../zh/posts/" + slug + "/index.html", import.meta.url), "utf8").includes(zhText), slug);
    assert.ok(fs.readFileSync(new URL("../posts/" + slug + "/index.html", import.meta.url), "utf8").includes(enText), slug);
  }
});
