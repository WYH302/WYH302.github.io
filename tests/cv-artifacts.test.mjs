import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { localOnlySourcePaths } from "../scripts/publish-safety.mjs";


const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

const privateGenerator = fs
  .readdirSync(root, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => path.join(root, entry.name, "generate_resumes.py"))
  .find((candidate) => fs.existsSync(candidate));

test("CV pages do not offer the local-only resume PDF for download", () => {
  const englishCv = read("cv/index.html");
  const chineseCv = read("zh/cv/index.html");

  assert.doesNotMatch(englishCv, /cv\.pdf|Download PDF|download=/);
  assert.doesNotMatch(chineseCv, /cv\.pdf|下载 PDF|download=/);
  assert.ok(localOnlySourcePaths.has("assets/files/cv.pdf"));
  assert.match(read(".gitignore"), /^\/assets\/files\/cv\.pdf$/m);
});

test("Latent Space Imaging is synchronized as a conservative current manuscript", () => {
  const englishPublications = read("publications/index.html");
  const chinesePublications = read("zh/publications/index.html");

  assert.match(englishPublications, /Latent Space Imaging Reproduction and Extension/);
  assert.match(englishPublications, /Current manuscript \| Not a publication/);
  assert.match(chinesePublications, /Latent Space Imaging 复现与扩展/);
  assert.match(chinesePublications, /<p class="item-meta">当前稿件<\/p>/);
  assert.doesNotMatch(englishPublications, /Under Review/i);
  assert.doesNotMatch(chinesePublications, /Under Review/i);
});

test("verified publication metadata is synchronized across both publication pages", () => {
  const englishPublications = read("publications/index.html");
  const chinesePublications = read("zh/publications/index.html");
  const combined = `${englishPublications}\n${chinesePublications}`;

  assert.match(combined, /Visual-Neural-Inspired Image Inpainting for Specific Objects-of-Interest Imaging/);
  assert.match(combined, /arXiv:2508\.12808v4/);
  assert.match(combined, /10\.48550\/arXiv\.2508\.12808/);
  assert.match(combined, /Archives of Gerontology and Geriatrics, 2026, 150, 106362/);
  assert.match(combined, /10\.1016\/j\.archger\.2026\.106362/);
  assert.match(combined, /42526303/);
  assert.doesNotMatch(combined, /A Visual-Neural Network for Specific Objects-of-Interest Inpainting/);
});

test("CV pages use the confirmed graduate, award, and contributor wording", () => {
  const englishCv = read("cv/index.html");
  const chineseCv = read("zh/cv/index.html");
  const englishProjects = read("projects/index.html");
  const chineseProjects = read("zh/projects/index.html");

  assert.match(englishCv, /I received my master's degree from South China Normal University/);
  assert.match(chineseCv, /华南师范大学硕士毕业生/);
  assert.match(englishCv, /Lanqiao Cup/);
  assert.doesNotMatch(englishCv, /Master'?s student|Blue Bridge Cup/i);
  assert.match(englishProjects, /Core technical contributor/);
  assert.match(chineseProjects, /核心技术贡献者/);
  assert.doesNotMatch(englishProjects, /Core technical lead/i);
  assert.doesNotMatch(chineseProjects, /核心技术负责人/);
});

test(
  "every published CV paper retains a GitHub link",
  { skip: !privateGenerator },
  () => {
    const privateTex = fs.readFileSync(
      path.join(path.dirname(privateGenerator), "main.tex"),
      "utf8",
    );
    const publishedBlock = privateTex
      .split("\\cvsubsection{Published Papers}")[1]
      .split("\\cvsubsection{Manuscripts Under Review}")[0];

    assert.equal((publishedBlock.match(/\\faGithub/g) ?? []).length, 5);
    assert.equal((publishedBlock.match(/\\faExternalLink\*/g) ?? []).length, 0);
    assert.doesNotMatch(publishedBlock, /arxiv\.org\/abs\/2508\.12808/);
    assert.match(
      publishedBlock,
      /Image-Inpainting-based-on-Vibjectsual-Neural-Inspired-Specific-O-of-Interest-Imaging-Technology/,
    );
  },
);

test(
  "private CV uses unified body typography on both pages",
  { skip: !privateGenerator },
  () => {
    const privateTex = fs.readFileSync(
      path.join(path.dirname(privateGenerator), "main.tex"),
      "utf8",
    );

    assert.equal(
      (privateTex.match(/\\fontsize\{10\}\{11\.5\}\\selectfont/g) ?? []).length,
      2,
    );
    assert.equal(
      (privateTex.match(/left=1\.00cm,right=1\.00cm/g) ?? []).length,
      2,
    );
    assert.match(privateTex, /itemsep=0pt,topsep=0\.04em/);
    assert.match(privateTex, /top=0\.80cm,bottom=0\.80cm/);
    assert.doesNotMatch(privateTex, /\\fontsize\{9\.[45]\}\{(?:10\.8|11\.3)\}/);
  },
);
test(
  "local resume generator encodes the confirmed submission facts",
  { skip: !privateGenerator },
  () => {
    const source = fs.readFileSync(privateGenerator, "utf8");
    const submittedTitles = [
      "MC-SAM",
      "MECR",
      "Auditable Neural Equation-DAG Export",
      "TyphoFormer++",
      "When Does Retrieval Help Missing-History Trajectory Prediction?",
      "ARGS",


    ];

    for (const title of submittedTitles) {
      assert.ok(source.includes(title), `missing confirmed submitted title: ${title}`);
    }

    assert.match(source, /SUBMITTED_EN\s*=\s*\[/);
    assert.match(source, /Submitted manuscript portfolio/);
    assert.match(source, /M\.S\. graduate at South China Normal University/);
    assert.match(source, /Core technical contributor/);
    assert.match(source, /Lanqiao Cup/);
    assert.doesNotMatch(source, /Under review; (?:first|second) author/i);
    assert.doesNotMatch(source, /Skill area|Blue Bridge Cup|SAM-COD\+\+|Core technical lead|English manuscript drafting|英文论文写作|Research concept|Research manuscript|研究设想|研究稿件/);
  },
);
