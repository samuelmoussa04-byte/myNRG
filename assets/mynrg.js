/* MyNrg theme interactions. No dependencies. */
(function () {
  'use strict';

  /* ---------- header menu ---------- */
  document.querySelectorAll('[data-menu-toggle]').forEach(function (btn) {
    var shell = btn.closest('.hdr');
    if (!shell) return;
    btn.addEventListener('click', function () {
      var open = shell.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    shell.querySelectorAll('.hdr__drawer a').forEach(function (a) {
      a.addEventListener('click', function () {
        shell.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
      });
    });
  });

  /* ---------- dismissible bars ---------- */
  document.querySelectorAll('[data-dismiss]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var target = btn.closest(btn.getAttribute('data-dismiss'));
      if (target) target.hidden = true;
    });
  });

  /* ---------- announcement rotation (phones) ---------- */
  document.querySelectorAll('[data-announce]').forEach(function (bar) {
    var items = bar.querySelectorAll('li');
    if (items.length < 2) return;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var i = 0;
    items[0].classList.add('is-active');
    bar.classList.add('is-cycling');
    if (reduce) return;
    setInterval(function () {
      items[i].classList.remove('is-active');
      i = (i + 1) % items.length;
      items[i].classList.add('is-active');
    }, 3500);
  });

  /* ---------- money ---------- */
  function money(cents, form) {
    var currency = (form && form.getAttribute('data-currency')) || 'USD';
    var locale = (form && form.getAttribute('data-locale')) || undefined;
    try {
      return new Intl.NumberFormat(locale, { style: 'currency', currency: currency }).format(cents / 100);
    } catch (e) {
      return '$' + (cents / 100).toFixed(2);
    }
  }

  /* ---------- buy box ---------- */
  document.querySelectorAll('[data-buy-form]').forEach(function (form) {
    var idInput = form.querySelector('input[name="id"]');
    var planInput = form.querySelector('input[name="selling_plan"]');
    var priceEls = document.querySelectorAll('[data-buy-price]');
    var perDayEls = document.querySelectorAll('[data-buy-perday]');
    var atcLabel = form.querySelector('[data-atc-label]');
    var subTerms = form.querySelector('[data-sub-terms]');
    var onceTerms = form.querySelector('[data-once-terms]');

    function current() {
      var pack = form.querySelector('input[name="pack"]:checked');
      var typeInput = form.querySelector('input[name="purchase_type"]:checked');
      var type = typeInput ? typeInput.value : 'once';
      return { pack: pack, type: type };
    }

    function render() {
      var c = current();
      if (!c.pack) return;
      var d = c.pack.dataset;
      var hasSub = !!d.sellingPlan && !!d.subPrice;
      var isSub = c.type === 'sub' && hasSub;
      var price = isSub ? parseInt(d.subPrice, 10) : parseInt(d.price, 10);
      var days = parseInt(d.days || '30', 10) || 30;

      var soldOut = c.pack.disabled;
      var submit = form.querySelector('[type="submit"]');
      if (submit) submit.disabled = soldOut;
      if (idInput) idInput.value = d.variantId;
      if (planInput) {
        planInput.value = isSub ? d.sellingPlan : '';
        planInput.disabled = !isSub;
      }
      priceEls.forEach(function (el) { el.textContent = money(price, form); });
      perDayEls.forEach(function (el) { el.textContent = money(Math.round(price / days), form) + '/day'; });
      if (atcLabel) atcLabel.textContent = soldOut ? 'Sold out' : 'Add to cart · ' + money(price, form);
      if (subTerms) subTerms.hidden = !isSub;
      if (onceTerms) onceTerms.hidden = isSub;

      /* keep every pack card's displayed price in step with the purchase type */
      form.querySelectorAll('input[name="pack"]').forEach(function (p) {
        var pd = p.dataset;
        var pSub = c.type === 'sub' && pd.sellingPlan && pd.subPrice;
        var pPrice = pSub ? parseInt(pd.subPrice, 10) : parseInt(pd.price, 10);
        var pDays = parseInt(pd.days || '30', 10) || 30;
        var card = p.closest('.pack');
        var strong = card && card.querySelector('[data-pack-price]');
        var per = card && card.querySelector('[data-pack-perday]');
        var was = card && card.querySelector('[data-pack-compare]');
        if (was) {
          was.textContent = money(parseInt(pd.price, 10), form);
          was.hidden = !pSub;
        }
        if (strong) strong.textContent = money(pPrice, form);
        if (per) per.textContent = money(Math.round(pPrice / pDays), form) + '/day';
      });

      document.dispatchEvent(new CustomEvent('mynrg:buy-change', { detail: { price: money(price, form), label: d.label || '' } }));
    }

    form.addEventListener('change', render);
    render();
  });

  /* ---------- gallery ---------- */
  document.querySelectorAll('[data-gallery]').forEach(function (g) {
    var slides = g.querySelectorAll('[data-slide]');
    var thumbs = g.querySelectorAll('[data-thumb]');
    thumbs.forEach(function (t) {
      t.addEventListener('click', function () {
        var i = t.getAttribute('data-thumb');
        slides.forEach(function (s) { s.hidden = s.getAttribute('data-slide') !== i; });
        thumbs.forEach(function (x) {
          x.classList.toggle('is-active', x === t);
          x.setAttribute('aria-pressed', x === t ? 'true' : 'false');
        });
      });
    });
  });

  /* ---------- sticky mobile buy bar ---------- */
  var sticky = document.querySelector('[data-sticky-buy]');
  var buyBox = document.querySelector('[data-buy-form]');
  if (sticky && buyBox && 'IntersectionObserver' in window) {
    var buyVisible = false;
    var update = function () {
      var past = window.scrollY > Math.min(700, window.innerHeight * 0.9);
      sticky.classList.toggle('is-visible', past && !buyVisible);
    };
    new IntersectionObserver(function (entries) {
      buyVisible = entries[0].isIntersecting;
      update();
    }, { threshold: 0.05 }).observe(buyBox);
    window.addEventListener('scroll', update, { passive: true });
    document.addEventListener('mynrg:buy-change', function (e) {
      var p = sticky.querySelector('[data-sticky-price]');
      if (p) p.textContent = e.detail.price;
    });
  }

  /* ---------- copy to clipboard (support email) ---------- */
  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    var label = btn.textContent;
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy');
      var done = function () {
        btn.textContent = 'Copied';
        setTimeout(function () { btn.textContent = label; }, 1800);
      };
      var fallback = function () {
        var target = btn.parentElement.querySelector('.email-addr');
        if (!target) return;
        var range = document.createRange();
        range.selectNodeContents(target);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        btn.textContent = 'Press Ctrl/Cmd+C';
        setTimeout(function () { btn.textContent = label; }, 2400);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, fallback);
      } else {
        fallback();
      }
    });
  });

  /* ---------- contact form: order-number hint for order topics ---------- */
  document.querySelectorAll('[data-contact-form]').forEach(function (form) {
    var hint = form.querySelector('[data-order-hint]');
    var orderTopics = (form.getAttribute('data-order-topics') || '').split('|');
    var sync = function () {
      var picked = form.querySelector('input[name="contact[Topic]"]:checked');
      if (hint) hint.hidden = !picked || orderTopics.indexOf(picked.value) === -1;
    };
    form.addEventListener('change', sync);
    sync();
  });

  /* ---------- cart quantity ---------- */
  document.querySelectorAll('[data-qty]').forEach(function (wrap) {
    var input = wrap.querySelector('input');
    wrap.querySelectorAll('button').forEach(function (b) {
      b.addEventListener('click', function () {
        var step = b.getAttribute('data-step') === '-' ? -1 : 1;
        input.value = Math.max(0, (parseInt(input.value, 10) || 0) + step);
        if (input.form) input.form.submit();
      });
    });
  });
})();

/* review carousel: tap or click toggles pause (hover and keyboard focus pause it via CSS) */
document.querySelectorAll('[data-rv]').forEach(function (el) {
  el.addEventListener('click', function () { el.classList.toggle('is-paused'); });
});
