(function () {
  /* 1. Author profile dropdown (kept for subpages using sidebar) */
  function closeAll() {
    document.querySelectorAll('.author__urls-wrapper.is-open').forEach(function (wrapper) {
      wrapper.classList.remove('is-open');
      const button = wrapper.querySelector('button');
      if (button) button.setAttribute('aria-expanded', 'false');
    });
  }

  document.querySelectorAll('.author__urls-wrapper').forEach(function (wrapper) {
    const button = wrapper.querySelector('button');
    const list = wrapper.querySelector('.author__urls');
    if (!button || !list) return;

    button.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      const expanded = wrapper.classList.toggle('is-open');
      button.setAttribute('aria-expanded', String(expanded));
    });
  });

  document.addEventListener('click', closeAll);

  /* 2. Project figure lightbox */
  const triggers = document.querySelectorAll('[data-lightbox-src]');
  let lightbox = null;
  let lastFocused = null;

  function ensureLightbox() {
    if (lightbox) return lightbox;
    const el = document.createElement('div');
    el.className = 'apple-lightbox';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-label', 'Figure preview');
    el.innerHTML =
      '<button type="button" class="apple-lightbox__close" aria-label="Close preview">&times;</button>' +
      '<div class="apple-lightbox__dialog">' +
      '  <img class="apple-lightbox__img" src="" alt="">' +
      '  <div class="apple-lightbox__caption"></div>' +
      '</div>';

    el.addEventListener('click', function (event) {
      if (event.target === el || event.target.closest('.apple-lightbox__close')) {
        closeLightbox();
      }
    });

    document.body.appendChild(el);
    lightbox = el;
    return lightbox;
  }

  function openLightbox(src, alt) {
    const el = ensureLightbox();
    const img = el.querySelector('.apple-lightbox__img');
    const caption = el.querySelector('.apple-lightbox__caption');
    lastFocused = document.activeElement;
    img.src = src;
    img.alt = alt || '';
    caption.textContent = alt || '';
    el.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    const closeBtn = el.querySelector('.apple-lightbox__close');
    if (closeBtn) closeBtn.focus();
  }

  function closeLightbox() {
    if (!lightbox || !lightbox.classList.contains('is-open')) return;
    lightbox.classList.remove('is-open');
    document.body.style.overflow = '';
    if (lastFocused && typeof lastFocused.focus === 'function') {
      lastFocused.focus();
    }
  }

  triggers.forEach(function (btn) {
    btn.addEventListener('click', function () {
      const src = btn.getAttribute('data-lightbox-src');
      const alt = btn.getAttribute('data-lightbox-alt') || '';
      if (src) openLightbox(src, alt);
    });
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      closeAll();
      closeLightbox();
    }
  });

  /* 3. Subtle scroll reveal */
  const revealNodes = document.querySelectorAll('.reveal-on-scroll');
  if (revealNodes.length > 0) {
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              observer.unobserve(entry.target);
            }
          });
        },
        { rootMargin: '0px 0px 80px 0px', threshold: 0.01 }
      );
      revealNodes.forEach(function (node) {
        observer.observe(node);
      });
    } else {
      revealNodes.forEach(function (node) {
        node.classList.add('is-visible');
      });
    }
  }

  /* 4. Active nav highlighting on scroll */
  const navLinks = Array.from(
    document.querySelectorAll('.greedy-nav .visible-links a[href*="#"]')
  );
  const trackedSections = navLinks
    .map(function (link) {
      const hash = link.getAttribute('href').split('#')[1];
      const target = hash ? document.getElementById(hash) : null;
      return target ? { link: link, target: target } : null;
    })
    .filter(Boolean);

  if (trackedSections.length > 0) {
    let ticking = false;
    function updateActiveNav() {
      const nearBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 28;
      let current = null;

      if (nearBottom) {
        current = trackedSections[trackedSections.length - 1];
      } else {
        const horizon = window.scrollY + Math.min(240, window.innerHeight * 0.28);
        trackedSections.forEach(function (item) {
          const top = item.target.getBoundingClientRect().top + window.scrollY;
          if (top <= horizon) {
            current = item;
          }
        });
      }

      navLinks.forEach(function (link) {
        link.classList.toggle('is-active', current !== null && current.link === link);
      });
      ticking = false;
    }

    function scheduleNavUpdate() {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(updateActiveNav);
      }
    }

    window.addEventListener('scroll', scheduleNavUpdate, { passive: true });
    window.addEventListener('resize', scheduleNavUpdate, { passive: true });
    window.addEventListener('hashchange', scheduleNavUpdate);
    updateActiveNav();
  }
})();
