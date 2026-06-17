# Academic Research Homepage

This repository is a GitHub Pages-ready academic personal website. It is built
as a static site so it can be published without a backend, database, login
system, or theme download step.

The site is designed for PhD applications and research visibility:

- Clear English homepage
- Research interests
- Selected projects
- Publications, preprints, and working papers
- CV download entry
- Contact and academic profile links
- A small, high-quality research blog

## Replace Before Publishing

Search the repository for these placeholders and replace them with real,
publicly shareable information:

- `[Your Name]`
- `[Your Department]`
- `[Your University]`
- `[Your Field]`
- `[Advisor Name]`
- `[Research Area 1]`
- `[Research Area 2]`
- `[Research Area 3]`
- `yourusername`
- `your_email@university.edu`

Then replace these files:

- `assets/images/profile-placeholder.svg` with a formal profile photo
- `assets/files/cv.pdf` with your real public CV PDF

Do not invent publications, awards, affiliations, advisor names, or accepted
papers. It is better to label work honestly as "working paper", "course
project", "poster", or "research experience" than to overstate it.

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

`npm run build` creates `_site/`, the directory uploaded by the included GitHub
Actions workflow. `_site/` is a generated artifact and is intentionally ignored
by git.

If `npm` is not available, any static web server works. For example:

```bash
python -m http.server 8080
```

## Publish With GitHub Pages

1. Create a GitHub repository named `<yourusername>.github.io`.
2. Push these files to that repository.
3. In GitHub, open `Settings -> Pages`.
4. Choose GitHub Actions if you want to use the included workflow, or publish
   from the default branch if you prefer GitHub's static file serving.
5. Visit `https://<yourusername>.github.io` after the Pages build finishes.

For a custom domain, configure it in `Settings -> Pages` first, then configure
DNS at your domain provider. Keep the official GitHub Pages documentation as
the source of truth for DNS records and HTTPS settings.

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
