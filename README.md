# Impact vest pre-order site

Static site, no build step. Open `index.html` or serve the folder.

- **Change the brand name, price, unlock threshold, sizes, season or designs:** edit `config.js` only.
- **Logo artwork** lives in `brand/` (header, stacked, mark, favicon, social image). If the name changes, swap those files and keep the filenames.
- **Turn on the forms:** create a free form at formspree.io, paste its endpoint into `formEndpoint` in `config.js`. Until then the forms say reservations are not open yet and send nothing.
- **Paid deposits later:** make a Stripe Payment Link per design and send it to reservers when a print unlocks (or link it from the success message).
- **Vest images** in `img/` are design renders, not photos. Replace with sample photos when they exist, same filenames.

When you replace a vest image under the same filename, bump `imgVersion` in config.js (and the `?v=` on styles.css, config.js and app.js in index.html when those change) so visitors get the new file instead of a cached copy.
