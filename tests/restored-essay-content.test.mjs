import assert from "node:assert/strict";
import fs from "node:fs";
import { createHash } from "node:crypto";
import test from "node:test";

// User-approved full-length content restored from 21b8e1a^.
// Update only for intentional, approved changes to these article bodies.
const snapshots = [
  [
    "posts/ai-audits-power-algorithmic-governance/index.html",
    "867a92ca648be420b3f63f6bb0cec79500c3e81453f3ff7944aec964d3beaae0"
  ],
  [
    "posts/civil-service-security-and-ambition/index.html",
    "e951b138a541dd4553372065bf74eb48689c67ebca64ca0f0ca3242a422a58cb"
  ],
  [
    "posts/education-credential-scarcity-demographic-transition/index.html",
    "033ea5bdd7d1faff3ef41c036cab2fd33397d34bcec092fe6ec568b3648979cb"
  ],
  [
    "posts/grammar-expression-information-structure/index.html",
    "0692669f0f4adcaae58eee915fd6da1716749dbdcacf71cc0ca38f535d6a85ac"
  ],
  [
    "posts/language-as-lossy-compression/index.html",
    "8953a60c6f7f8d770ca2756d9dc8d639081104da5aa6aec697d3f81c257b9bb9"
  ],
  [
    "posts/language-gravity-ai-bias-compression/index.html",
    "e3541651dca5517785ac0ecfc880b5e7bd5fe7137a701344d88784a9c61f1e36"
  ],
  [
    "posts/leakage-controlled-evaluation/index.html",
    "e504a13af754d3b0c83e5f9c22eff63ab013e505266e1f0c63f36e7eaefd4ae9"
  ],
  [
    "posts/multimodal-agents-computational-imaging/index.html",
    "db9e209f1887b61411d5a085e06901ba2e34a3d5230555f2d20203a4a4e68f2d"
  ],
  [
    "posts/population-property-policy-feedback/index.html",
    "cfae6eadda93bc266cacd1bb355e1a9edacfabb5c7ac56dddb5232feebabcab9"
  ],
  [
    "posts/tailwinds-headwinds-path-dependence-2026/index.html",
    "de320cdca3c4d25ae77ee05443de6a39ffb6f3d8719bcb7c024b4d3668f3aed8"
  ],
  [
    "posts/tenure-review-youth-and-university-renewal/index.html",
    "274ff559e486582a70d9c188ad6a6895c1ffba76d03e5ec6ce1fa94cc1e15708"
  ],
  [
    "posts/three-pillars-programming-ai-economics/index.html",
    "8864aa0b130973efa25c3ae1f39fcaf09c387a6f74fe1632fd21057770631a7c"
  ],
  [
    "posts/two-high-one-low-social-expectations/index.html",
    "50423bd8f25757f558406b51f3989621c65ef79cc94d4d790274ceefedb4bbcc"
  ],
  [
    "posts/verifiable-multimodal-engineering/index.html",
    "833f3bb98b11351e93ed2d69b18bf5c513dd21993d869e619af3cac7b0e3f8fa"
  ],
  [
    "posts/youth-defensive-withdrawal-and-social-trust/index.html",
    "6b5a109f4001d25e0a3abfd5e9c68cceb7dc5812ca5302abba91a85eab453c37"
  ],
  [
    "zh/posts/ai-audits-power-algorithmic-governance/index.html",
    "9464dce612e190ed2b8506e820fb18606b8f860c09f19435292d7654372a6e87"
  ],
  [
    "zh/posts/civil-service-security-and-ambition/index.html",
    "a47d689cb6e34d971d0fe1edf10f8cf156e0f29b49d3b7caefa265ab255c17fc"
  ],
  [
    "zh/posts/education-credential-scarcity-demographic-transition/index.html",
    "9d275c67969db3d677f6593b554730f9244699bfce0175d4da3aa8611c76eb44"
  ],
  [
    "zh/posts/grammar-expression-information-structure/index.html",
    "e833dc9d06073d9f8931dcdc00273c94b1012e25f962aff1d0388ab2e3c0d82f"
  ],
  [
    "zh/posts/language-as-lossy-compression/index.html",
    "1033014aeb5f69b5b833c8da7c22700abda307c8bb38b423df948f5f17a09915"
  ],
  [
    "zh/posts/language-gravity-ai-bias-compression/index.html",
    "f7fdb9d66dd0a6feb315d8cd997b47599bf03589b35d90c21102d76ae33e20ca"
  ],
  [
    "zh/posts/leakage-controlled-evaluation/index.html",
    "9c087dcea591ad76d11e4189e0d8b2007d35155f76668f18a845fad9d2f19087"
  ],
  [
    "zh/posts/multimodal-agents-computational-imaging/index.html",
    "24d110ea2d11ff66111b0d81f3f29263016b514b011f90ea44c917ab8278b693"
  ],
  [
    "zh/posts/population-property-policy-feedback/index.html",
    "f6cf63278b50eff2209590c2311d9794aa29f632705859e35f0c21a685384114"
  ],
  [
    "zh/posts/tailwinds-headwinds-path-dependence-2026/index.html",
    "252b74a56518d43f1556722983f2e6fd7a6cf1b16e7fd83680a0fcc45b441ad1"
  ],
  [
    "zh/posts/tenure-review-youth-and-university-renewal/index.html",
    "eddbe8dfbad6fc7ca1e9752608ae1d912c7e4d4564254e0be14186796b28f2ca"
  ],
  [
    "zh/posts/three-pillars-programming-ai-economics/index.html",
    "3ddb89767c030d78d692b34a7fc48ce76d7622407decb16eaf1ea463f3796474"
  ],
  [
    "zh/posts/two-high-one-low-social-expectations/index.html",
    "3601d227cc19c8e2e5b97e2913ded785a20775158412bca70daf5bc51e658c42"
  ],
  [
    "zh/posts/verifiable-multimodal-engineering/index.html",
    "7c17d0fc04c0223da0583e66a2898e4e3dec2ca35ad84725a17ea220bce756da"
  ],
  [
    "zh/posts/youth-defensive-withdrawal-and-social-trust/index.html",
    "d7a1050390473f37491147429aa47ba5d8deb7051da25e81e6f692e8c5d0b367"
  ]
];

test("the 15 restored bilingual essays retain their approved full-length content", () => {
  assert.equal(snapshots.length, 30);
  for (const [route, expected] of snapshots) {
    const html = fs.readFileSync(new URL("../" + route, import.meta.url), "utf8").replace(/\r\n/g, "\n");
    const body = html.match(/<main\b[^>]*>[\s\S]*?<\/main>/)?.[0];
    assert.ok(body, route);
    assert.equal(createHash("sha256").update(body).digest("hex"), expected, route);
  }
});
