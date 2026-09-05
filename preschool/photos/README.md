# Pre-school photos

These 7 files are referenced by the pre-school gallery (`/preschool/index.html`)
and by the sign-in page design (`/login.html` — hero slideshow, sign-in mosaic,
form-card header and the "Life at Gill" strip).

**The files currently in this folder are tiny colour placeholders.**
Replace each one with the real photograph listed below, keeping the exact filename.

| Filename                  | Photo                                            | Original      |
|---------------------------|--------------------------------------------------|---------------|
| `playground-swings.jpg`   | Children on the nest swings in the garden         | IMG_7275_1.jpg |
| `balloon-play.jpg`        | Two girls with teal and orange balloons           | IMG_7277_1.jpg |
| `craft-table.jpg`         | Teacher and pupils at the yellow craft table      | ACT_6744.jpg   |
| `spoon-flower.jpg`        | Girl holding the plastic-spoon flower             | ACT_6768.jpg   |
| `recycled-art.jpg`        | Overhead shot of the recycled-bottle art lesson   | ACT_6837.jpg   |
| `weaving-yarn.jpg`        | Three pupils weaving with coloured yarn           | ACT_6860.jpg   |
| `proud-pupil.jpg`         | Boy outdoors holding his decorated bottle         | ACT_0136.jpg   |

## Recommended before committing the real files

Keep them web-sized so the pages stay fast:

```bash
# ~1600px wide, quality 82
for f in preschool/photos/*.jpg; do
  convert "$f" -resize '1600x1600>' -quality 82 -strip "$f"
done
```

`proud-pupil.jpg` is portrait — it is used in tall/portrait slots, so do not crop it to landscape.
