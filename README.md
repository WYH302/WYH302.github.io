# Yonghao Wu Academic Homepage

This repository contains Yonghao Wu's GitHub Pages academic personal website:

https://wyh302.github.io/

The site is a static HTML/CSS system for PhD application visibility and public
research communication. It can be deployed directly with GitHub Pages and does
not require a backend, database, login system, or theme download step.

## Site Structure

- `index.html`: English academic homepage
- `projects/`: selected research and engineering projects
- `publications/`: conservative research output and manuscript status page
- `blog/`: public research notes
- `cv/`: public web CV and PDF CV entry
- `contact/`: public academic contact information
- `assets/`: CSS, generated research visuals, favicon, and public PDF CV
- `sitemap.xml`, `robots.txt`, `site.webmanifest`: publication support files

## Publication Safety

The public pages intentionally omit private or high-risk information:

- phone number
- birth date
- original Word resume
- project budget and internal metrics
- unverified patent numbers
- unpublished internal datasets or restricted collaborator details

Publication and manuscript status labels are intentionally conservative. Items
reported in the source CV but not yet linked to public bibliographic records are
marked as pending public verification rather than presented as final published
papers.

## Local Preview

This project has no required npm dependencies.

```bash
npm run check
npm run build
npm run serve
```

On Windows PowerShell, if `npm` is blocked by the local execution policy, use:

```powershell
npm.cmd run check
npm.cmd run build
npm.cmd run serve
```

Then open:

```text
http://localhost:8080
```

`npm run build` creates `_site/`, a generated artifact that is intentionally
ignored by git.

If `npm` is not available, any static web server works. For example:

```bash
python -m http.server 8080
```

## Publish With GitHub Pages

This repository is published from the default branch to:

https://wyh302.github.io/

After editing content:

1. Run `npm.cmd run check`.
2. Run `npm.cmd run build`.
3. Review `git diff`.
4. Commit and push to `main`.
5. Verify the live site with a cache-busting query string.

## Safety Checklist

Before publishing, confirm that the repository does not contain:

- API keys, tokens, passwords, or private config files
- Unpublished full papers unless all collaborators and advisors approve
- Raw research data with privacy, ethics, copyright, or license restrictions
- Recommendation letters, passports, ID cards, student cards, or transcripts
- Private review comments, internal collaborator notes, or restricted slides
- Third-party images, tables, or figures without permission or attribution

## Academic Pages Compatibility

The live site is static HTML for immediate deployment. The content model follows
the same structure recommended by Academic Pages: profile, research interests,
publications, projects, CV, contact, and research blog posts. If you later move
to the full Academic Pages template, the existing page content can be mapped to:

- `_pages/about.md`
- `_pages/cv.md`
- `_publications/`
- `_portfolio/`
- `_posts/`

Useful references:

- GitHub Pages: https://docs.github.com/en/pages
- Academic Pages: https://github.com/academicpages/academicpages.github.io
- Quarto GitHub Pages publishing: https://quarto.org/docs/publishing/github-pages.html
