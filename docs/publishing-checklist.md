# Publishing Checklist

Use this checklist before each update to `https://wyh302.github.io/`. The
automated items are covered by `npm.cmd run audit`; the manual items must be
re-checked during browser and live-site QA for each release.

## Local Prerequisites

- [ ] Node.js and npm are available.
- [ ] `pdftotext.exe` is available on `PATH`, or `PDFTOTEXT_PATH` points to the
      executable, so `npm.cmd run audit` can inspect PDF CV text.

## Automated Before Commit

- [ ] `npm.cmd run audit` passes.
- [ ] `git diff --check` passes.
- [ ] Source and `_site` contain the required public routes.
- [ ] `robots.txt`, `sitemap.xml`, and `site.webmanifest` are present in `_site`.
- [ ] The obsolete public template post is absent from `_site`.
- [ ] The old profile placeholder asset is absent from `_site`.
- [ ] Public HTML and PDF CV text do not contain known private data, internal metrics, or unverified patent numbers.
- [ ] Original `.doc` and `.docx` resume files remain ignored by git.

## Manual Browser QA Before Push

- [ ] Local preview works at `http://localhost:8080`.
- [ ] Homepage, projects, research output, blog, published note, CV, and contact pages load on desktop.
- [ ] The same core pages load on mobile width.
- [ ] Navigation works with no broken images, no horizontal overflow, and no small interactive targets.
- [ ] HTML CV remains the primary accessible CV, with PDF as a secondary printable copy.
- [ ] Research outputs still use conservative status labels.

## Live Verification After Push

- [ ] Homepage returns HTTP 200 at `https://wyh302.github.io/`.
- [ ] Core pages return HTTP 200: projects, research output, blog, published note, CV, and contact.
- [ ] The obsolete public template post returns HTTP 404.
- [ ] `robots.txt`, `sitemap.xml`, `site.webmanifest`, visual assets, and PDF CV are reachable.
- [ ] Live pages do not show the old draft brand, phone number, birth date, internal metrics, or unverified patent numbers.
