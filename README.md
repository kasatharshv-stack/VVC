# VVC Realinfra Pvt Ltd — Website

Static marketing website for **VVC Realinfra Private Limited** (CIN `U45200MP2013PTC030424`),
a CRISIL BBB+ rated civil engineering and infrastructure company based in Madhya Pradesh.

No frameworks, no build dependencies — plain HTML, CSS and vanilla JavaScript, so it can be
hosted on GitHub Pages, Netlify, cPanel or any static host by uploading the repository as-is.

## Pages

| File | Contents |
| --- | --- |
| `index.html` | Hero, key figures, disciplines, flagship projects, awards, client preview |
| `about.html` | Company history and incorporation, growth timeline, leadership, people, vision |
| `capabilities.html` | The six delivery disciplines, credentials, alliances and consultants |
| `projects.html` | Filterable project portfolio and the awards section |
| `clients.html` | Full client list, sub-contracting experience, consultants |
| `contact.html` | Three offices, office numbers, enquiry form |

## Design

The brand mark is the maroon VVC triangle (`assets/img/logo.svg`, redrawn as vector so it stays
crisp at any size). The palette deliberately contrasts it:

| Token | Value | Use |
| --- | --- | --- |
| `--maroon` | `#7B2E2B` | Logo, eyebrows, accents that tie back to the mark |
| `--teal-900` / `--teal-800` | `#062F2C` / `#0B4F4A` | Primary surfaces, buttons, dark sections |
| `--gold` | `#C8952B` | Calls to action, highlights, awards |
| `--sand` | `#F6F2EC` | Alternating light sections |

Headings use Barlow Condensed and body copy uses Inter (loaded from Google Fonts, with system
fallbacks if the fonts are unavailable).

## Project photo slideshow

A project card whose banner carries `data-slideshow` holds a stack of `.project__slide` images.
The stack advances every 1.5s while the pointer rests on the card or the banner holds keyboard
focus, and resets to the first photo on leaving. Progress dots and the photo count are generated
by JavaScript from the real number of images, so adding or removing a slide needs no other edit.
Devices without hover cycle whenever the card is on screen, and `prefers-reduced-motion` holds
the first photo.

To add photos to a project, drop them in `assets/img/projects/` and extend that card's
`.project__slides` block in `tools/partials/`:

```html
<div class="project__banner" data-slideshow>
  <div class="project__slides">
    <img class="project__slide is-active" src="assets/img/projects/example-1.jpg"
         width="1000" height="563" loading="lazy" decoding="async" alt="…">
    <img class="project__slide" src="assets/img/projects/example-2.jpg"
         width="1000" height="563" loading="lazy" decoding="async" alt="…">
  </div>
  <span class="project__tag">Category</span>
</div>
```

Exactly one slide carries `is-active`. Photographs are stored at 1000px wide, 16:9, JPEG quality
82 — produced with ImageMagick:

```bash
convert source.jpg -crop WxH+X+Y +repage -resize 1000x \
        -quality 82 -strip -interlace Plane assets/img/projects/name.jpg
```

## Structure

```
index.html … contact.html   generated pages (commit these)
assets/css/style.css        all styles
assets/js/main.js           nav, scroll reveal, counters, filters, slideshow, enquiry form
assets/img/logo.svg         brand mark
assets/img/favicon.svg      favicon
assets/img/projects/        project photographs
tools/build.py              assembles the pages from tools/partials/
tools/partials/             head.html, foot.html and one body-<page>.html per page
```

## Editing

The header and footer are shared, so edit the partials rather than the generated pages:

```bash
# edit tools/partials/head.html, foot.html or body-<page>.html
python3 tools/build.py       # regenerates the six *.html files at the repo root
```

To preview locally:

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Enquiry form

`contact.html` has no server component. Submitting opens the visitor's own email client with the
details pre-filled. **The address is a placeholder — set the real one** in the `data-mailto-form`
attribute of the `<form>` in `tools/partials/body-contact.html` (currently `info@vvcrealinfra.com`),
then rebuild. To route enquiries through a form service instead (Formspree, Netlify Forms, a PHP
handler, …), replace the `data-mailto-form` handling in `assets/js/main.js` and point the `<form>`
at the new endpoint.

## Content source

All figures, project details, client names and office addresses come from the company profile
supplied by VVC Realinfra. Update them in `tools/partials/` and rebuild whenever the profile changes.
