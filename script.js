const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Ki energy field — Vegeta-inspired continuous ambient animation
  const kiField = document.getElementById('kiField');
  if(kiField && !prefersReduced){
    const sparkCount = window.innerWidth < 640 ? 10 : 18;
    for(let i = 0; i < sparkCount; i++){
      const spark = document.createElement('div');
      spark.className = 'ki-spark';
      const size = 4 + Math.random() * 6;
      const left = Math.random() * 100;
      const duration = 5 + Math.random() * 6;
      const delay = Math.random() * -12;
      spark.style.width = size + 'px';
      spark.style.height = size + 'px';
      spark.style.left = left + 'vw';
      spark.style.animationDuration = duration + 's';
      spark.style.animationDelay = delay + 's';
      kiField.appendChild(spark);
    }

    const beamCount = window.innerWidth < 640 ? 2 : 4;
    for(let i = 0; i < beamCount; i++){
      const beam = document.createElement('div');
      beam.className = 'ki-beam';
      const top = 10 + Math.random() * 80;
      const duration = 6 + Math.random() * 5;
      const delay = Math.random() * -10;
      const angle = -22 + Math.random() * 16;
      beam.style.top = top + 'vh';
      beam.style.animationDuration = duration + 's';
      beam.style.animationDelay = delay + 's';
      beam.style.setProperty('--rot', angle + 'deg');
      kiField.appendChild(beam);
    }
  }

  // Mobile nav toggle
  const navToggle = document.getElementById('navToggle');
  const navlinks = document.getElementById('navlinks');
  if(navToggle && navlinks){
    navToggle.addEventListener('click', () => {
      const isOpen = navlinks.classList.toggle('open');
      navToggle.classList.toggle('open', isOpen);
      navToggle.setAttribute('aria-expanded', isOpen);
    });
    navlinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      navlinks.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }));
  }

  // Count-up animated stats — replays every time it re-enters view
  const statNums = document.querySelectorAll('.stat-num');
  const countIo = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const el = entry.target;
      if(!entry.isIntersecting){
        el.dataset.running = '0';
        return;
      }
      if(el.dataset.running === '1') return;
      el.dataset.running = '1';
      const target = parseFloat(el.dataset.target);
      const suffix = el.dataset.suffix || '';
      const isDecimal = el.dataset.target.includes('.');
      if(prefersReduced){
        el.textContent = target + suffix;
        return;
      }
      const duration = 1400;
      const start = performance.now();
      function tick(now){
        if(el.dataset.running !== '1') return;
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

  // Scroll reveal — replays every time an element re-enters the viewport
  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      e.target.classList.toggle('in', e.isIntersecting);
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
      '.skill-card, .proj-card, .tl-card, .stat-card, .cert-item, .edu-card, .lang-card'
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

  // ---------- Loading screen — Scouter power-level entrance ----------
  (function initLoadScreen(){
    const screen = document.getElementById('loadScreen');
    const numEl = document.getElementById('loadPowerNum');
    const barFill = document.getElementById('loadBarFill');
    if(!screen) return;

    if(prefersReduced){
      screen.classList.add('hide');
      setTimeout(() => screen.remove(), 550);
      return;
    }

    const target = 8000 + Math.floor(Math.random() * 900);
    const duration = 1300;
    const start = performance.now();

    const safetyTimeout = setTimeout(() => {
      screen.classList.add('hide');
      setTimeout(() => screen.remove(), 550);
    }, 3000);

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
        setTimeout(() => {
          screen.classList.add('hide');
          setTimeout(() => screen.remove(), 550);
        }, 500);
      }
    }
    requestAnimationFrame(tick);
  })();

  // ---------- Theme toggle — grayscale light/dark with a flash-cut transition ----------
  (function initThemeToggle(){
    const btn = document.getElementById('themeToggle');
    if(!btn) return;
    function syncThemeState(){
      btn.setAttribute('aria-pressed', document.documentElement.classList.contains('light-mode') ? 'true' : 'false');
    }
    syncThemeState();
    btn.addEventListener('click', () => {
      if(prefersReduced){
        document.documentElement.classList.toggle('light-mode');
        try{ localStorage.setItem('theme', document.documentElement.classList.contains('light-mode') ? 'light' : 'dark'); }catch(e){}
        syncThemeState();
        return;
      }
      const flash = document.createElement('div');
      flash.style.cssText = 'position:fixed;inset:0;background:#fff;z-index:99998;pointer-events:none;opacity:0;transition:opacity .15s ease;';
      document.body.appendChild(flash);
      requestAnimationFrame(() => { flash.style.opacity = '1'; });
      setTimeout(() => {
        document.documentElement.classList.toggle('light-mode');
        try{ localStorage.setItem('theme', document.documentElement.classList.contains('light-mode') ? 'light' : 'dark'); }catch(e){}
        syncThemeState();
      }, 150);
      setTimeout(() => { flash.style.opacity = '0'; }, 180);
      setTimeout(() => { flash.remove(); }, 400);
    });
  })();

  // ---------- Kamehameha scroll wave — fires on in-page nav clicks ----------
  (function initKameScroll(){
    const wave = document.getElementById('kameWave');
    const navEl = document.querySelector('nav');
    if(!wave) return;

    function smoothScrollWithWave(targetEl){
      const offset = (navEl ? navEl.offsetHeight : 64) + 12;
      const startY = window.scrollY;
      const targetY = targetEl.getBoundingClientRect().top + window.scrollY - offset;
      const distance = targetY - startY;

      if(prefersReduced){
        window.scrollTo({ top: targetY, behavior: 'auto' });
        return;
      }

      const duration = Math.min(1200, Math.max(450, Math.abs(distance) * 0.55));
      const start = performance.now();
      wave.classList.add('active');

      function tick(now){
        const t = Math.min((now - start) / duration, 1);
        const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        window.scrollTo({ top: startY + distance * eased, left: 0, behavior: 'auto' });
        const travel = (navEl ? navEl.offsetHeight : 64) + (window.innerHeight - (navEl ? navEl.offsetHeight : 64)) * t;
        wave.style.top = travel + 'px';
        wave.style.opacity = t < 0.08 ? (t / 0.08) : (t > 0.85 ? (1 - t) / 0.15 : 1);
        if(t < 1){
          requestAnimationFrame(tick);
        }else{
          wave.classList.remove('active');
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
        smoothScrollWithWave(target);
      });
    });
  })();
