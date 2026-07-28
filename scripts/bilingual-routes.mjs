import path from "node:path";

export const postSlugs = [
  "three-pillars-programming-ai-economics",
  "language-gravity-ai-bias-compression",
  "language-as-lossy-compression",
  "multimodal-agents-computational-imaging",
  "leakage-controlled-evaluation",
  "two-high-one-low-social-expectations",
  "verifiable-multimodal-engineering",
  "civil-service-security-and-ambition",
  "population-property-policy-feedback",
  "grammar-expression-information-structure",
  "tailwinds-headwinds-path-dependence-2026",
];

export const primaryBaseRoutes = [
  "index.html",
  "projects/index.html",
  "publications/index.html",
  "blog/index.html",
  ...postSlugs.map((slug) => `posts/${slug}/index.html`),
  "cv/index.html",
  "contact/index.html",
];

export const utilityBaseRoutes = ["checklist/index.html"];

export function chineseRoute(route) {
  return `zh/${route}`;
}

export const bilingualRoutePairs = [...primaryBaseRoutes, ...utilityBaseRoutes].map((route) => ({
  en: route,
  zh: chineseRoute(route),
}));

export const bilingualPublicRoutes = primaryBaseRoutes.flatMap((route) => [route, chineseRoute(route)]);
export const bilingualAllRoutes = [...primaryBaseRoutes, ...utilityBaseRoutes].flatMap((route) => [
  route,
  chineseRoute(route),
]);

export function publicUrl(route) {
  const path = route === "index.html" ? "" : route.replace(/index\.html$/, "");
  return `https://wyh302.github.io/${path}`;
}

export function relativeRouteHref(fromRoute, toRoute) {
  const relative = path.posix.relative(path.posix.dirname(fromRoute), toRoute);
  const withoutIndex = relative.endsWith("index.html")
    ? relative.slice(0, -"index.html".length)
    : relative;
  return withoutIndex || "./";
}
