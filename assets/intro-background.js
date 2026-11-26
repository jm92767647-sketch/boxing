/* Extend the actual edges of the contained photograph, rather than a second crop. */
(() => {
  'use strict';
  const intro = document.getElementById('intro');
  const image = intro?.querySelector('.introart');
  const output = intro?.querySelector('canvas.introbg');
  if (!image || !output || document.documentElement.classList.contains('no-intro')) return;
  let frame;
  function paint() {
    if (!image.naturalWidth || intro.hidden) return;
    const bounds = intro.getBoundingClientRect(), photo = image.getBoundingClientRect();
    if (!bounds.width || !bounds.height || !photo.width) return;
    // Work at half resolution: this layer is deliberately blurred and redraws only on resize.
    const scale = Math.min(.5, 960 / bounds.width), pad = 96;
    const w = Math.ceil(bounds.width * scale), h = Math.ceil(bounds.height * scale);
    const x = (photo.left - bounds.left) * scale, y = (photo.top - bounds.top) * scale;
    const pw = photo.width * scale, ph = photo.height * scale;
    const iw = image.naturalWidth, ih = image.naturalHeight;
    const source = document.createElement('canvas');
    source.width = w + pad * 2; source.height = h + pad * 2;
    const ctx = source.getContext('2d');
    // Nine slices extend each edge in its own direction, preserving its varying colors.
    const sx = [0, 0, iw - 1], sy = [0, 0, ih - 1];
    const sw = [1, iw, 1], sh = [1, ih, 1];
    const dx = [0, x + pad, x + pw + pad], dy = [0, y + pad, y + ph + pad];
    const dw = [x + pad, pw, w + pad - x - pw];
    const dh = [y + pad, ph, h + pad - y - ph];
    for (let row = 0; row < 3; row++) for (let col = 0; col < 3; col++) {
      if (dw[col] > 0 && dh[row] > 0) ctx.drawImage(image, sx[col], sy[row], sw[col], sh[row], dx[col], dy[row], dw[col], dh[row]);
    }
    output.width = w; output.height = h;
    const final = output.getContext('2d');
    for (const [radius, from, to] of [[6, null, null], [22, -12, 85], [48, 45, 230]]) {
      const layer = document.createElement('canvas'); layer.width = w; layer.height = h;
      const lc = layer.getContext('2d');
      lc.filter = `blur(${radius * scale}px)`;
      lc.drawImage(source, -pad, -pad); lc.filter = 'none';
      if (from !== null) {
        const pixels = lc.getImageData(0, 0, w, h);
        for (let py = 0; py < h; py++) for (let px = 0; px < w; px++) {
          const distance = Math.max(x - px, px - x - pw, y - py, py - y - ph) / scale;
          const t = Math.max(0, Math.min(1, (distance - from) / (to - from)));
          pixels.data[(py * w + px) * 4 + 3] = Math.round(255 * t * t * (3 - 2 * t));
        }
        lc.putImageData(pixels, 0, 0);
      }
      final.drawImage(layer, 0, 0);
    }
  }
  function schedule() { cancelAnimationFrame(frame); frame = requestAnimationFrame(paint); }
  image.addEventListener('load', schedule, { once: true });
  if (image.complete) schedule();
  const observer = new ResizeObserver(schedule); observer.observe(intro); observer.observe(image);
  new MutationObserver(() => { if (intro.hidden) { observer.disconnect(); cancelAnimationFrame(frame); } }).observe(intro, { attributes: true, attributeFilter: ['hidden'] });
})();
