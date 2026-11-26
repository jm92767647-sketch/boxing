/* Paint a synthesized arena scene behind the untouched source photograph. */
(() => {
  'use strict';
  const intro = document.getElementById('intro');
  const image = intro?.querySelector('.introart');
  const output = intro?.querySelector('canvas.introbg');
  if (!image || !output || document.documentElement.classList.contains('no-intro')) return;
  const scenery = new Image();
  let frame, variant;
  function schedule() { cancelAnimationFrame(frame); frame = requestAnimationFrame(paint); }
  scenery.addEventListener('load', schedule);
  function paint() {
    if (intro.hidden || !image.naturalWidth) return;
    const box = intro.getBoundingClientRect(), photo = image.getBoundingClientRect();
    if (!box.width || !box.height || !photo.width) return;
    const mobile = box.width <= 760, next = mobile ? 'mobile' : 'desktop';
    if (variant !== next) {
      variant = next; scenery.src = `assets/intro-scene-${next}.jpg?v=20261126`;
      return;
    }
    if (!scenery.complete || !scenery.naturalWidth) return;
    const scale = Math.min(.75, 1200 / box.width), pad = 80;
    const w = Math.ceil(box.width * scale), h = Math.ceil(box.height * scale);
    const x = (photo.left - box.left) * scale, y = (photo.top - box.top) * scale;
    const pw = photo.width * scale, ph = photo.height * scale;
    const source = document.createElement('canvas');
    source.width = w + pad * 2; source.height = h + pad * 2;
    const ctx = source.getContext('2d');
    // Align the actual generated ropes/canvas to the original. Extend whole scene
    // regions with their own texture and perspective; never repeat an edge pixel.
    const cuts = mobile ? [0, .302, .5, 1] : [0, .51, .80, 1];
    const target = [-pad, y + ph * .5, y + ph * .818, h + pad];
    for (let i = 0; i < cuts.length - 1; i++) {
      ctx.drawImage(scenery, 0, cuts[i] * scenery.naturalHeight,
        scenery.naturalWidth, (cuts[i+1] - cuts[i]) * scenery.naturalHeight,
        0, target[i] + pad, w + pad * 2, target[i+1] - target[i]);
    }
    output.width = w; output.height = h;
    const final = output.getContext('2d');
    for (const [radius, from, to] of [[5, null, null], [19, -8, 75], [42, 45, 220]]) {
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
    output.dataset.scene = variant;
  }
  image.addEventListener('load', schedule, { once: true });
  if (image.complete) schedule();
  const observer = new ResizeObserver(schedule); observer.observe(intro); observer.observe(image);
  new MutationObserver(() => { if (intro.hidden) { observer.disconnect(); cancelAnimationFrame(frame); } }).observe(intro, { attributes: true, attributeFilter: ['hidden'] });
})();
