# Plan and Acceptance Criteria

This project is a public GitHub Pages academic homepage for Yonghao Wu. The
site should be useful for academic visibility while remaining conservative about
privacy, publication status, and collaborator-sensitive information.

## Plan

1. Present a clear English academic homepage with research direction, education,
   projects, research output, CV, contact, and a small research blog.
2. Use a refined, minimal academic visual style with real project-local visual
   assets rather than empty placeholders.
3. Keep all public academic claims conservative, especially for publications,
   manuscripts, patents, project metrics, and unpublished work.
4. Provide repeatable local checks for source files, published build artifacts,
   privacy-sensitive text in HTML and PDF, SEO support files, and public route
   integrity. PDF text checks require `pdftotext.exe` on `PATH` or a
   `PDFTOTEXT_PATH` environment variable.
5. Publish to GitHub Pages and verify the live site after deployment.

## Acceptance Criteria

- The live site is reachable at `https://wyh302.github.io/`.
- Core pages return HTTP 200: homepage, projects, research output, blog, the
  published research note, CV, and contact.
- The obsolete public template post returns HTTP 404.
- `robots.txt`, `sitemap.xml`, `site.webmanifest`, visual assets, and PDF CV are
  published and reachable.
- The site has no known phone number, birth date, raw resume file, internal
  metrics, project budget, or unverified patent numbers in public HTML or PDF
  text.
- Public pages have accessible landmarks, skip links, document titles, image alt
  text, and no small interactive targets in browser QA.
- The HTML CV is the primary accessible CV. The PDF is a secondary printable
  copy.
- `npm.cmd run audit` passes before publication; browser QA and live HTTP checks
  are performed after each push.
