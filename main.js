/* ==========================================================================
   HRLeadFlow — Site interactions
   ========================================================================== */
(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Sticky / blurred nav on scroll ---------------------------------- */
  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = () => {
      header.classList.toggle('scrolled', window.scrollY > 12);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---- Mobile menu ------------------------------------------------------ */
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (hamburger && mobileMenu) {
    const closeMenu = () => {
      hamburger.setAttribute('aria-expanded', 'false');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    };
    const openMenu = () => {
      hamburger.setAttribute('aria-expanded', 'true');
      mobileMenu.classList.add('open');
      document.body.style.overflow = 'hidden';
    };
    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.getAttribute('aria-expanded') === 'true';
      isOpen ? closeMenu() : openMenu();
    });
    mobileMenu.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMenu));
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
  }

  /* ---- Scroll reveal ------------------------------------------------------ */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.16, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach((el, i) => {
      el.style.setProperty('--i', i % 6);
      io.observe(el);
    });
  } else {
    revealEls.forEach((el) => el.classList.add('in-view'));
  }

  /* ---- How-it-works progress line ---------------------------------------- */
  const processPath = document.querySelector('.process-path');
  if (processPath) {
    const fill = processPath.querySelector('.process-line-fill');
    const steps = processPath.querySelectorAll('.process-step');
    const io2 = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (fill) fill.style.width = '100%';
          steps.forEach((s, i) => setTimeout(() => s.classList.add('active'), i * 160));
          io2.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    io2.observe(processPath);
  }

  /* ---- 3D card tilt (services + spotlight illustration cards) ------------ */
  if (!reduceMotion && window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.service-card, .tilt-card').forEach((card) => {
      const target = card.classList.contains('tilt-card') ? card.querySelector('.scene') : card;
      const maxTilt = card.classList.contains('tilt-card') ? 8 : 5;

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        const rotY = px * maxTilt * 2;
        const rotX = -py * maxTilt * 2;
        target.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(0)`;
      });
      card.addEventListener('mouseleave', () => {
        target.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)';
      });
    });
  }

  /* ---- Enquiry form ------------------------------------------------------ */
  const form = document.querySelector('.enquiry-form');
  if (form) {
    const status = form.querySelector('.form-status');
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const required = form.querySelectorAll('[required]');
      let valid = true;
      required.forEach((field) => {
        field.setAttribute('data-touched', 'true');
        if (!field.checkValidity()) valid = false;
      });

      if (!valid) {
        if (status) {
          status.textContent = 'Please fill in all required fields with valid details.';
          status.setAttribute('data-state', 'error');
        }
        return;
      }

      // NOTE: This form currently submits nowhere — it's a static front end.
      // Wire it up to a real endpoint (Formspree, a serverless function,
      // your CRM's inbound webhook, etc.) by POSTing the FormData below.
      //
      // const data = new FormData(form);
      // fetch('https://your-endpoint.example.com/enquiries', { method: 'POST', body: data });

      if (status) {
        status.textContent = '';
        status.removeAttribute('data-state');
      }
      form.setAttribute('data-submitted', 'true');
      form.querySelector('.success-panel')?.focus();
    });
  }

  /* ---- Footer year -------------------------------------------------------- */
  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
})();
