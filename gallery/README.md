# Gallery

Every image **and video** in this folder shows up in the Gallery section of the
site. Drop a file in and it appears — nothing else to edit.

- **Drawings:** `.jpg` `.jpeg` `.png` `.webp` `.gif` `.svg` `.avif`
- **Animations:** `.mp4` `.webm` `.mov` `.m4v`

Animations get a small ▶ marker on the tile, play quietly when the mouse is
over them, and open with proper controls when clicked.

## Naming

The filename becomes the caption under the piece, so name files the way you want
them read:

    peony-study.jpg              ->  "Peony study"
    2026-05-hands-practice.png   ->  "Hands practice"
    IMG_2491.PNG                 ->  "IMG 2491"   (rename this one!)

A `YYYY-MM` or `YYYY-MM-DD` prefix is stripped from the caption, so you can use
one to keep the folder in order. Straight-off-the-camera names like `IMG_2491`
work, but they read badly — rename before uploading.

## Sizes: the part that matters

GitHub refuses any single file over **100 MB**, and warns above 50 MB. More
importantly, git keeps every version of every file forever — so a 60 MB video
uploaded three times is 180 MB in the repo permanently, and everyone loading the
page downloads the whole file.

Rough targets to aim for:

| | Good | Getting heavy | Don't |
|---|---|---|---|
| A drawing | under 1 MB | 2–4 MB | over 5 MB |
| An animation | under 10 MB | 10–25 MB | over 40 MB |

Keep the whole folder under a few hundred MB and the site stays fast.

### Making drawings smaller

Photos straight off a phone are often 4–8 MB. About 1500px on the long edge is
plenty for a website. On an iPad: open the image in Photos, tap the crop tool,
and export a smaller copy — or mail it to yourself at "Medium" size and save
that version.

### Making animations smaller

**Export as MP4, not GIF.** This is the single biggest win. The same five-second
animation is often 12 MB as a GIF and under 1 MB as an MP4 — GIF is a 1987 file
format and stores every frame as a whole picture. MP4 also looks better and
plays smoothly. If your animation software offers "H.264" or "MP4", pick it.

Other things that help, in order of how much they save:

1. **Make it shorter.** File size is roughly proportional to length. A 10-second
   loop is half the size of a 20-second one.
2. **Make it smaller on screen.** 1080p is more than the tile ever shows.
   720p (1280×720) is plenty; for a portrait animation, 720×1280.
3. **Drop the audio** if there isn't any that matters. Tiles play muted anyway.
4. **Lower the frame rate** to 24 fps if you exported at 60.

If you have a video that is still too big after that, put it on YouTube,
Vimeo, or your Instagram, and link to it from the Interests or Writing section
instead of putting the file in this folder. A link costs nothing.

### Compressing on an iPad

There is no built-in tool for this, but any of these work:

- **Export from your animation app at a lower resolution** — always the best
  option, since it never re-compresses something already compressed.
- A free app such as **Video Compress** or **Compress Videos & Resize Video**
  from the App Store.
- **CloudConvert** (cloudconvert.com) in Safari — free without an account for a
  handful of files a day. Choose MP4, set the resolution to 720p.

### Compressing on a Mac

If you have `ffmpeg` installed, this shrinks almost anything dramatically while
still looking good:

    ffmpeg -i original.mov -vf "scale=-2:720" -c:v libx264 -crf 26 -preset slow -an compressed.mp4

`-crf` is the quality knob: lower is better-looking and bigger, higher is
smaller. 23 is high quality, 26 is a good middle, 30 is visibly rough. `-an`
drops the audio; remove it if you want to keep the sound.

## Uploading from an iPad

On github.com, open this folder, tap **Add file → Upload files**, pick your
files, and tap **Commit changes**. They appear on the site a minute later.

GitHub's web uploader takes files up to 25 MB each — another reason to compress
first. Larger files need the desktop app or the command line.
