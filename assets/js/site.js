/* site.js - additions: lightweight lightbox for galleries
   Behavior:
   - Delegated click handler on links with .gallery-item
   - Builds a lightbox overlay, supports prev/next, keyboard, and click-to-close
*/

(function () {
  'use strict';

  function createLightbox() {
    const lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-hidden', 'true');
    lb.innerHTML = `
      <div class="lightbox__content">
        <button class="lightbox__close" aria-label="Close (Esc)">✕</button>
        <div class="lightbox__controls">
          <button class="lightbox__button lightbox__prev" aria-label="Previous (Left)">◀</button>
          <button class="lightbox__button lightbox__next" aria-label="Next (Right)">▶</button>
        </div>
        <img class="lightbox__img" src="" alt="">
      </div>
    `;
    document.body.appendChild(lb);
    return lb;
  }

  function Lightbox(galleryLinks) {
    this.links = Array.from(galleryLinks);
    this.index = 0;
    this.lb = createLightbox();
    this.imgEl = this.lb.querySelector('.lightbox__img');
    this.closeBtn = this.lb.querySelector('.lightbox__close');
    this.prevBtn = this.lb.querySelector('.lightbox__prev');
    this.nextBtn = this.lb.querySelector('.lightbox__next');
    this.onKey = this.onKey.bind(this);
    this.bindControls();
  }

  Lightbox.prototype.open = function (index) {
    this.index = index;
    const link = this.links[this.index];
    this.showImage(link);
    this.lb.classList.add('open');
    this.lb.setAttribute('aria-hidden', 'false');
    document.addEventListener('keydown', this.onKey);
  };

  Lightbox.prototype.close = function () {
    this.lb.classList.remove('open');
    this.lb.setAttribute('aria-hidden', 'true');
    this.imgEl.src = '';
    document.removeEventListener('keydown', this.onKey);
  };

  Lightbox.prototype.showImage = function (link) {
    const src = link.getAttribute('href') || link.dataset.full || '';
    const alt = link.querySelector('img') ? link.querySelector('img').alt || '' : link.getAttribute('data-alt') || '';
    this.imgEl.alt = alt;
    // simple fade: set src after small timeout to allow smoothness on repeated opens
    this.imgEl.src = src;
    // preload neighbors
    this.preload(this.index + 1);
    this.preload(this.index - 1);
  };

  Lightbox.prototype.preload = function (idx) {
    if (idx < 0 || idx >= this.links.length) return;
    const src = this.links[idx].getAttribute('href') || this.links[idx].dataset.full;
    if (!src) return;
    const i = new Image();
    i.src = src;
  };

  Lightbox.prototype.bindControls = function () {
    const self = this;
    // close by clicking overlay (but not on image or controls)
    this.lb.addEventListener('click', function (e) {
      if (e.target === self.lb) self.close();
    });
    this.closeBtn.addEventListener('click', function () { self.close(); });
    this.prevBtn.addEventListener('click', function (e) { e.stopPropagation(); self.prev(); });
    this.nextBtn.addEventListener('click', function (e) { e.stopPropagation(); self.next(); });
  };

  Lightbox.prototype.prev = function () {
    if (this.index > 0) {
      this.index -= 1;
      this.showImage(this.links[this.index]);
    }
  };

  Lightbox.prototype.next = function () {
    if (this.index < this.links.length - 1) {
      this.index += 1;
      this.showImage(this.links[this.index]);
    }
  };

  Lightbox.prototype.onKey = function (e) {
    if (e.key === 'Escape') { this.close(); }
    else if (e.key === 'ArrowLeft') { this.prev(); }
    else if (e.key === 'ArrowRight') { this.next(); }
  };

  // Initialize: find all galleries and wire up delegation
  document.addEventListener('DOMContentLoaded', function () {
    const galleries = document.querySelectorAll('.gallery');
    galleries.forEach(function (g) {
      const links = g.querySelectorAll('a.gallery-item');
      if (!links.length) return;
      const lb = new Lightbox(links);

      // delegation: root listens and opens lb with correct index
      g.addEventListener('click', function (e) {
        const a = e.target.closest('a.gallery-item');
        if (!a) return;
        e.preventDefault();
        const idx = Array.prototype.indexOf.call(links, a);
        if (idx >= 0) lb.open(idx);
      });

      // make gallery items keyboard-friendly: Enter/Space opens lightbox
      g.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          const a = e.target.closest('a.gallery-item');
          if (!a) return;
          e.preventDefault();
          const idx = Array.prototype.indexOf.call(links, a);
          if (idx >= 0) lb.open(idx);
        }
      });
    });
  });

})();
