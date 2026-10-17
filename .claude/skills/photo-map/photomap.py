#!/usr/bin/env python3
"""Photo-map a vest design onto a real photo of the blank supplier vest.

The print takes the photo's own shading (folds, foam panels, stitching, fabric
grain); the zipper, edge binding and lining stay as photographed, and the
supplier's chest wordmark is painted out. See README.md for usage.
"""
import argparse, os, json, numpy as np, cv2

HERE = os.path.dirname(os.path.abspath(__file__))
# per-base-photo settings: crop (drop the spec text under the photo) and where the supplier wordmark sits
BASES = {
    'f2401-front': dict(path='base/f2401-front.png', crop_h=1165, wordmark=(540, 190, 700, 290)),
}


def build_masks(im, base, UP):
    H, W = im.shape[:2]
    L = cv2.cvtColor(im, cv2.COLOR_BGR2GRAY).astype(np.float32)
    hsv = cv2.cvtColor(im, cv2.COLOR_BGR2HSV)
    ff = (L > 228).astype(np.uint8); h2 = np.zeros((H + 2, W + 2), np.uint8)
    for seed in [(0, 0), (W - 1, 0), (0, H - 1), (W - 1, H - 1)]:
        cv2.floodFill(ff, h2, seed, 2)
    vest = cv2.morphologyEx((ff != 2).astype(np.uint8), cv2.MORPH_OPEN, np.ones((7, 7), np.uint8))
    n, lab, st, _ = cv2.connectedComponentsWithStats(vest)
    vest = (lab == 1 + np.argmax(st[1:, 4])).astype(np.uint8)
    red = ((hsv[..., 0] < 12) | (hsv[..., 0] > 168)) & (hsv[..., 1] > 90) & (vest > 0)
    lining = cv2.morphologyEx(red.astype(np.uint8), cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8))
    # black binding = dark pixels on the outer edge band; zipper = band round the dark centre column
    edge = vest - cv2.erode(vest, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * 16 * UP + 1,) * 2))
    dk = (L < 70) & (vest > 0)
    cols = np.nonzero(dk[400 * UP:900 * UP, W // 3:2 * W // 3])[1] + W // 3
    zx = int(np.median(cols))
    zipband = np.zeros_like(vest); zipband[:, zx - 24 * UP:zx + 20 * UP] = 1
    zipper = ((zipband > 0) & (vest > 0) & (lining == 0)).astype(np.uint8)
    binding = cv2.morphologyEx((dk & (edge > 0)).astype(np.uint8), cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8))
    # paint out the supplier wordmark (bright marks in its box)
    x0, y0, x1, y1 = [v * UP for v in base['wordmark']]
    box = np.zeros_like(vest); box[y0:y1, x0:x1] = 1
    loc = cv2.medianBlur(L.astype(np.uint8), 41).astype(np.float32)
    mark = cv2.dilate(((L - loc > 22) & (box > 0)).astype(np.uint8), np.ones((7, 7), np.uint8))
    im = cv2.inpaint(im, mark, 9, cv2.INPAINT_TELEA)
    L = cv2.cvtColor(im, cv2.COLOR_BGR2GRAY).astype(np.float32)
    fabric = ((vest > 0) & (lining == 0) & (binding == 0) & (zipper == 0)).astype(np.float32)
    fabric = cv2.morphologyEx(fabric, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    return im, L, dict(vest=vest, lining=lining, zipper=zipper, binding=binding, fabric=fabric)


def artwork(args, w, h):
    """Flat artwork covering the vest bounding box (w x h px), BGR float."""
    if args.panel:
        a = cv2.imread(args.panel)
        return cv2.resize(a, (w, h), interpolation=cv2.INTER_AREA).astype(np.float32)
    t = cv2.imread(args.tile)
    ts = max(8, int(round(w * args.tile_width)))
    t = cv2.resize(t, (ts, ts), interpolation=cv2.INTER_AREA).astype(np.float32)
    ox, oy = int(args.tile_offset[0] * ts), int(args.tile_offset[1] * ts)
    big = np.tile(t, (h // ts + 3, w // ts + 3, 1))
    a = np.ascontiguousarray(big[ts - oy % ts:ts - oy % ts + h, ts - ox % ts:ts - ox % ts + w])
    return a


def place_logo(a, args):
    if not args.logo:
        return a
    h, w = a.shape[:2]
    lg = cv2.imread(args.logo, cv2.IMREAD_UNCHANGED)
    lw = int(args.logo_w * w); lh = int(lw * lg.shape[0] / lg.shape[1])
    lg = cv2.resize(lg, (lw, lh), interpolation=cv2.INTER_AREA).astype(np.float32)
    cx, cy = int(args.logo_xy[0] * w), int(args.logo_xy[1] * h)
    x0, y0 = cx - lw // 2, cy - lh // 2
    if args.logo_clear:
        # knock out small shapes (stars, confetti) of the background right round the logo
        bgc = np.median(a[max(0, y0):y0 + lh, max(0, x0):x0 + lw].reshape(-1, 3), 0)
        fg = (np.abs(a - bgc).sum(2) > 90).astype(np.uint8)
        n, lab, st, _ = cv2.connectedComponentsWithStats(fg, 8)
        pad = lw // 8
        for i in range(1, n):
            bx, by, bw, bh, area = st[i]
            if area < (lw * 0.25) ** 2 and bx < x0 + lw + pad and bx + bw > x0 - pad and by < y0 + lh + pad and by + bh > y0 - pad:
                sl = (slice(by, by + bh), slice(bx, bx + bw))
                mm = cv2.dilate((lab[sl] == i).astype(np.uint8), np.ones((5, 5), np.uint8)).astype(bool)
                a[sl][mm] = bgc
    al = lg[..., 3:4] / 255 if lg.shape[2] == 4 else np.ones((lh, lw, 1), np.float32)
    reg = a[y0:y0 + lh, x0:x0 + lw]
    a[y0:y0 + lh, x0:x0 + lw] = reg * (1 - al) + lg[..., :3] * al
    return a


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--slug', required=True, help='design slug, used in output names (e.g. usa)')
    g = ap.add_mutually_exclusive_group(required=True)
    g.add_argument('--tile', help='seamless print tile (PNG)')
    g.add_argument('--panel', help='front artwork covering the whole vest, stretched to the vest box')
    ap.add_argument('--tile-width', type=float, default=0.5, help='tile size as a fraction of vest width (default 0.5)')
    ap.add_argument('--tile-offset', type=float, nargs=2, default=(0.0, 0.0), help='shift the repeat, in tiles (x y)')
    ap.add_argument('--logo', help='transparent PNG placed on the chest')
    ap.add_argument('--logo-xy', type=float, nargs=2, default=(0.73, 0.37), help="logo centre as fraction of vest box (default wearer's left chest)")
    ap.add_argument('--logo-w', type=float, default=0.30, help='logo width as fraction of vest width')
    ap.add_argument('--logo-clear', action='store_true', help='remove small print shapes touching the logo')
    ap.add_argument('--lining', default=None, help="recolour the inner lining: 'black' or a hex colour like '#ff1493' (default: keep the photo's red)")
    ap.add_argument('--base', default='f2401-front', choices=list(BASES), help='base photo')
    ap.add_argument('--out', default=None, help='output folder (default /mnt/project-files/images/<slug>-vest/photo-mockup)')
    args = ap.parse_args()

    base = BASES[args.base]; UP = 2
    out = args.out or f'/mnt/project-files/images/{args.slug}-vest/photo-mockup'
    os.makedirs(out, exist_ok=True)
    im0 = cv2.imread(os.path.join(HERE, base['path']))[:base['crop_h']]
    im = cv2.resize(im0, None, fx=UP, fy=UP, interpolation=cv2.INTER_CUBIC)
    H, W = im.shape[:2]
    im, L, M = build_masks(im, base, UP)
    vest, fabric = M['vest'], M['fabric']
    ys, xs = np.nonzero(vest); x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
    bw, bh = x1 - x0 + 1, y1 - y0 + 1

    art = place_logo(artwork(args, bw, bh), args)
    gy, gx = np.mgrid[0:H, 0:W].astype(np.float32)
    Ls = cv2.GaussianBlur(L, (0, 0), 6 * UP)
    dx = cv2.Sobel(Ls, cv2.CV_32F, 1, 0, ksize=5) / 400; dy = cv2.Sobel(Ls, cv2.CV_32F, 0, 1, ksize=5) / 400
    cxp, half = (x0 + x1) / 2, bw / 2
    u = np.clip((gx - cxp) / half, -1, 1)
    wrapx = cxp + half * np.arcsin(u * 0.9) / np.arcsin(0.9)   # print wraps round the sides (compressed at the edges)
    mx = (wrapx - x0 + dx * UP * 3).astype(np.float32); my = (gy - y0 + dy * UP * 3).astype(np.float32)
    pr = np.clip(cv2.remap(art, mx, my, cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT), 0, 255)

    ref = np.median(L[fabric > 0.5])
    shade = cv2.GaussianBlur(L / ref, (0, 0), 0.8)
    col = 255 * np.clip((pr / 255) ** 2.2 * np.clip(shade, 0, 3)[..., None] ** 1.15, 0, 1) ** (1 / 2.2)
    col = col + np.clip(shade - 1.12, 0, 1)[..., None] * 90 * (1 - col / 255)
    col *= (1 + 0.6 * (L - cv2.GaussianBlur(L, (0, 0), 2.0)) / ref)[..., None]
    fs = cv2.GaussianBlur(fabric, (0, 0), 1.2)[..., None]
    res = im.astype(np.float32) * (1 - fs) + col * fs
    zb = cv2.GaussianBlur(M['zipper'].astype(np.float32), (0, 0), 1.5)[..., None]
    res = res * (1 - zb) + (L * 0.5)[..., None] * zb
    if args.lining:
        # lining mask comes from the blank photo, so red in the print is never touched
        lw = cv2.GaussianBlur(M['lining'].astype(np.float32), (0, 0), 1.5)[..., None]
        shade_l = (L / max(1.0, np.median(L[M['lining'] > 0])))[..., None]
        if args.lining == 'black':
            lin = np.full(3, 22.0) * shade_l * 1.15
        else:
            hx = args.lining.lstrip('#'); rgb = [int(hx[i:i + 2], 16) for i in (0, 2, 4)]
            lin = np.array(rgb[::-1], np.float32) * shade_l
        res = res * (1 - lw) + lin * lw
    res = np.clip(np.where(vest[..., None] > 0, res, 255), 0, 255).astype(np.uint8)

    # outputs: full photo, 2000x2000 listing on white, site cut-out webp (1100 wide), chest detail 1400x1400
    cv2.imwrite(f'{out}/{args.slug}-front-photo.png', res)
    S = 2000; pad = 120; k = (S - 2 * pad) / max(bw, bh)
    crop = res[y0:y1 + 1, x0:x1 + 1]
    cr = cv2.resize(crop, (int(bw * k), int(bh * k)), interpolation=cv2.INTER_AREA)
    lst = np.full((S, S, 3), 255, np.uint8); oy, ox = (S - cr.shape[0]) // 2, (S - cr.shape[1]) // 2
    lst[oy:oy + cr.shape[0], ox:ox + cr.shape[1]] = cr
    cv2.imwrite(f'{out}/01-front-photo.png', lst)
    a = cv2.GaussianBlur(vest[y0:y1 + 1, x0:x1 + 1].astype(np.float32), (0, 0), 0.8)
    rgba = np.dstack([crop, (a * 255).astype(np.uint8)])
    sw = 1100; rgba = cv2.resize(rgba, (sw, int(bh * sw / bw)), interpolation=cv2.INTER_AREA)
    cv2.imwrite(f'{out}/{args.slug}-front.webp', rgba, [cv2.IMWRITE_WEBP_QUALITY, 90])
    dx0, dy0 = int(x0 + 0.42 * bw), int(y0 + 0.12 * bh); dsz = int(0.5 * bw)
    det = cv2.resize(res[dy0:dy0 + dsz, dx0:dx0 + dsz], (1400, 1400), interpolation=cv2.INTER_CUBIC)
    cv2.imwrite(f'{out}/{args.slug}-detail.jpg', det, [cv2.IMWRITE_JPEG_QUALITY, 90])
    print(json.dumps({'out': out, 'files': sorted(os.listdir(out))}))


if __name__ == '__main__':
    main()
