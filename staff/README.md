# Staff portraits

Portraits referenced by the staff directory in `index.html` (`STAFF` array).

## Placeholder needing replacement

`ark-emokor.jpg` is currently a solid-colour placeholder, not a real portrait.
Replace it with the photo of **Mr. Ark Gordon Emokor** (PE Teacher) —
original filename `Mr. Ark Gordon Emokor- PE Teacher.jpg.jpeg` — keeping the
name `ark-emokor.jpg`.

The other portraits in this folder are the real photographs.

## Sizing convention

Portraits are displayed in square-cropped avatars. Match the existing files:

```bash
convert "Mr. Ark Gordon Emokor- PE Teacher.jpg.jpeg" \
  -resize '800x800^' -gravity north -extent 800x800 -quality 84 -strip \
  staff/ark-emokor.jpg
```
