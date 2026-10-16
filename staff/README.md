# Staff portraits

Portraits referenced by the staff directory in `index.html` (`STAFF` array).

All portraits in this folder are the real photographs, cropped to 700x700.

## Sizing convention

Portraits are displayed in square-cropped avatars. Match the existing files:

```bash
convert source.jpg -auto-orient \
  -resize '700x700^' -gravity north -extent 700x700 -quality 84 -strip \
  staff/name.jpg
```

`-gravity north` keeps the subject's head in frame on tall portrait sources.
