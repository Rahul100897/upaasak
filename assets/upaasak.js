/* ============================================================================
   UPAASAK — interactions for upaasak-* sections
   Idempotent: safe to load/run more than once. Re-scans on Shopify editor events.
   ========================================================================== */
(function () {
  'use strict';

  function initReveal(root) {
    var els = (root || document).querySelectorAll('[data-reveal]:not([data-reveal-bound])');
    if (!els.length) return;
    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('is-in'); el.setAttribute('data-reveal-bound', '1'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (el) { el.setAttribute('data-reveal-bound', '1'); io.observe(el); });
  }

  function initCountUp(root) {
    var nums = (root || document).querySelectorAll('[data-count]:not([data-count-bound])');
    if (!nums.length || !('IntersectionObserver' in window)) {
      nums.forEach(function (n) { n.textContent = n.getAttribute('data-count') + (n.getAttribute('data-suffix') || ''); n.setAttribute('data-count-bound', '1'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target; io.unobserve(el);
        var target = parseFloat(el.getAttribute('data-count')) || 0;
        var suffix = el.getAttribute('data-suffix') || '';
        var dur = 1400, start = null;
        function tick(ts) {
          if (!start) start = ts;
          var p = Math.min((ts - start) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          var val = target * eased;
          el.textContent = (target % 1 ? val.toFixed(1) : Math.round(val).toLocaleString()) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.6 });
    nums.forEach(function (n) { n.setAttribute('data-count-bound', '1'); io.observe(n); });
  }

  function initBars(root) {
    var bars = (root || document).querySelectorAll('.u-rev__bar-fill[data-pct]:not([data-bar-bound])');
    if (!bars.length) return;
    var io = ('IntersectionObserver' in window) ? new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.style.width = e.target.getAttribute('data-pct') + '%'; io.unobserve(e.target); } });
    }, { threshold: 0.4 }) : null;
    bars.forEach(function (b) {
      b.setAttribute('data-bar-bound', '1');
      if (io) io.observe(b); else b.style.width = b.getAttribute('data-pct') + '%';
    });
  }

  function initFaq(root) {
    var qs = (root || document).querySelectorAll('.u-faq__q:not([data-faq-bound])');
    qs.forEach(function (q) {
      q.setAttribute('data-faq-bound', '1');
      q.addEventListener('click', function () {
        var item = q.closest('.u-faq__item');
        var ans = item.querySelector('.u-faq__a');
        var open = item.classList.contains('is-open');
        var list = q.closest('.u-faq__list');
        if (list) list.querySelectorAll('.u-faq__item.is-open').forEach(function (it) {
          if (it !== item) { it.classList.remove('is-open'); var a = it.querySelector('.u-faq__a'); if (a) a.style.maxHeight = null; }
        });
        if (open) { item.classList.remove('is-open'); ans.style.maxHeight = null; }
        else { item.classList.add('is-open'); ans.style.maxHeight = ans.scrollHeight + 'px'; }
      });
    });
  }

  function initCarousels(root) {
    var carousels = (root || document).querySelectorAll('[data-carousel]:not([data-carousel-bound])');
    carousels.forEach(function (c) {
      c.setAttribute('data-carousel-bound', '1');
      var track = c.querySelector('.u-tmls__track');
      var prev = c.querySelector('[data-prev]');
      var next = c.querySelector('[data-next]');
      if (!track) return;
      var index = 0;
      function perView() { return window.innerWidth <= 600 ? 1 : (window.innerWidth <= 980 ? 2 : 3); }
      function maxIndex() { return Math.max(0, track.children.length - perView()); }
      function go(i) {
        index = Math.max(0, Math.min(i, maxIndex()));
        var card = track.children[0];
        if (!card) return;
        var step = card.getBoundingClientRect().width + 26; /* gap */
        track.style.transform = 'translateX(' + (-index * step) + 'px)';
      }
      if (prev) prev.addEventListener('click', function () { go(index - 1); });
      if (next) next.addEventListener('click', function () { go(index + 1); });
      window.addEventListener('resize', function () { go(index); });
      go(0);
    });
  }

  function initAnnouncements(root) {
    var bars = (root || document).querySelectorAll('[data-announce]:not([data-announce-bound])');
    bars.forEach(function (bar) {
      bar.setAttribute('data-announce-bound', '1');
      var msgs = bar.querySelectorAll('.u-ann__msg');
      if (msgs.length < 2) return;
      var i = 0;
      setInterval(function () {
        var cur = msgs[i];
        cur.classList.remove('is-active'); cur.classList.add('is-out');
        i = (i + 1) % msgs.length;
        var nxt = msgs[i];
        nxt.classList.remove('is-out'); nxt.classList.add('is-active');
        setTimeout(function () { cur.classList.remove('is-out'); }, 700);
      }, 3800);
    });
  }

  function initSlideshows(root) {
    var shows = (root || document).querySelectorAll('[data-slideshow]:not([data-slideshow-bound])');
    shows.forEach(function (show) {
      show.setAttribute('data-slideshow-bound', '1');
      var track = show.querySelector('.u-slides__track');
      var slides = track ? track.children : [];
      if (!track || slides.length === 0) return;
      var dots = show.querySelectorAll('.u-slides__dots button');
      var prev = show.querySelector('.u-slides__arrow--prev');
      var next = show.querySelector('.u-slides__arrow--next');
      var i = 0, timer = null;
      var delay = parseInt(show.getAttribute('data-interval'), 10) || 5500;
      function setHeight() { var a = slides[i]; if (a) show.style.height = a.offsetHeight + 'px'; }
      function go(n) {
        i = (n + slides.length) % slides.length;
        track.style.transform = 'translateX(' + (-i * 100) + '%)';
        dots.forEach(function (d, di) { d.classList.toggle('is-active', di === i); });
        setHeight();
      }
      function play() { if (slides.length > 1) { stop(); timer = setInterval(function () { go(i + 1); }, delay); } }
      function stop() { if (timer) clearInterval(timer); }
      dots.forEach(function (d, di) { d.addEventListener('click', function () { go(di); play(); }); });
      if (prev) prev.addEventListener('click', function () { go(i - 1); play(); });
      if (next) next.addEventListener('click', function () { go(i + 1); play(); });
      show.addEventListener('mouseenter', stop);
      show.addEventListener('mouseleave', play);
      show.querySelectorAll('img').forEach(function (im) { if (!im.complete) im.addEventListener('load', setHeight); });
      window.addEventListener('resize', setHeight);
      window.addEventListener('load', setHeight);
      go(0); play();
    });
  }

  function initBurger(root) {
    (root || document).querySelectorAll('[data-burger]:not([data-burger-bound])').forEach(function (btn) {
      btn.setAttribute('data-burger-bound', '1');
      btn.addEventListener('click', function () {
        var nav = document.querySelector('[data-catnav]');
        if (!nav) return;
        var open = nav.classList.toggle('is-open');
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        document.body.classList.toggle('u-noscroll', open);
      });
    });
    (root || document).querySelectorAll('[data-catnav-close]:not([data-catnav-close-bound])').forEach(function (el) {
      el.setAttribute('data-catnav-close-bound', '1');
      el.addEventListener('click', function () {
        var nav = document.querySelector('[data-catnav]');
        if (nav) nav.classList.remove('is-open');
        document.body.classList.remove('u-noscroll');
        var b = document.querySelector('[data-burger]');
        if (b) b.setAttribute('aria-expanded', 'false');
      });
    });
  }

  function initTabs(root) {
    var groups = (root || document).querySelectorAll('[data-tabs]:not([data-tabs-bound])');
    groups.forEach(function (group) {
      group.setAttribute('data-tabs-bound', '1');
      var pills = group.querySelectorAll('[data-tab]');
      var panels = group.querySelectorAll('[data-panel]');
      pills.forEach(function (pill) {
        pill.addEventListener('click', function () {
          var key = pill.getAttribute('data-tab');
          pills.forEach(function (p) { p.classList.toggle('is-active', p === pill); });
          panels.forEach(function (panel) {
            panel.classList.toggle('is-active', panel.getAttribute('data-panel') === key);
          });
        });
      });
    });
  }

  function initPdp(root) {
    (root || document).querySelectorAll('[data-pdp]:not([data-pdp-bound])').forEach(function (sec) {
      sec.setAttribute('data-pdp-bound', '1');
      var main = sec.querySelector('[data-pdp-main]');

      /* Gallery thumbnails */
      var thumbs = sec.querySelectorAll('[data-pdp-thumb]');
      thumbs.forEach(function (t) {
        t.addEventListener('click', function () {
          var full = t.getAttribute('data-full');
          if (main && full) main.src = full;
          thumbs.forEach(function (x) { x.classList.remove('is-active'); });
          t.classList.add('is-active');
        });
      });

      /* Quantity stepper */
      var qty = sec.querySelector('[data-pdp-qty]');
      var qm = sec.querySelector('[data-pdp-qminus]');
      var qp = sec.querySelector('[data-pdp-qplus]');
      if (qm && qty) qm.addEventListener('click', function () { qty.value = Math.max(1, (parseInt(qty.value, 10) || 1) - 1); });
      if (qp && qty) qp.addEventListener('click', function () { qty.value = (parseInt(qty.value, 10) || 1) + 1; });

      /* Share — copy link */
      var copy = sec.querySelector('[data-pdp-copy]');
      if (copy) copy.addEventListener('click', function () {
        var url = copy.getAttribute('data-url') || window.location.href;
        if (navigator.clipboard) navigator.clipboard.writeText(url);
        copy.classList.add('is-copied');
        setTimeout(function () { copy.classList.remove('is-copied'); }, 1600);
      });

      /* Variant selection */
      var dataEl = sec.querySelector('[data-pdp-variants]');
      var radios = sec.querySelectorAll('[data-pdp-radio]');
      if (!dataEl || !radios.length) return;
      var variants = [];
      try { variants = JSON.parse(dataEl.textContent); } catch (e) { return; }
      if (!variants.length) return;
      var idInput = sec.querySelector('[data-pdp-id]');
      var priceNow = sec.querySelector('[data-pdp-price-now]');
      var priceWas = sec.querySelector('[data-pdp-price-was]');
      var atc = sec.querySelector('[data-pdp-atc]');

      function selectedOptions() {
        var opts = [];
        sec.querySelectorAll('[data-pdp-opt]').forEach(function (grp) {
          var pos = parseInt(grp.getAttribute('data-opt-pos'), 10);
          var checked = grp.querySelector('[data-pdp-radio]:checked');
          opts[pos] = checked ? checked.value : null;
        });
        return opts;
      }
      function update() {
        radios.forEach(function (r) {
          var chip = r.closest('.u-pdp__chip-opt');
          if (chip) chip.classList.toggle('is-active', r.checked);
        });
        var sel = selectedOptions();
        var match = null;
        for (var i = 0; i < variants.length; i++) {
          var v = variants[i], ok = true;
          for (var j = 0; j < v.options.length; j++) { if (v.options[j] !== sel[j]) { ok = false; break; } }
          if (ok) { match = v; break; }
        }
        if (!match) return;
        if (idInput) idInput.value = match.id;
        if (priceNow) priceNow.innerHTML = match.price;
        if (priceWas) {
          if (match.compare_raw && match.compare_raw > match.price_raw) { priceWas.innerHTML = match.compare_at; priceWas.style.display = ''; }
          else { priceWas.style.display = 'none'; }
        }
        if (atc) {
          if (match.available) { atc.disabled = false; atc.classList.remove('is-disabled'); atc.textContent = atc.getAttribute('data-label') || 'Add to Cart'; }
          else { atc.disabled = true; atc.classList.add('is-disabled'); atc.textContent = 'Sold Out'; }
        }
        if (match.image && main) main.src = match.image;
      }
      radios.forEach(function (r) { r.addEventListener('change', update); });
    });
  }

  function initAll(root) {
    initReveal(root);
    initCountUp(root);
    initBars(root);
    initFaq(root);
    initCarousels(root);
    initAnnouncements(root);
    initSlideshows(root);
    initTabs(root);
    initBurger(root);
    initPdp(root);
  }

  if (window.__upaasakInit) { window.__upaasakRescan && window.__upaasakRescan(); return; }
  window.__upaasakInit = true;
  window.__upaasakRescan = function () { initAll(document); };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { initAll(document); });
  } else {
    initAll(document);
  }

  /* Shopify Theme Editor: re-bind when sections load/reorder */
  if (window.Shopify && Shopify.designMode) {
    document.addEventListener('shopify:section:load', function (e) { initAll(e.target); });
    document.addEventListener('shopify:section:reorder', function () { initAll(document); });
  }
})();
