---
name: photo-map
description: Make realistic vest images for a design by laying its print onto a real photo of the blank supplier vest (front view, listing and website sizes).
---

# Vest photo mockup (photo-map)

Use this skill when Spencer wants realistic product images for a vest design, whether it's a seamless print, a placed livery, or a print with a chest logo. It replaces the code renders and 3D renders, which look fake. The print picks up the real photo's folds, foam panels, stitching and fabric grain. The zipper, binding and lining stay as photographed, and the supplier's chest wordmark is painted out.

## Gate: not for the live site yet
The base photo is the supplier's (F2401, gray outside, red lining). It is NOT committed here because this repo is public. Do not publish these images on the website until the supplier OKs use of their photo, or until we have a photo of our own sample. Say this every time you deliver images.

## Setup
- In a project thread the tool and base photo already live at `/mnt/project-files/tools/photo-map/` (photomap.py + base/f2401-front.png + README.md). Use that copy.
- Anywhere else, use `photomap.py` in this folder and put the base photo at `base/f2401-front.png` (ask Spencer for it; `base/` is git-ignored).
- Needs python3 with numpy and opencv-python-headless (`python3 -m pip install opencv-python-headless`).

## Steps
1. Find the design's artwork: a seamless tile PNG, or front panel art (about 1310 x 1575), plus any transparent chest logo PNG.
2. Run the tool:
   - `python3 photomap.py --slug <slug> --tile <tile.png>`
   - Chest logo: add `--logo <logo.png> --logo-clear`. Optionally set `--logo-xy 0.73 0.37` and `--logo-w 0.30` (fractions of the vest box; the default is the wearer's left chest).
   - Non-repeating art: use `--panel <art.png>` instead of `--tile`.
   - Use `--tile-width` (default 0.5 of vest width), `--tile-offset X Y` (shift the repeat, in tiles) and `--out DIR` as needed.
3. Look at `01-front-photo.png`. If a big motif sits under the zipper, or the logo lands on a busy area, change `--tile-offset` and run it again.
4. Outputs (default `/mnt/project-files/images/<slug>-vest/photo-mockup/`):
   - `01-front-photo.png`: 2000 x 2000 listing image
   - `<slug>-front.webp`: 1100 px wide transparent cut-out, matching img/<slug>-front.webp
   - `<slug>-detail.jpg`: 1400 x 1400 chest close-up, matching img/<slug>-detail.jpg
   - `<slug>-front-photo.png`: the full photo

## Limits
- Front only. Back views need a back photo of the same vest, added to base/ and to `BASES` in photomap.py.
- The lining stays the supplier's red.
- Never copy trademarked logos or lettering into a design; draw original art inspired by them.
