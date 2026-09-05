# Pre-school photos

Thirteen web-sized photographs of Gill International Pre-School. They are used by:

- the pre-school gallery (`/preschool/index.html` — `GAL` array),
- the pre-school page design (hero background, About frame, program cards),
- the sign-in page (`/login.html` — hero slideshow, welcome mosaic,
  form-card header and the "Life at Gill" strip).

| Filename | Photo | Orientation |
|----------|-------|-------------|
| `playground-swings.jpg` | Children on the nest swings in the garden | Landscape |
| `trampoline-fun.jpg` | Pupils bouncing on the trampoline | Landscape |
| `balloon-play.jpg` | Two girls with teal and orange balloons | Landscape |
| `craft-table.jpg` | Teacher and pupils at the yellow craft table | Landscape |
| `helping-hands.jpg` | Teacher helping pupils with spoon crafts | Landscape |
| `spoon-flower.jpg` | Pupils holding a finished spoon flower | Landscape |
| `recycled-art.jpg` | Overhead shot of the recycled-bottle art lesson | Landscape |
| `weaving-yarn.jpg` | Three pupils weaving with coloured yarn | Landscape |
| `drum-painting.jpg` | Boys painting their music drums red | Landscape |
| `proud-pupil.jpg` | Boy outdoors holding his decorated bottle | Portrait |
| `straw-craft.jpg` | Girl holding her colourful straw craft | Portrait |
| `my-artwork.jpg` | Girl presenting her frame and spoon flower | Portrait |
| `first-friends.jpg` | Two pupils with a flower and backpack | Portrait |

## Adding / replacing photos

Keep files web-sized (~1600px longest edge, quality 82) so the pages stay fast:

```bash
for f in preschool/photos/*.jpg; do
  convert "$f" -auto-orient -resize '1600x1600>' -quality 82 -strip "$f"
done
```

Portrait files are used in tall slots (gallery `h2` tiles, program cards crop
to 16/10) — do not crop them to landscape.
