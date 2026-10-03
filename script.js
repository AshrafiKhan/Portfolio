const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Pause all CSS animations while the tab is hidden
  document.addEventListener('visibilitychange', () => {
    document.documentElement.classList.toggle('paused', document.hidden);
  });

  // Mobile nav toggle
  const navToggle = document.getElementById('navToggle');
  const navlinks = document.getElementById('navlinks');
  if(navToggle && navlinks){
    function setNavOpen(isOpen){
      navlinks.classList.toggle('open', isOpen);
      navToggle.classList.toggle('open', isOpen);
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    }
    navToggle.addEventListener('click', () => {
      setNavOpen(!navlinks.classList.contains('open'));
    });
    navlinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setNavOpen(false)));
    document.addEventListener('keydown', (e) => {
      if(e.key === 'Escape' && navlinks.classList.contains('open')){
        setNavOpen(false);
        navToggle.focus();
      }
    });
  }

  // Count-up animated stats — runs once when first in view; the HTML already holds the final values
  const statNums = document.querySelectorAll('.stat-num');
  if(!prefersReduced){
    const countIo = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if(!entry.isIntersecting) return;
        const el = entry.target;
        observer.unobserve(el);
        const target = parseFloat(el.dataset.target);
        const suffix = el.dataset.suffix || '';
        const isDecimal = el.dataset.target.includes('.');
        const duration = 1400;
        const start = performance.now();
        function tick(now){
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const value = target * eased;
          el.textContent = (isDecimal ? value.toFixed(1) : Math.round(value)) + suffix;
          if(progress < 1) requestAnimationFrame(tick);
        }
        el.textContent = (isDecimal ? '0.0' : '0') + suffix;
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.4 });
    statNums.forEach(el => countIo.observe(el));
  }

  // Scroll reveal — each element animates in once
  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries, observer) => {
    entries.forEach(e => {
      if(!e.isIntersecting) return;
      e.target.classList.add('in');
      observer.unobserve(e.target);
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => io.observe(el));

  // 3D tilt on hero card
  const card = document.getElementById('tiltCard');
  const stage = document.querySelector('.stage');

  if(stage && card && !prefersReduced && window.innerWidth > 860){
    stage.addEventListener('mousemove', (e) => {
      const rect = stage.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `rotateX(${8 - y * 16}deg) rotateY(${-14 + x * 20}deg)`;
    });
    stage.addEventListener('mouseleave', () => {
      card.style.transform = 'rotateX(8deg) rotateY(-14deg)';
    });
  }

  // 3D tilt on every card — subtle, mouse-tracked glass response
  if(!prefersReduced && window.matchMedia('(hover: hover)').matches){
    const tiltEls = document.querySelectorAll(
      '.skill-card, .svc-card, .proof-card, .tl-card, .stat-card, .cert-item, .edu-card, .lang-card'
    );
    tiltEls.forEach(el => {
      el.style.transformStyle = 'preserve-3d';
      el.style.willChange = 'transform';
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `translateY(-6px) rotateX(${(-y * 8).toFixed(2)}deg) rotateY(${(x * 8).toFixed(2)}deg)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  // ---------- Loading screen — Scouter power-level entrance (first visit per session only) ----------
  (function initLoadScreen(){
    const screen = document.getElementById('loadScreen');
    const numEl = document.getElementById('loadPowerNum');
    const barFill = document.getElementById('loadBarFill');
    if(!screen) return;

    try{ sessionStorage.setItem('introSeen', '1'); }catch(e){}

    function hideScreen(){
      screen.classList.add('hide');
      setTimeout(() => screen.remove(), 550);
    }

    if(prefersReduced || document.documentElement.classList.contains('no-intro')){
      screen.remove();
      return;
    }

    const target = 8000 + Math.floor(Math.random() * 900);
    const duration = 900;
    const start = performance.now();

    const safetyTimeout = setTimeout(hideScreen, 2500);

    function tick(now){
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 2);
      const value = Math.round(target * eased);
      numEl.textContent = value.toLocaleString();
      barFill.style.width = (eased * 100) + '%';
      if(t < 1){
        requestAnimationFrame(tick);
      }else{
        numEl.textContent = "IT'S OVER INFINITY!";
        numEl.parentElement.classList.add('over');
        clearTimeout(safetyTimeout);
        setTimeout(hideScreen, 400);
      }
    }
    requestAnimationFrame(tick);
  })();

  // ---------- Theme toggle — grayscale light/dark with a flash-cut transition ----------
  (function initThemeToggle(){
    const btn = document.getElementById('themeToggle');
    if(!btn) return;
    const root = document.documentElement;
    function syncThemeState(){
      btn.setAttribute('aria-pressed', root.classList.contains('light-mode') ? 'true' : 'false');
    }
    function hasSavedTheme(){
      try{ return !!localStorage.getItem('theme'); }catch(e){ return false; }
    }
    function toggleAndSave(){
      root.classList.toggle('light-mode');
      try{ localStorage.setItem('theme', root.classList.contains('light-mode') ? 'light' : 'dark'); }catch(e){}
      syncThemeState();
    }
    syncThemeState();

    // Follow the OS theme until the visitor picks one explicitly
    const lightQuery = window.matchMedia('(prefers-color-scheme: light)');
    const onSystemChange = (e) => {
      if(hasSavedTheme()) return;
      root.classList.toggle('light-mode', e.matches);
      syncThemeState();
    };
    if(lightQuery.addEventListener) lightQuery.addEventListener('change', onSystemChange);
    else if(lightQuery.addListener) lightQuery.addListener(onSystemChange);

    btn.addEventListener('click', () => {
      if(prefersReduced){
        toggleAndSave();
        return;
      }
      const flash = document.createElement('div');
      flash.style.cssText = 'position:fixed;inset:0;background:#fff;z-index:99998;pointer-events:none;opacity:0;transition:opacity .15s ease;';
      document.body.appendChild(flash);
      requestAnimationFrame(() => { flash.style.opacity = '1'; });
      setTimeout(toggleAndSave, 150);
      setTimeout(() => { flash.style.opacity = '0'; }, 180);
      setTimeout(() => { flash.remove(); }, 400);
    });
  })();

  // ---------- Screenshot lightbox for the responsive device galleries ----------
  // Without JS (or <dialog> support) the device links simply open the full image.
  (function initLightbox(){
    const dlg = document.getElementById('lightbox');
    if(!dlg || typeof dlg.showModal !== 'function') return;
    const img = dlg.querySelector('img');
    const cap = dlg.querySelector('figcaption');
    let items = [], idx = 0, trigger = null;

    function show(i){
      idx = (i + items.length) % items.length;
      const link = items[idx];
      img.src = link.getAttribute('href');
      img.alt = link.querySelector('img').alt;
      cap.textContent = link.dataset.caption || '';
    }

    document.querySelectorAll('.device-gallery').forEach(gallery => {
      const links = [...gallery.querySelectorAll('.device')];
      links.forEach((link, i) => link.addEventListener('click', (e) => {
        e.preventDefault();
        items = links; trigger = link;
        show(i);
        dlg.showModal();
      }));
    });

    dlg.querySelector('.lb-close').addEventListener('click', () => dlg.close());
    dlg.querySelector('.lb-prev').addEventListener('click', () => show(idx - 1));
    dlg.querySelector('.lb-next').addEventListener('click', () => show(idx + 1));
    // Click on the dimmed area (outside the image and buttons) closes
    dlg.addEventListener('click', (e) => {
      if(e.target === dlg || e.target.classList.contains('lb-figure')) dlg.close();
    });
    dlg.addEventListener('keydown', (e) => {
      if(e.key === 'ArrowLeft'){ e.preventDefault(); show(idx - 1); }
      else if(e.key === 'ArrowRight'){ e.preventDefault(); show(idx + 1); }
    });
    dlg.addEventListener('close', () => {
      img.removeAttribute('src');
      if(trigger) trigger.focus({ preventScroll: true });
    });
  })();

  // ---------- Kamehameha scroll wave — fires on in-page nav clicks ----------
  (function initKameScroll(){
    const wave = document.getElementById('kameWave');
    const navEl = document.querySelector('nav');
    if(!wave) return;

    // Move keyboard / screen-reader focus to the section that was scrolled to
    function focusTarget(targetEl){
      if(!targetEl.hasAttribute('tabindex')) targetEl.setAttribute('tabindex', '-1');
      targetEl.focus({ preventScroll: true });
    }

    function smoothScrollWithWave(targetEl){
      const offset = (navEl ? navEl.offsetHeight : 64) + 12;
      const startY = window.scrollY;
      const targetY = targetEl.getBoundingClientRect().top + window.scrollY - offset;
      const distance = targetY - startY;

      if(prefersReduced){
        window.scrollTo({ top: targetY, behavior: 'instant' });
        focusTarget(targetEl);
        return;
      }

      const duration = Math.min(1200, Math.max(450, Math.abs(distance) * 0.55));
      const start = performance.now();
      wave.classList.add('active');

      function tick(now){
        const t = Math.min((now - start) / duration, 1);
        const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        // 'instant' — 'auto' would defer to the CSS scroll-behavior: smooth and fight this animation
        window.scrollTo({ top: startY + distance * eased, left: 0, behavior: 'instant' });
        const travel = (navEl ? navEl.offsetHeight : 64) + (window.innerHeight - (navEl ? navEl.offsetHeight : 64)) * t;
        wave.style.top = travel + 'px';
        wave.style.opacity = t < 0.08 ? (t / 0.08) : (t > 0.85 ? (1 - t) / 0.15 : 1);
        if(t < 1){
          requestAnimationFrame(tick);
        }else{
          wave.classList.remove('active');
          focusTarget(targetEl);
        }
      }
      requestAnimationFrame(tick);
    }

    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href');
        if(!id || id.length < 2) return;
        const target = document.querySelector(id);
        if(!target) return;
        e.preventDefault();
        if(location.hash !== id) history.pushState(null, '', id);
        smoothScrollWithWave(target);
      });
    });
  })();
