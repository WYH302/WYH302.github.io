import path from "node:path";

// Illustrative stock photographs, never images of our experiments.
// Provenance and licenses: docs/image-credits.md.
export const researchPhotos = {
  geometry: ["research/geometry", "彩色积木的几何形状与组合", "Geometric shapes assembled from coloured wooden blocks"],
  lens: ["research/lens", "透过镜头观察景物", "A scene viewed through a camera lens"],
  cotton: ["research/cotton", "田间成熟的棉花", "Mature cotton in a field"],
  ageing: ["research/ageing", "老年人交握的双手", "An older person's clasped hands"],
  camouflage: ["research/camouflage", "绿叶间的变色龙", "A chameleon among green leaves"],
  microscopy: ["research/microscopy", "显微镜下的观察工作", "Observation through a laboratory microscope"],
  hurricane: ["research/hurricane", "从卫星俯瞰飓风眼", "A satellite view of a hurricane's eye"],
  markets: ["research/markets", "屏幕上的金融市场图表", "Financial market charts on a screen"],
  prism: ["research/prism", "棱镜折射形成的光谱", "Light refracted into a spectrum by a prism"],
  servers: ["research/servers", "数据中心的服务器机架", "Server racks in a data centre"],
  robotics: ["research/robotics", "工厂中的自动化机械臂", "Industrial robotic arms in a factory"],
  railway: ["research/railway", "车站中的客运列车", "A passenger train at a station"],
  palace: ["research/palace", "传统宫殿建筑的屋顶与院落", "Roofs and courtyards of a historic Chinese palace"],
  medical: ["research/medical", "医学成像检查的准备过程", "Preparation for a medical imaging examination"],
  city: ["city-crossing", "城市路口的人群与通行路线", "People and routes through a city crossing"],
  architecture: ["architecture", "城市建筑上排列的窗户", "Repeating windows on an urban building"],
  books: ["books", "书架上排列的书籍", "Books arranged on shelves"],
  circuits: ["circuits", "电路板上的元件与连接", "Components and connections on a circuit board"],
  vessel: ["bridge-and-vessel", "桥梁下航行的集装箱船", "A container ship passing beneath a bridge"],
};

// Stable title prefixes keep the image mapping independent of list order.
export const publicationImageRules = [
  ["Detection and Recognition of Visual Geons", "geometry"],
  ["Visual-Neural-Inspired Image Inpainting", "lens"],
  ["A Lightweight Convolutional", "cotton"],
  ["A Target Behavior Pattern", "vessel"],
  ["Survival gains and healthy life expectancy", "ageing"],
  ["MC-SAM:", "camouflage"],
  ["MECR:", "microscopy"],
  ["Auditable Neural Equation-DAG", "circuits"],
  ["TyphoFormer++:", "hurricane"],
  ["When Does Retrieval Help", "city"],
  ["Noise Refined is News Aligned", "markets"],
  ["PressureTest-Biz:", "architecture"],
  ["De-Civ Lite:", "books"],
  ["Latent Space Imaging", "prism"],
  ["PASTA++:", "geometry"],
  ["Flow-Matched Ultra-High-Ratio", "lens"],
  ["Physical-Perceptual Proximal", "prism"],
  ["MedVSR++:", "medical"],
  ["Language-Conditioned Persona", "books"],
  ["OptiKV-Fabric:", "servers"],
  ["Task-Organization Matching", "robotics"],
  ["FailSafe-Fi:", "circuits"],
  ["Embodied Value Grounding", "robotics"],
  ["Safety-Constrained Dynamic Coupling", "railway"],
  ["Diagnosing Occupational AI Exposure", "servers"],
  ["AncientVoice:", "palace"],
  ["Beyond Income Poverty:", "city"],
  ["When Shocks Open Mobility Windows:", "palace"],
];

function escapeAttribute(value) {
  return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

export function addPublicationImages(html, route) {
  if (!["publications/index.html", "zh/publications/index.html"].includes(route)) return html;
  const zh = route.startsWith("zh/");
  const root = path.posix.relative(path.posix.dirname(route), ".");
  return html.replace(/<article class="(feature-item[^"]*)">([\s\S]*?)<\/article>/g, (whole, classes, body) => {
    const title = body.match(/<h2[^>]*>([\s\S]*?)<\/h2>/)?.[1]?.replace(/<[^>]*>/g, "").trim();
    const rule = publicationImageRules.find(([prefix]) => title?.startsWith(prefix));
    if (!rule) return whole;
    const [file, chinese, english] = researchPhotos[rule[1]];
    const description = zh ? chinese : english;
    const alt = escapeAttribute(`${description}${zh ? "（示意照片，非研究结果）" : " (illustrative photograph, not a research result)"}`);
    const label = escapeAttribute(`${zh ? "放大配图：" : "Enlarge illustration for: "}${title}`);
    const base = `${root}/assets/images/${file}`;
    return `<article class="${classes} publication-with-image" data-publication-image="${rule[1]}"><a class="publication-image" href="${base}.webp" data-research-lightbox aria-label="${label}"><img src="${base}-small.webp" width="640" height="480" alt="${alt}" loading="lazy" decoding="async"><span class="image-expand" aria-hidden="true">↗</span></a><div class="publication-copy">${body}</div></article>`;
  });
}
