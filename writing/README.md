# Writing

Every `.md` file in this folder shows up in the **Writing** section of the site,
newest first. This README is skipped.

## Adding a post

Create a file named like this:

    2026-08-29-a-title-for-the-post.md

The date at the front sets the order and the date shown on the site. The rest of
the filename becomes the title if you don't set one yourself.

## What goes inside

Plain writing works — just start typing:

    Whatever you want to say. Blank lines separate paragraphs.

If you'd like to set the title and the summary yourself, put a small block at
the very top, between two lines of three dashes:

    ---
    title: The Long Way Round
    date: 2026-08-29
    excerpt: One line that shows in the list before someone opens the post.
    ---

    The post itself starts here.

## Formatting you can use

    # Heading
    ## Smaller heading

    **bold**  *italic*  `code`

    - a list
    - another item

    > a quote

    [link text](https://example.com)

    ![a picture](../gallery/drawing.jpg)

Anything more complicated will simply show as plain text — nothing will break.

## From an iPad

On github.com, open this folder, tap **Add file → Create new file**, name it,
type, and tap **Commit changes**. The site updates about a minute later.
