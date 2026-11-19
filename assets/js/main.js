/* VVC Realinfra — site behaviour: nav, scroll reveal, counters, filters,
   project photo slideshow, enquiry form */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- mobile navigation ---------- */
  var toggle = document.querySelector('.nav__toggle');
  var links = document.getElementById('primary-nav');
  var backdrop = document.querySelector('.nav-backdrop');

  function setNav(open) {
    if (!toggle || !links) return;
    toggle.setAttribute('aria-expanded', String(open));
    links.classList.toggle('is-open', open);
    if (backdrop) backdrop.classList.toggle('is-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      setNav(toggle.getAttribute('aria-expanded') !== 'true');
    });
  }
  if (backdrop) backdrop.addEventListener('click', function () { setNav(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setNav(false);
  });
  if (links) {
    links.addEventListener('click', function (e) {
      if (e.target.closest('a')) setNav(false);
    });
  }

  /* ---------- sticky header shadow ---------- */
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-stuck', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- scroll reveal ---------- */
  var revealables = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || reduceMotion) {
    Array.prototype.forEach.call(revealables, function (el) { el.classList.add('is-visible'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px' });
    Array.prototype.forEach.call(revealables, function (el) { revealObserver.observe(el); });
  }

  /* ---------- animated counters ---------- */
  function countUp(el) {
    var target = parseFloat(el.dataset.count);
    var decimals = (el.dataset.count.split('.')[1] || '').length;
    if (isNaN(target)) return;
    if (reduceMotion) { el.textContent = target.toFixed(decimals); return; }
    var duration = 1400;
    var start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(decimals);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    if (!('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(counters, countUp);
    } else {
      var countObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          countUp(entry.target);
          countObserver.unobserve(entry.target);
        });
      }, { threshold: 0.6 });
      Array.prototype.forEach.call(counters, function (el) { countObserver.observe(el); });
    }
  }

  /* ---------- project photo slideshow ----------------------------------
     Each banner marked [data-slideshow] holds a stack of photographs. The
     stack advances while the pointer rests on the card, or while the banner
     has keyboard focus. Devices without hover cycle whenever the card is on
     screen, so the extra photographs are not stranded behind a hover.
     --------------------------------------------------------------------- */
  var SLIDE_MS = 1500;
  var banners = document.querySelectorAll('[data-slideshow]');

  Array.prototype.forEach.call(banners, function (banner) {
    var slides = banner.querySelectorAll('.project__slide');
    if (slides.length < 2) return;

    var card = banner.closest('.project') || banner;
    var index = 0;
    var timer = null;

    // Build the progress dots from the real number of photographs.
    var dots = document.createElement('div');
    dots.className = 'project__dots';
    dots.setAttribute('aria-hidden', 'true');
    for (var i = 0; i < slides.length; i++) {
      var d = document.createElement('span');
      if (i === 0) d.className = 'is-active';
      dots.appendChild(d);
    }
    banner.appendChild(dots);

    var count = document.createElement('span');
    count.className = 'project__count';
    count.setAttribute('aria-hidden', 'true');
    count.textContent = slides.length + ' Photos';
    banner.appendChild(count);

    // Focusable so keyboard users get the same sequence as a hover.
    banner.setAttribute('tabindex', '0');
    banner.setAttribute('role', 'group');
    banner.setAttribute('aria-label', 'Project photographs, ' + slides.length + ' images');

    function show(next) {
      slides[index].classList.remove('is-active');
      dots.children[index].classList.remove('is-active');
      index = next;
      slides[index].classList.add('is-active');
      dots.children[index].classList.add('is-active');
    }

    function start() {
      if (timer || reduceMotion) return;
      timer = setInterval(function () {
        show((index + 1) % slides.length);
      }, SLIDE_MS);
    }

    function stop(reset) {
      if (timer) { clearInterval(timer); timer = null; }
      if (reset && index !== 0) show(0);
    }

    card.addEventListener('mouseenter', start);
    card.addEventListener('mouseleave', function () { stop(true); });
    banner.addEventListener('focus', start);
    banner.addEventListener('blur', function () { stop(true); });

    // Touch and other hover-less devices: run while the card is in view.
    if (window.matchMedia('(hover: none)').matches && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) start(); else stop(false);
        });
      }, { threshold: 0.5 }).observe(card);
    }
  });

  /* ---------- project filters ---------- */
  var filterBar = document.querySelector('[data-filter-bar]');
  if (filterBar) {
    var items = document.querySelectorAll('[data-category]');
    var empty = document.querySelector('[data-filter-empty]');
    filterBar.addEventListener('click', function (e) {
      var btn = e.target.closest('.filter');
      if (!btn) return;
      var value = btn.dataset.filter;
      filterBar.querySelectorAll('.filter').forEach(function (b) {
        b.classList.toggle('is-active', b === btn);
        b.setAttribute('aria-pressed', String(b === btn));
      });
      var shown = 0;
      Array.prototype.forEach.call(items, function (item) {
        var match = value === 'all' || item.dataset.category === value;
        item.hidden = !match;
        if (match) shown++;
      });
      if (empty) empty.hidden = shown !== 0;
    });
  }

  /* ---------- contact form (no backend: opens the visitor's mail client) ---------- */
  var form = document.querySelector('[data-mailto-form]');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = new FormData(form);
      var subject = 'Website enquiry — ' + (data.get('subject') || 'General');
      var body = [
        'Name: ' + (data.get('name') || ''),
        'Organisation: ' + (data.get('organisation') || ''),
        'Email: ' + (data.get('email') || ''),
        'Phone: ' + (data.get('phone') || ''),
        'Enquiry type: ' + (data.get('subject') || ''),
        '',
        (data.get('message') || '')
      ].join('\n');
      var status = form.querySelector('[data-form-status]');
      if (status) {
        status.textContent = 'Opening your email app with the details filled in… if nothing happens, write to ' + form.dataset.mailtoForm + ' directly.';
      }
      window.location.href = 'mailto:' + form.dataset.mailtoForm +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(body);
    });
  }

  /* ---------- current year in footer ---------- */
  var year = document.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear();
})();
