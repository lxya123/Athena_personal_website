# Athena — personal website

A single-page personal site template. Plain HTML, CSS, and JavaScript — no build
step, no dependencies. Open `index.html` in a browser and it works.

## The look

| | |
|---|---|
| **Colors** | burgundy · gray · white (all defined as variables at the top of `css/styles.css`) |
| **Fonts** | Pacifico (headings), Caveat (handwritten notes), Courier New (body text) |
| **Headings** | flicker like a neon sign |
| **Background** | a scroll-driven scene: rain → clearing night sky → a peony garden that grows up from the bottom, with peony petals falling the whole way down |

### The background scene

As you scroll down the page, three things happen in sequence:

1. **Top of the page** — rain falls over a stormy burgundy sky, with big soft
   peonies behind the title.
2. **Middle** — the rain thins out and stops; stars and the moon come through.
3. **Bottom** — peonies grow up out of the bottom edge, one after another.

Peony petals drift down over all three stages, thickening as the garden blooms.

The timing lives in `js/scene.js`, in the `STOPS` object at the top:

```js
var STOPS = {
  rain:   { from: 0.06, to: 0.34 },  // rain goes from full to gone
  sky:    { from: 0.14, to: 0.52 },  // stars fade in
  garden: { from: 0.55, to: 0.90 }   // peonies rise
};
```

The numbers are fractions of the total page scroll (0 = very top, 1 = very
bottom). Move them around to make the rain last longer, or the flowers arrive
sooner.

## Files

```
index.html                    all the page content — this is the file to edit most
css/styles.css                colors, fonts, layout (numbered sections, top to bottom)
js/rain.js                    the rainfall
js/cards.js                   expanding interest cards + their tilt-toward-cursor
js/content.js                 reads writing/ and gallery/ and builds those sections
js/petals.js                  peony petals falling and tumbling down the page
js/sky.js                     stars, twinkle, and the occasional shooting star
js/scene.js                   connects scroll position to rain / sky / garden
js/main.js                    menu, scroll reveal, calm mode, footer year
assets/peony.svg              a peony blossom (used as the favicon)
assets/peony-stem.svg         a peony on a stem — the flowers in the garden
assets/portrait-placeholder.svg   swap for a real photo

writing/                      one .md file per post -> the Writing section
gallery/                      drawings -> the Gallery section
```

## Adding writing and drawings

These two folders are the whole workflow. Nothing else needs editing.

**A new post** — add a file to `writing/`, named `2026-08-29-some-title.md`.
The date orders the list and shows on the site; the rest becomes the title.
Plain paragraphs are enough, and `**bold**`, `*italic*`, `# headings`, lists,
quotes, links and images all work. Details in `writing/README.md`.

**A new drawing or animation** — drop an image or a video into `gallery/`. The
filename becomes the caption (`peony-study.jpg` shows as "Peony study"), and a
`2026-05-` style prefix is stripped from it. Images and `.mp4` / `.webm` /
`.mov` animations both work; animations preview quietly on hover and play with
controls when opened. `gallery/README.md` covers naming and, importantly, how
to keep video files small enough — export MP4 rather than GIF, and stay under
about 10 MB per animation.

Both folders are read live from GitHub when the site is published, so a commit
is all it takes — there is nothing to rebuild. While you are working locally the
same sections read the folders straight off the dev server.

Note: this reads the repository through GitHub's public API, which means **the
repository has to be public** for the two sections to fill in. Before it is
published they show a short note instead. The account and repository name are
worked out from the site's own URL, so transferring or renaming the repo needs
no code change.

### The Projects section

It is still in `index.html`, wrapped in an HTML comment just below the Gallery
section. To bring it back, delete the `<!--` and `-->` around it and add a link
to it in the nav.

## Making it yours

- **Text** — everything is in `index.html`, in plain sections marked with big
  comments (`ABOUT`, `INTERESTS`, `PROJECTS`, `WRITING`, `CONTACT`).
- **Photo** — drop your picture in `assets/` and change the `src` on the
  `<img class="portrait">` tag.
- **Colors** — change the variables under `:root` in `css/styles.css`. Every
  burgundy in the site comes from those few lines.
- **Interest cards** — each one is an `<article class="feature-card v-…">` in the
  Interests section: a number, an inline SVG emblem, a tag, a line of text, and a
  **Read more** panel that expands when clicked. The expanded card takes the full
  width of the row. Each card currently holds an italic placeholder line — replace
  the `<p class="fc-prompt">…</p>` inside `.fc-detail-panel` with real paragraphs
  and drop the `fc-prompt` class.
  Copy a card, renumber it, swap the emblem, and pick a color variant:
  `v-wine`, `v-rose`, `v-ash`, or `v-neon` (all defined at the end of section 7
  in `css/styles.css`). The emblem lifts and the card rises on hover.
- **More flowers** — copy a `<div class="stem-wrap gN">` line in `index.html`
  and add a matching `.gN { left: …; width: …; }` rule in `css/styles.css`.
- **Heavier or lighter rain** — `CONFIG.density` at the top of `js/rain.js`.
- **More stars** — `CONFIG.density` at the top of `js/sky.js`.
- **More petals** — `CONFIG.density` and `CONFIG.colors` at the top of
  `js/petals.js`.
- **Peonies behind the title** — the `.bloom` rules in `css/styles.css`.

## Accessibility

- Gallery images and animations open in a lightbox with arrow-key navigation and Escape to close.
- Cards expand on click, close on a second click or the **Escape** key, and only
  one is open at a time.
- The **Calm mode** button in the top bar stops the rain, the flicker, and the
  swaying, and remembers the choice for next visit.
- Visitors whose system is set to *reduce motion* get calm mode automatically.
- Animations pause when the browser tab is in the background.

## Running it locally

Double-click `index.html`, or serve the folder:

```bash
python3 -m http.server 8127
```

Then open <http://localhost:8127>.

## Publishing it

Push this folder to GitHub, then in the repository go to
**Settings → Pages → Build and deployment**, choose **Deploy from a branch**,
pick `main` and `/ (root)`, and save. The site appears a minute or two later at
`https://<the account that owns the repo>.github.io/Athena_personal_website/` —
so `https://ivyyyy24381.github.io/Athena_personal_website/` from the current
remote, or `https://lxya123.github.io/Athena_personal_website/` once it lives on
Athena's own account.
