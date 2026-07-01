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

  function initRecs(root) {
    (root || document).querySelectorAll('[data-urecs]:not([data-urecs-bound])').forEach(function (el) {
      el.setAttribute('data-urecs-bound', '1');
      var url = el.getAttribute('data-url');
      var inner = el.querySelector('[data-urecs-inner]');
      if (!url || !inner || url.indexOf('product_id=&') !== -1) return;
      fetch(url).then(function (r) { return r.text(); }).then(function (text) {
        var doc = new DOMParser().parseFromString(text, 'text/html');
        var fresh = doc.querySelector('[data-urecs-inner]');
        if (fresh && fresh.querySelector('.u-pcard')) {
          inner.innerHTML = fresh.innerHTML;
          if (window.__upaasakRescan) window.__upaasakRescan();
        }
      }).catch(function () {});
    });
  }

  /* ---------------- Cart drawer ---------------- */
  var CART_SECTION = 'upaasak-cart-drawer';

  function openCart() {
    var d = document.querySelector('[data-cart-drawer]');
    if (!d) return;
    d.classList.add('is-open');
    d.setAttribute('aria-hidden', 'false');
    document.body.classList.add('u-noscroll');
  }
  function closeCart() {
    var d = document.querySelector('[data-cart-drawer]');
    if (!d) return;
    d.classList.remove('is-open');
    d.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('u-noscroll');
  }

  function applyCartSections(sections) {
    if (!sections) return;
    var html = sections[CART_SECTION];
    if (!html) return;
    var doc = new DOMParser().parseFromString(html, 'text/html');
    var fresh = doc.querySelector('#u-cart-contents');
    var cur = document.querySelector('#u-cart-contents');
    if (fresh && cur) cur.innerHTML = fresh.innerHTML;
    var count = cur ? (cur.getAttribute('data-cart-count') || '0') : '0';
    var badge = fresh ? fresh.getAttribute('data-cart-count') : null;
    if (badge != null) count = badge;
    document.querySelectorAll('[data-cart-badge]').forEach(function (b) {
      b.textContent = count;
      b.style.display = (parseInt(count, 10) > 0) ? '' : 'none';
    });
  }

  function ajaxAdd(form, submitter) {
    var btn = submitter || form.querySelector('[type="submit"]');
    var buyNow = !!(submitter && submitter.hasAttribute('data-pdp-buynow'));
    var fd = new FormData(form);
    fd.append('sections', CART_SECTION);
    fd.append('sections_url', window.location.pathname);
    if (btn) { btn.classList.add('is-loading'); btn.setAttribute('aria-busy', 'true'); }
    fetch('/cart/add.js', { method: 'POST', headers: { 'Accept': 'application/json' }, body: fd })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (res) {
        if (!res.ok) { if (btn) { btn.classList.add('is-error'); setTimeout(function () { btn.classList.remove('is-error'); }, 1200); } return; }
        if (buyNow) { window.location.href = '/checkout'; return; }
        if (res.j.sections) applyCartSections(res.j.sections); else refreshCart();
        openCart();
      })
      .catch(function () {})
      .finally(function () { if (btn) { btn.classList.remove('is-loading'); btn.removeAttribute('aria-busy'); } });
  }

  function changeLine(key, qty) {
    fetch('/cart/change.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ id: key, quantity: qty, sections: CART_SECTION, sections_url: window.location.pathname })
    })
      .then(function (r) { return r.json(); })
      .then(function (cart) { applyCartSections(cart.sections); })
      .catch(function () {});
  }

  function refreshCart() {
    fetch('/?sections=' + CART_SECTION)
      .then(function (r) { return r.json(); })
      .then(function (data) { applyCartSections(data); })
      .catch(function () {});
  }

  function initCart() {
    if (window.__upaasakCartBound) return;
    window.__upaasakCartBound = true;

    document.addEventListener('submit', function (e) {
      var form = e.target;
      if (!form || !form.getAttribute) return;
      var action = form.getAttribute('action') || '';
      if (action.indexOf('/cart/add') === -1) return;
      if (form.closest('product-form-component')) return; /* let the native theme handle its own forms */
      e.preventDefault();
      ajaxAdd(form, e.submitter);
    });

    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-cart-toggle]')) { e.preventDefault(); openCart(); return; }
      if (e.target.closest('[data-cart-close]')) { closeCart(); return; }
      var item = e.target.closest('[data-cart-item]');
      if (!item) return;
      var key = item.getAttribute('data-key');
      var qty = parseInt(item.getAttribute('data-qty'), 10) || 1;
      if (e.target.closest('[data-cart-plus]')) { changeLine(key, qty + 1); }
      else if (e.target.closest('[data-cart-minus]')) { changeLine(key, Math.max(0, qty - 1)); }
      else if (e.target.closest('[data-cart-remove]')) { changeLine(key, 0); }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeCart();
    });
  }

  /* ---------------- Predictive search ---------------- */
  function bindSearchWrap(wrap) {
    wrap.setAttribute('data-psearch-bound', '1');
    var input = wrap.querySelector('[data-psearch-input]');
    var panel = wrap.querySelector('[data-psearch-results]');
    var clear = wrap.querySelector('[data-psearch-clear]');
    if (!input || !panel) return;
    var timer = null, lastQ = '';

    function hide() { panel.classList.remove('is-open'); panel.innerHTML = ''; }
    function loading() { panel.innerHTML = '<div class="u-psearch__loading"><span class="u-psearch__spin"></span></div>'; panel.classList.add('is-open'); }
    function run(q) {
      var url = '/search/suggest?q=' + encodeURIComponent(q) +
        '&section_id=upaasak-predictive' +
        '&resources[type]=product&resources[limit]=8' +
        '&resources[options][unavailable_products]=last' +
        '&resources[options][fields]=title,product_type,vendor,variants.title,variants.sku';
      fetch(url).then(function (r) { return r.text(); }).then(function (html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var content = doc.querySelector('[data-psearch-content]');
        panel.innerHTML = content ? content.innerHTML : html;
        panel.classList.add('is-open');
      }).catch(function () { hide(); });
    }

    input.addEventListener('input', function () {
      var q = input.value.trim();
      if (clear) clear.hidden = q.length === 0;
      if (q.length < 2) { lastQ = ''; hide(); return; }
      if (q === lastQ) return;
      lastQ = q;
      loading();
      clearTimeout(timer);
      timer = setTimeout(function () { run(q); }, 250);
    });
    input.addEventListener('focus', function () {
      if (input.value.trim().length >= 2 && panel.innerHTML) panel.classList.add('is-open');
    });
    if (clear) clear.addEventListener('click', function () {
      input.value = ''; clear.hidden = true; lastQ = ''; hide(); input.focus();
    });
  }

  function initSearch(root) {
    (root || document).querySelectorAll('[data-psearch]:not([data-psearch-bound])').forEach(bindSearchWrap);
    if (window.__upaasakSearchDoc) return;
    window.__upaasakSearchDoc = true;
    document.addEventListener('click', function (e) {
      var toggle = e.target.closest('[data-search-toggle]');
      if (toggle) {
        e.preventDefault();
        var w = document.querySelector('[data-psearch]');
        if (!w) return;
        var open = w.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        if (open) { var i = w.querySelector('[data-psearch-input]'); if (i) setTimeout(function () { i.focus(); }, 60); }
        return;
      }
      document.querySelectorAll('[data-psearch]').forEach(function (wrap) {
        if (wrap.contains(e.target)) return;
        var p = wrap.querySelector('[data-psearch-results]');
        if (p) p.classList.remove('is-open');
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      document.querySelectorAll('[data-psearch]').forEach(function (wrap) {
        var p = wrap.querySelector('[data-psearch-results]');
        if (p) p.classList.remove('is-open');
        wrap.classList.remove('is-open');
      });
      var tg = document.querySelector('[data-search-toggle]');
      if (tg) tg.setAttribute('aria-expanded', 'false');
    });
  }

  /* ---------------- Collection filters ---------------- */
  function initCollection(root) {
    (root || document).querySelectorAll('[data-collection]:not([data-collection-bound])').forEach(function (sec) {
      sec.setAttribute('data-collection-bound', '1');
      var form = sec.querySelector('[data-col-form]');
      var sidebar = sec.querySelector('[data-col-sidebar]');

      /* Auto-submit when a filter or sort changes */
      if (form) {
        form.addEventListener('change', function () { form.submit(); });
      }

      /* Mobile filter drawer */
      function openF() { if (sidebar) { sidebar.classList.add('is-open'); document.body.classList.add('u-noscroll'); } }
      function closeF() { if (sidebar) { sidebar.classList.remove('is-open'); document.body.classList.remove('u-noscroll'); } }
      sec.querySelectorAll('[data-col-filters-toggle]').forEach(function (b) { b.addEventListener('click', openF); });
      sec.querySelectorAll('[data-col-filters-close]').forEach(function (b) { b.addEventListener('click', closeF); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeF(); });
    });
  }

  function initContact(root) {
    var body = (root || document).querySelector('textarea[name="contact[body]"]:not([data-contact-bound])');
    if (!body) return;
    body.setAttribute('data-contact-bound', '1');
    try {
      var q = new URLSearchParams(window.location.search).get('enquiry');
      if (q && !body.value.trim()) {
        body.value = 'I would like to enquire about: ' + q + '.\nPlease share the price and availability.';
      }
    } catch (e) {}
  }

  function initScrollers(root) {
    (root || document).querySelectorAll('[data-scroller]:not([data-scroller-bound])').forEach(function (s) {
      s.setAttribute('data-scroller-bound', '1');
      var track = s.querySelector('[data-scroll]');
      var prev = s.querySelector('[data-scroll-prev]');
      var next = s.querySelector('[data-scroll-next]');
      if (!track) return;
      function page() {
        var card = track.firstElementChild;
        var cw = card ? card.getBoundingClientRect().width + 20 : 300;
        var per = Math.max(1, Math.floor(track.clientWidth / cw));
        return cw * per;
      }
      function upd() {
        if (!prev && !next) return;
        var max = track.scrollWidth - track.clientWidth - 2;
        var noScroll = track.scrollWidth <= track.clientWidth + 4;
        if (prev) prev.classList.toggle('is-disabled', noScroll || track.scrollLeft <= 2);
        if (next) next.classList.toggle('is-disabled', noScroll || track.scrollLeft >= max);
      }
      if (prev) prev.addEventListener('click', function () { track.scrollBy({ left: -page(), behavior: 'smooth' }); });
      if (next) next.addEventListener('click', function () { track.scrollBy({ left: page(), behavior: 'smooth' }); });
      track.addEventListener('scroll', upd, { passive: true });
      window.addEventListener('resize', upd);
      upd();

      // Mouse/pointer drag-to-scroll (touch already scrolls natively via overflow-x).
      var dragging = false, moved = false, startX = 0, startScroll = 0;
      track.addEventListener('pointerdown', function (e) {
        if (e.pointerType === 'touch') return;
        dragging = true; moved = false;
        startX = e.clientX;
        startScroll = track.scrollLeft;
        track.classList.add('is-dragging');
      });
      track.addEventListener('pointermove', function (e) {
        if (!dragging) return;
        var dx = e.clientX - startX;
        if (Math.abs(dx) > 6) moved = true;
        track.scrollLeft = startScroll - dx;
      });
      function stopDrag(abandoned) {
        if (!dragging) return;
        dragging = false;
        track.classList.remove('is-dragging');
        // If the gesture ended without releasing back over the track (pointer left
        // it, or got cancelled), no click will follow to consume `moved` - clear it
        // now so it can't leak into the next, unrelated click on this carousel.
        if (abandoned) moved = false;
      }
      track.addEventListener('pointerup', function () { stopDrag(false); });
      track.addEventListener('pointerleave', function () { stopDrag(true); });
      track.addEventListener('pointercancel', function () { stopDrag(true); });
      track.addEventListener('click', function (e) {
        if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; }
      }, true);
    });
  }

  function initShuffle(root) {
    (root || document).querySelectorAll('[data-shuffle]:not([data-shuffle-done])').forEach(function (el) {
      el.setAttribute('data-shuffle-done', '1');
      var keep = parseInt(el.getAttribute('data-shuffle'), 10) || el.children.length;
      var kids = Array.prototype.slice.call(el.children);
      for (var i = kids.length - 1; i > 0; i--) {
        var j = (Math.random() * (i + 1)) | 0;
        var t = kids[i]; kids[i] = kids[j]; kids[j] = t;
      }
      kids.forEach(function (k, idx) { if (idx < keep) { el.appendChild(k); } else { k.parentNode && k.parentNode.removeChild(k); } });
    });
  }

  function initAll(root) {
    initShuffle(root);
    initScrollers(root);
    initContact(root);
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
    initRecs(root);
    initCart();
    initSearch(root);
    initCollection(root);
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
