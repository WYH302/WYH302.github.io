import path from "node:path";

export const imageCredits = {
  architecture: { file: "architecture", author: "CHUTTERSNAP", url: "https://unsplash.com/fr/photos/facade-dimmeuble-de-grande-hauteur-en-beton-beige-YtSROA4sBCg", en: "Repeating windows on a building facade", zh: "建筑立面上重复排列的窗户" },
  ocean: { file: "ocean", author: "Monya Prinsloo", url: "https://unsplash.com/photos/aerial-view-of-ocean-waves-HZmRQsyvGHA", en: "Ocean waves photographed from above", zh: "从空中俯瞰的海浪" },
  books: { file: "books", author: "Ü Lõ", url: "https://unsplash.com/es/fotos/pared-de-estanterias-llenas-de-libros-coloridos-nhj9hoKJp-U", en: "Books arranged on a wall of shelves", zh: "整面书架上的书籍" },
  city: { file: "city-crossing", author: "Sora Sagano", url: "https://unsplash.com/photos/people-walking-on-street-MKE7NKsaBZM", en: "Pedestrians crossing a city street", zh: "城市路口的行人" },
  library: { file: "library", author: "Uladzislau Petrushkevich", url: "https://unsplash.com/es/fotos/una-gran-biblioteca-llena-de-muchos-libros-1AwQemyhuLA", en: "Curving shelves in a library", zh: "图书馆中弧形排列的书架" },
  circuits: { file: "circuits", author: "Unsplash", url: "https://unsplash.com/s/photos/circuit-board", en: "Electronic components on a circuit board", zh: "电路板上的电子元件" },
};
export const essayThemes = {
  "youth-defensive-withdrawal-and-social-trust": ["society", "city"],
  "ai-audits-power-algorithmic-governance": ["ai", "circuits"],
  "tenure-review-youth-and-university-renewal": ["society", "library"],
  "tailwinds-headwinds-path-dependence-2026": ["society", "ocean"],
  "grammar-expression-information-structure": ["language", "books"],
  "population-property-policy-feedback": ["society", "architecture"],
  "civil-service-security-and-ambition": ["society", "architecture"],
  "three-pillars-programming-ai-economics": ["ai", "circuits"],
  "language-gravity-ai-bias-compression": ["language", "books"],
  "language-as-lossy-compression": ["language", "library"],
  "two-high-one-low-social-expectations": ["society", "architecture"],
  "leakage-controlled-evaluation": ["research", "circuits"],
  "verifiable-multimodal-engineering": ["research", "circuits"],
  "multimodal-agents-computational-imaging": ["research", "ocean"],
};
const labels = {
  en: { society: "Society", ai: "AI & work", language: "Language", research: "Research" },
  zh: { society: "社会观察", ai: "AI 与工作", language: "语言与思考", research: "研究方法" },
};
function rootHref(route) {
  return path.posix.relative(path.posix.dirname(route), ".") || ".";
}
function imageMarkup(route, key, z, large = false) {
  const credit = imageCredits[key];
  const base = rootHref(route);
  return `<img src="${base}/assets/images/${credit.file}.webp" srcset="${base}/assets/images/${credit.file}-small.webp 600w, ${base}/assets/images/${credit.file}.webp 1400w" sizes="${large ? "(max-width: 700px) 100vw, 1100px" : "(max-width: 700px) 100vw, 600px"}" width="1400" height="933" alt="${z ? credit.zh : credit.en}" loading="${large ? "eager" : "lazy"}" decoding="async">`;
}
function photo(route, key, z) {
  return `<figure class="editorial-cover">${imageMarkup(route, key, z, true)}</figure>`;
}
function heroCarousel(route, z) {
  const base = `${rootHref(route)}/assets/images/`;
  const photos = [
    ["portrait-study", "吴永浩穿深色西装，坐在书架旁的桌前", "Yonghao Wu in a dark blazer, seated at a desk beside bookshelves", 900, 1125],
    ["portrait-notes", "吴永浩在笔记本电脑旁写笔记", "Yonghao Wu writing notes beside a laptop", 900, 1125],
    ["daily-coffee-walk", "穿灰色卫衣，背着背包，在街边拿着一杯咖啡", "In a grey hoodie with a backpack and a coffee on the sidewalk"],
    ["daily-cafe", "坐在咖啡馆窗边，桌上放着电脑和冰咖啡", "Sitting by a cafe window with a laptop and iced coffee on the table"],
    ["daily-city-walk", "穿黑色外套，拿着手机站在树木成荫的街边", "In a black jacket, holding a phone on a tree-lined sidewalk"],
    ["daily-window-seat", "坐在窗边，望向窗外", "Sitting by a window, looking outside"],
  ];
  return `<section class="hero-carousel" data-carousel role="region" aria-roledescription="${z ? "轮播" : "carousel"}" aria-label="${z ? "生活照片" : "Everyday photographs"}"><div class="carousel-stage">${photos.map(([file, zh, en, width = 1122, height = 1402], i) => {
    const alt = z ? zh : en;
    const position = i === 0 ? "active" : i === 1 ? "next" : i === photos.length - 1 ? "previous" : "hidden";
    const srcset = `${file.startsWith("daily-") ? `${base}${file}-small.webp 480w, ` : ""}${base}${file}.webp ${width}w`;
    return `<a class="carousel-slide" data-slide data-position="${position}" href="${base}${file}.webp" target="_blank" rel="noopener" tabindex="${i ? "-1" : "0"}"${i ? ' aria-hidden="true"' : ""} aria-label="${alt}${z ? "（在新标签页查看大图）" : " (open full-size photo in a new tab)"}"><img src="${base}${file}.webp" srcset="${srcset}" sizes="(max-width: 600px) 78vw, 440px" width="${width}" height="${height}" alt="${alt}"${i ? "" : ' fetchpriority="high"'} decoding="async"></a>`;
  }).join("")}<div class="carousel-arrows" data-carousel-controls hidden><button type="button" data-previous aria-label="${z ? "上一张照片" : "Previous photo"}"><span aria-hidden="true">‹</span></button><button type="button" data-next aria-label="${z ? "下一张照片" : "Next photo"}"><span aria-hidden="true">›</span></button></div></div><div class="carousel-toolbar" data-carousel-controls hidden><button type="button" class="carousel-rotation" data-rotation aria-label="${z ? "暂停自动轮播" : "Pause slideshow"}"><span aria-hidden="true">Ⅱ</span></button><div class="carousel-dots" role="group" aria-label="${z ? "选择照片" : "Choose a photo"}">${photos.map((_,i)=>`<button type="button" data-go-to="${i}" aria-label="${z ? `查看第 ${i+1} 张照片` : `Show photo ${i+1}`}"${i ? "" : ' aria-current="true"'}><span aria-hidden="true"></span></button>`).join("")}</div><p class="visually-hidden" data-carousel-status aria-live="off" aria-atomic="true"></p></div></section>`;
}
function enhanceCards(html, route, z) {
  return html.replace(/<article class="note-card">([\s\S]*?)<\/article>/g, (whole, body) => {
    const slug = body.match(/\.\.\/posts\/([^/]+)\//)?.[1];
    if (!slug || !essayThemes[slug]) return whole;
    const [category, key] = essayThemes[slug];
    body = body.replace(/<h2>([\s\S]*?)<\/h2>/, `<h2><a href="../posts/${slug}/">$1</a></h2>`);
    return `<article class="note-card" data-category="${category}"><div class="essay-image">${imageMarkup(route, key, z)}<span class="image-category">${labels[z ? "zh" : "en"][category]}</span></div><div class="essay-copy">${body}</div></article>`;
  });
}
function journalControls(z) {
  return `<div class="journal-tools" data-journal-tools hidden><div class="topic-filters" role="group" aria-label="${z ? "筛选文章主题" : "Filter essays by topic"}">${[["all", z ? "全部" : "All notes"], ...Object.entries(labels[z ? "zh" : "en"])].map(([key, label]) => `<button type="button" data-filter="${key}" aria-pressed="${key === "all"}">${label}</button>`).join("")}</div><label class="journal-search"><span class="visually-hidden">${z ? "搜索文章" : "Search essays"}</span><input type="search" placeholder="${z ? "搜索标题与摘要…" : "Search the journal…"}" data-essay-search></label><p class="search-status" role="status" aria-live="polite"></p></div>`;
}
export function applyEditorialLayout(html, route) {
  const z = route.startsWith("zh/");
  const local = route.replace(/^zh\//, "");
  const root = rootHref(route);
  html = html.replace('<main id="main"', '<main id="main" tabindex="-1"');
  html = html.replace("</head>", `<link rel="stylesheet" href="${root}/assets/css/editorial.css?v=20260906-carousel">\n<script src="${root}/assets/js/editorial.js?v=20260906-carousel" defer></script>\n</head>`);
  html = html.replace("<body>", `<body class="editorial ${local === "index.html" ? "home-page" : local === "blog/index.html" ? "journal-page" : local.startsWith("posts/") ? "essay-page" : "document-page"}">`);
  html = html.replaceAll("lifephoto-2.png?v=20260630-photo", "portrait-study.webp").replaceAll("lifephoto-1.png?v=20260630-photo", "portrait-notes.webp");
  if (local === "index.html") {
    html = html.replace(/<figure class="hero-figure photo-pair">[\s\S]*?<\/figure>/, heroCarousel(route, z));
    html = html.replace(/<h1>[\s\S]*?<\/h1>/, `<p class="author-kicker">${z ? "吴永浩 · Yonghao Wu (Leon)" : "Yonghao Wu (Leon) · Research & ideas"}</p><h1 class="home-title">${z ? "感知世界。<br>构建智能。<br><em>保持追问。</em>" : "Perception.<br>Intelligence.<br><em>Human questions.</em>"}</h1>`);
    const homeNotes = z
      ? [["youth-defensive-withdrawal-and-social-trust","年轻人的冷漠，是一种防御吗？","city"],["ai-audits-power-algorithmic-governance","把权力交给 AI，还是让 AI 盯住权力？","circuits"],["tenure-review-youth-and-university-renewal","“铁饭碗”碎了，青年教师就能上桌吗？","library"]]
      : [["youth-defensive-withdrawal-and-social-trust","Is detachment a form of self-protection?","city"],["ai-audits-power-algorithmic-governance","Should AI rule, or audit power?","circuits"],["tenure-review-youth-and-university-renewal","Do young scholars get a seat?","library"]];
    const latest = `<section class="latest-band"><div class="content-wrap"><div class="journal-section-title"><div><p class="eyebrow">THE JOURNAL / ${z ? "随笔" : "RECENT WRITING"}</p><h2>${z ? "实验室之外的思考" : "Beyond the laboratory"}</h2></div><a class="text-link" href="blog/">${z ? "全部文章" : "All essays"} <span aria-hidden="true">↗</span></a></div><div class="home-essays">${homeNotes.map(([slug,title,key],i)=>`<article><div class="home-note-image">${imageMarkup(route,key,z)}</div><p class="item-meta">0${i+1} / ${z ? "思想随笔" : "ESSAY"}</p><h3><a href="posts/${slug}/">${title}</a></h3></article>`).join("")}</div></div></section>`;
    html = html.replace(/(<section class="section-band">)/, latest + "$1");
  }
  if (local === "blog/index.html") {
    html = html.replace(/<h1>[\s\S]*?<\/h1>/, `<h1 class="journal-title">${z ? "观察与追问<span>Field notes.</span>" : "Field notes<span>on a changing world.</span>"}</h1>`);
    html = html.replace(/(<div class="content-wrap post-list">)/, journalControls(z) + "$1");
    html = enhanceCards(html, route, z);
  }
  if (local.startsWith("posts/")) {
    const slug = local.split("/")[1];
    if (essayThemes[slug]) {
      html = html.replace(/(<h1>[\s\S]*?<\/h1>)/, "$1" + photo(route, essayThemes[slug][1], z));
    }
    const headings = [];
    let count = 0;
    html = html.replace(/<h2([^>]*)>([\s\S]*?)<\/h2>/g, (match, attrs, title) => {
      const id = attrs.match(/\bid=["']([^"']+)["']/)?.[1] || `section-${++count}`;
      headings.push({ id, title: title.replace(/<[^>]*>/g, "") });
      return `<h2${attrs.includes("id=") ? attrs : attrs + ` id="${id}"`}>${title}</h2>`;
    });
    const toc = headings.length > 2 ? `<details class="article-contents"><summary>${z ? "本文目录" : "In this essay"} <span>${headings.length} ${z ? "节" : "sections"}</span></summary><ol>${headings.map(h=>`<li><a href="#${h.id}">${h.title}</a></li>`).join("")}</ol></details>` : "";
    html = html.replace(/(<p class="lead">[\s\S]*?<\/p>)/, "$1"+toc);
    html = html.replace("</main>", `<p class="back-to-top"><a href="#main">${z ? "回到文章开头" : "Back to the beginning"} ↑</a></p></main>`);
  }
  return html;
}
