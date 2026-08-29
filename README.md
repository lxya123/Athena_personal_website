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
js/petals.js                  peony petals falling and tumbling down the page
js/sky.js                     stars, twinkle, and the occasional shooting star
js/scene.js                   connects scroll position to rain / sky / garden
js/main.js                    menu, scroll reveal, calm mode, footer year
assets/peony.svg              a peony blossom (used as the favicon)
assets/peony-stem.svg         a peony on a stem — the flowers in the garden
assets/portrait-placeholder.svg   swap for a real photo
```

## Making it yours

- **Text** — everything is in `index.html`, in plain sections marked with big
  comments (`ABOUT`, `INTERESTS`, `PROJECTS`, `WRITING`, `CONTACT`).
- **Photo** — drop your picture in `assets/` and change the `src` on the
  `<img class="portrait">` tag.
- **Colors** — change the variables under `:root` in `css/styles.css`. Every
  burgundy in the site comes from those few lines.
- **Interest cards** — each one is an `<article class="feature-card v-…">` in the
  Interests section: a number, an inline SVG emblem, a tag, and a line of text.
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
