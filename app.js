/* ════════════════════════════════════════
   PORTFOLIO JAVASCRIPT — Prakul Agarwal
════════════════════════════════════════ */

/* ─── PARTICLE BACKGROUND & ASTEROIDS GAME ─── */
(function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  const ctx = canvas.getContext('2d');
  let W, H, particles, animId;

  // Game state
  let gameState = 'inactive'; // 'inactive', 'playing', 'gameover'
  let score = 0;
  let lives = 3;
  const keys = {};

  const ship = { x: 0, y: 0, vx: 0, vy: 0, angle: -Math.PI / 2, radius: 12, lasers: [] };

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function createParticles(n) {
    return Array.from({ length: n }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.5 + 0.3,
      dx: (Math.random() - 0.5) * 0.35,
      dy: (Math.random() - 0.5) * 0.35,
      alpha: Math.random() * 0.5 + 0.1,
      color: Math.random() > 0.5 ? '124,58,237' : '6,182,212',
      isBig: false
    }));
  }

  function spawnAsteroids(n) {
    for (let i = 0; i < n; i++) {
      particles.push({
        x: Math.random() > 0.5 ? 0 : W,
        y: Math.random() * H,
        r: Math.random() * 15 + 10,
        dx: (Math.random() - 0.5) * 3.5,
        dy: (Math.random() - 0.5) * 3.5,
        alpha: 0.9,
        color: Math.random() > 0.5 ? '124,58,237' : '6,182,212',
        isBig: true
      });
    }
  }

  window.addEventListener('keydown', e => {
    if (gameState === 'playing' && ['ArrowUp', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
      e.preventDefault();
    }
    keys[e.key] = true;

    if (gameState === 'playing' && e.key === ' ' && !e.repeat) {
      ship.lasers.push({
        x: ship.x + Math.cos(ship.angle) * ship.radius,
        y: ship.y + Math.sin(ship.angle) * ship.radius,
        vx: Math.cos(ship.angle) * 12 + ship.vx,
        vy: Math.sin(ship.angle) * 12 + ship.vy,
        life: 50
      });
    }
  });

  window.addEventListener('keyup', e => { keys[e.key] = false; });

  function connectParticles() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        if (particles[i].isBig || particles[j].isBig) continue;
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(124,58,237,${0.08 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  function updateGame() {
    if (gameState !== 'playing') return;

    if (keys['ArrowLeft']) ship.angle -= 0.1;
    if (keys['ArrowRight']) ship.angle += 0.1;
    if (keys['ArrowUp']) {
      ship.vx += Math.cos(ship.angle) * 0.25;
      ship.vy += Math.sin(ship.angle) * 0.25;
    }

    ship.vx *= 0.98;
    ship.vy *= 0.98;

    ship.x += ship.vx;
    ship.y += ship.vy;

    if (ship.x < 0) ship.x = W;
    if (ship.x > W) ship.x = 0;
    if (ship.y < 0) ship.y = H;
    if (ship.y > H) ship.y = 0;

    for (let i = ship.lasers.length - 1; i >= 0; i--) {
      let l = ship.lasers[i];
      l.x += l.vx;
      l.y += l.vy;
      l.life--;
      if (l.life <= 0 || l.x < 0 || l.x > W || l.y < 0 || l.y > H) {
        ship.lasers.splice(i, 1);
        continue;
      }

      for (let j = particles.length - 1; j >= 0; j--) {
        let p = particles[j];
        if (!p.isBig) continue;
        const dx = l.x - p.x;
        const dy = l.y - p.y;
        if (Math.sqrt(dx * dx + dy * dy) < p.r) {
          particles.splice(j, 1);
          ship.lasers.splice(i, 1);
          score += 100;

          if (particles.filter(x => x.isBig).length < 5) spawnAsteroids(2);
          break;
        }
      }
    }

    for (let j = particles.length - 1; j >= 0; j--) {
      let p = particles[j];
      if (!p.isBig) continue;
      const dx = ship.x - p.x;
      const dy = ship.y - p.y;
      if (Math.sqrt(dx * dx + dy * dy) < p.r + ship.radius - 2) {
        lives--;
        ship.x = W / 2; ship.y = H / 2;
        ship.vx = 0; ship.vy = 0;
        particles.splice(j, 1);
        if (lives <= 0) {
          gameState = 'gameover';
          setTimeout(() => {
            document.body.classList.remove('game-mode');
            gameState = 'inactive';
            init();
          }, 3500);
        }
        break;
      }
    }
  }

  function drawGameUI() {
    if (gameState === 'playing') {
      ctx.fillStyle = '#fff';
      ctx.font = '24px "Fira Code", monospace';
      ctx.fillText(`SCORE: ${score}`, 30, 50);
      ctx.fillText(`LIVES: ${'❤️'.repeat(lives)}`, 30, 80);

      ctx.save();
      ctx.translate(ship.x, ship.y);
      ctx.rotate(ship.angle);
      ctx.beginPath();
      ctx.moveTo(ship.radius, 0);
      ctx.lineTo(-ship.radius, ship.radius * 0.7);
      ctx.lineTo(-ship.radius * 0.5, 0);
      ctx.lineTo(-ship.radius, -ship.radius * 0.7);
      ctx.closePath();
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2;
      ctx.stroke();
      if (keys['ArrowUp']) {
        ctx.beginPath();
        ctx.moveTo(-ship.radius * 0.5, 0);
        ctx.lineTo(-ship.radius * 1.8, (Math.random() - 0.5) * 5);
        ctx.strokeStyle = '#f87171';
        ctx.stroke();
      }
      ctx.restore();

      ctx.fillStyle = '#4ade80';
      for (const l of ship.lasers) {
        ctx.beginPath();
        ctx.arc(l.x, l.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#4ade80';
      }
      ctx.shadowBlur = 0;
    } else if (gameState === 'gameover') {
      ctx.fillStyle = '#f87171';
      ctx.font = 'bold 50px "Inter", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`GAME OVER`, W / 2, H / 2 - 20);
      ctx.fillStyle = '#fff';
      ctx.font = '24px "Fira Code", monospace';
      ctx.fillText(`FINAL SCORE: ${score}`, W / 2, H / 2 + 30);
      ctx.textAlign = 'left';
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    updateGame();

    for (const p of particles) {
      p.x += p.dx;
      p.y += p.dy;
      if (p.isBig) {
        if (p.x < -p.r) p.x = W + p.r;
        if (p.x > W + p.r) p.x = -p.r;
        if (p.y < -p.r) p.y = H + p.r;
        if (p.y > H + p.r) p.y = -p.r;
      } else {
        if (p.x < 0 || p.x > W) p.dx *= -1;
        if (p.y < 0 || p.y > H) p.dy *= -1;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      if (p.isBig) {
        ctx.strokeStyle = `rgba(${p.color},${p.alpha})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      } else {
        ctx.fillStyle = `rgba(${p.color},${p.alpha})`;
        ctx.fill();
      }
    }

    if (gameState === 'inactive') connectParticles();
    drawGameUI();

    animId = requestAnimationFrame(draw);
  }

  function init() {
    resize();
    particles = createParticles(80);
    if (animId) cancelAnimationFrame(animId);
    draw();
  }

  window.addEventListener('resize', () => {
    if (gameState !== 'playing') { resize(); particles = createParticles(80); }
  });

  init();

  window.startAsteroidsGame = () => {
    document.body.classList.add('game-mode');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    gameState = 'playing';
    score = 0;
    lives = 3;
    ship.x = W / 2;
    ship.y = H / 2;
    ship.vx = 0;
    ship.vy = 0;
    ship.angle = -Math.PI / 2;
    ship.lasers = [];
    particles = createParticles(50);
    spawnAsteroids(8);
  };
})();

/* ─── CURSOR GLOW ─── */
(function initCursorGlow() {
  const glow = document.getElementById('cursor-glow');
  let mx = 0, my = 0, cx = 0, cy = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
  });

  function update() {
    cx += (mx - cx) * 0.08;
    cy += (my - cy) * 0.08;
    glow.style.left = cx + 'px';
    glow.style.top = cy + 'px';
    requestAnimationFrame(update);
  }

  update();
})();

/* ─── NAVBAR SCROLL ─── */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
})();

/* ─── MOBILE MENU ─── */
(function initMobileMenu() {
  const btn = document.getElementById('nav-hamburger');
  const menu = document.getElementById('mobile-menu');
  const links = menu.querySelectorAll('.mobile-link');
  const spans = btn.querySelectorAll('span');
  let open = false;

  function toggle() {
    open = !open;
    menu.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';

    // Animate hamburger → X
    if (open) {
      spans[0].style.transform = 'rotate(45deg) translate(5px,5px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px,-5px)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    }
  }

  btn.addEventListener('click', toggle);
  links.forEach(l => l.addEventListener('click', () => open && toggle()));
})();

/* ─── SCROLL REVEAL ─── */
(function initReveal() {
  const els = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -48px 0px' });

  els.forEach(el => io.observe(el));
})();

/* ─── TYPED TEXT ANIMATION ─── */
(function initTyped() {
  const el = document.getElementById('typed-text');
  const phrases = [
    'scalable apps',
    'beautiful UIs',
    'robust backends',
    'AI-powered tools',
    'clean solutions',
  ];
  let pIdx = 0, cIdx = 0, deleting = false;
  const SPEED_TYPE = 70, SPEED_DEL = 40, PAUSE = 2000;

  function tick() {
    const phrase = phrases[pIdx];
    el.textContent = deleting
      ? phrase.slice(0, cIdx--)
      : phrase.slice(0, cIdx++);

    let delay = deleting ? SPEED_DEL : SPEED_TYPE;

    if (!deleting && cIdx === phrase.length + 1) {
      delay = PAUSE;
      deleting = true;
    } else if (deleting && cIdx === 0) {
      deleting = false;
      pIdx = (pIdx + 1) % phrases.length;
      delay = 400;
    }

    setTimeout(tick, delay);
  }

  setTimeout(tick, 800);
})();

/* ─── SKILLS TABS ─── */
(function initSkillsTabs() {
  const tabs = document.querySelectorAll('.skill-tab');
  const panels = document.querySelectorAll('.skills-panel');

  function activateTab(id) {
    tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === id));
    panels.forEach(p => {
      const isActive = p.id === `tab-${id}`;
      p.classList.toggle('active', isActive);
      if (isActive) {
        // Re-trigger skill bar animations
        p.querySelectorAll('.skill-fill').forEach(bar => {
          const pct = bar.style.getPropertyValue('--pct');
          bar.style.width = '0';
          requestAnimationFrame(() => {
            requestAnimationFrame(() => { bar.style.width = pct; });
          });
        });
        // Re-trigger reveal
        p.querySelectorAll('.reveal').forEach(el => {
          el.classList.remove('visible');
          requestAnimationFrame(() => {
            requestAnimationFrame(() => el.classList.add('visible'));
          });
        });
      }
    });
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => activateTab(tab.dataset.tab));
  });

  // Animate initial tab skill bars when visible
  const section = document.getElementById('skills');
  const io = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      document.querySelectorAll('.skills-panel.active .skill-fill').forEach(bar => {
        bar.style.width = bar.style.getPropertyValue('--pct');
      });
      io.disconnect();
    }
  }, { threshold: 0.3 });
  io.observe(section);
})();

/* ─── COUNTER ANIMATION ─── */
(function initCounters() {
  const nums = document.querySelectorAll('.stat-num');
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = parseInt(el.dataset.target, 10);
      const dur = 1400;
      const start = performance.now();

      function step(now) {
        const t = Math.min((now - start) / dur, 1);
        const ease = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.round(ease * target);
        if (t < 1) requestAnimationFrame(step);
      }

      requestAnimationFrame(step);
      io.unobserve(el);
    });
  }, { threshold: 0.5 });

  nums.forEach(n => io.observe(n));
})();

/* ─── 3D CARD TILT (Hero Code Window) ─── */
(function initTilt() {
  const card = document.querySelector('.hero-card');
  if (!card) return;

  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const rx = ((e.clientY - cy) / (rect.height / 2)) * -10;
    const ry = ((e.clientX - cx) / (rect.width / 2)) * 10;
    card.querySelector('.hero-card-inner').style.transform
      = `rotateX(${rx}deg) rotateY(${ry}deg)`;
  });

  card.addEventListener('mouseleave', () => {
    card.querySelector('.hero-card-inner').style.transform = '';
  });
})();

/* ─── ACTIVE NAV LINK ON SCROLL ─── */
(function initActiveNavLink() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        navLinks.forEach(l => {
          l.classList.toggle('active-link', l.getAttribute('href') === `#${e.target.id}`);
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => io.observe(s));
})();

/* ─── CONTACT FORM ─── */
(function initContactForm() {
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  const btn = document.getElementById('contact-submit');

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));

    // Basic validation
    if (!data.name || !data.email || !data.message) {
      status.textContent = '⚠️ Please fill in all required fields.';
      status.className = 'form-note error';
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      status.textContent = '⚠️ Please enter a valid email address.';
      status.className = 'form-note error';
      return;
    }

    // Send directly to email using Web3Forms
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending…';

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          access_key: '81abdbc3-c139-4dd9-a87e-d9aecfb72330',
          name: data.name,
          email: data.email,
          subject: data.subject || 'Portfolio Contact Form Submission',
          message: data.message
        })
      });

      const result = await response.json();

      if (response.status === 200) {
        status.textContent = '✅ Message sent successfully! I\'ll get back to you soon.';
        status.className = 'form-note success';
        btn.innerHTML = '<i class="fas fa-check"></i> Sent!';
        form.reset();

        setTimeout(() => {
          status.textContent = '';
          status.className = 'form-note';
          btn.disabled = false;
          btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
        }, 5000);
      } else {
        console.error(result);
        status.textContent = '⚠️ Something went wrong: ' + result.message;
        status.className = 'form-note error';
        btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
        btn.disabled = false;
      }
    } catch (error) {
      console.error(error);
      status.textContent = '⚠️ Network error. Please try again later.';
      status.className = 'form-note error';
      btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
      btn.disabled = false;
    }
  });
})();

/* ─── SMOOTH ANCHOR SCROLL ─── */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ─── ADD ACTIVE NAV STYLE ─── */
const style = document.createElement('style');
style.textContent = `
  .nav-link.active-link {
    color: var(--text-1);
    background: var(--surface);
  }
`;
document.head.appendChild(style);

/* ═══════════════════════════════════════════════════════════
   INTERACTIVE TERMINAL EMULATOR
═══════════════════════════════════════════════════════════ */
(function initTerminal() {

  /* ─── DOM refs ─── */
  const output = document.getElementById('term-output');
  const input = document.getElementById('term-input');
  const body = document.getElementById('term-body');
  const wrapper = document.querySelector('.terminal-wrapper');
  const matCanvas = document.getElementById('matrix-canvas');
  if (!output || !input) return;

  /* ─── State ─── */

  let history = [];
  let histIdx = -1;
  let matrixActive = false;
  let matrixAnimId = null;
  let booted = false;
  let busy = false;

  // Games State
  let rpgState = 0;


  /* ─── All available commands (for tab-complete) ─── */
  const COMMANDS = [
    'help', 'whoami', 'about', 'skills', 'projects',
    'contact', 'services', 'fetch', 'ls', 'cat', 'pwd', 'date', 'echo',
    'clear', 'history', 'matrix', 'sudo', 'ping', 'open', 'gui'
  ];


  /* ══════════════ OUTPUT HELPERS ══════════════ */


  function line(text = '', cls = 't-out', delay = 0) {
    return new Promise(resolve => {
      setTimeout(() => {
        const span = document.createElement('span');
        span.className = `t-line ${cls}`;
        span.innerHTML = text;
        output.appendChild(span);
        scrollBottom();
        resolve();
      }, delay);
    });
  }

  function blank(delay = 0) { return line('', 't-blank', delay); }

  async function typeLines(lines, baseDelay = 0, lineGap = 60) {
    for (let i = 0; i < lines.length; i++) {
      await line(lines[i][0], lines[i][1] || 't-out', baseDelay + i * lineGap);
    }
  }

  function prompt(cmd) {
    const span = document.createElement('span');
    span.className = 't-line t-cmd';
    span.innerHTML = `<span class="t-prompt-echo">prakul@portfolio:~$</span> <span class="t-white">${escHtml(cmd)}</span>`;
    output.appendChild(span);
    scrollBottom();
  }

  function scrollBottom() {
    body.scrollTop = body.scrollHeight;
  }

  function escHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function progressBar(pct) {
    return `<span class="t-bar-wrap"><span class="t-bar-fill" style="width:${pct}%"></span></span>`;
  }

  /* ══════════════ STATUS BAR ══════════════ */

  (function statusBar() {
    const cpuEl = document.getElementById('tsb-cpu');
    const ramEl = document.getElementById('tsb-ram');
    const timeEl = document.getElementById('tsb-time');
    const pingEl = document.getElementById('tsb-ping');
    if (!cpuEl) return;

    let cpu = 12, ram = 340;

    function update() {
      // Simulate natural-looking fluctuations
      cpu = Math.max(3, Math.min(95, cpu + (Math.random() - 0.5) * 8));
      ram = Math.max(280, Math.min(512, ram + (Math.random() - 0.5) * 12));
      const ping = Math.floor(Math.random() * 12) + 2;
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const ss = String(now.getSeconds()).padStart(2, '0');

      cpuEl.textContent = cpu.toFixed(1);
      ramEl.textContent = Math.round(ram);
      timeEl.textContent = `${hh}:${mm}:${ss}`;
      pingEl.textContent = ping;
    }

    update();
    setInterval(update, 1000);
  })();

  /* ══════════════ BOOT SEQUENCE ══════════════ */

  async function boot() {
    busy = true;

    const bootLines = [];
    await line(`<span class="t-green t-bold">PrakulOS</span> <span class="t-dim">v1.0.0 — Interactive Portfolio Terminal</span>`, 't-out', 60);
    await line(`<span class="t-dim">Copyright © 2024 Prakul Agarwal. All rights reserved.</span>`, 't-out', 80);
    await blank(90);

    // Boot log
    const bootLog = [
      [`<span class="t-green">✓</span> <span class="t-dim">Loading kernel modules...</span>                 <span class="t-green">OK</span>`],
      [`<span class="t-green">✓</span> <span class="t-dim">Initialising React runtime...</span>              <span class="t-green">OK</span>`],
      [`<span class="t-green">✓</span> <span class="t-dim">Mounting projects filesystem...</span>            <span class="t-green">OK</span>`],
      [`<span class="t-green">✓</span> <span class="t-dim">Establishing AI/ML services...</span>            <span class="t-green">OK</span>`],
      [`<span class="t-green">✓</span> <span class="t-dim">Starting voice assistant daemon (Friday)...</span> <span class="t-green">OK</span>`],
      [`<span class="t-green">✓</span> <span class="t-dim">Configuring particle engine...</span>            <span class="t-green">OK</span>`],
    ];

    await typeLines(bootLog, 110, 90);
    await blank(200);
    await line(`Type <span class="t-accent">help</span> to explore commands. Tab for autocomplete. ↑↓ for history.`, 't-info', 200);
    await blank(220);

    busy = false;
    input.focus();
  }

  /* Trigger boot when terminal scrolls into view */
  const io = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !booted) {
      booted = true;
      boot();
      io.disconnect();
    }
  }, { threshold: 0.3 });
  if (wrapper) io.observe(wrapper);

  /* ══════════════ COMMAND REGISTRY ══════════════ */

  const commands = {

    help: async () => {
      await blank();
      await line(`<span class="t-purple t-bold">Available Commands</span>`, 't-out', 0);
      await line(`<span class="t-dim">─────────────────────────────────────────────</span>`, 't-out', 20);
      const cmds = [
        ['whoami', 'Who is Prakul Agarwal?'],
        ['about', 'Detailed bio & personality'],
        ['skills', 'Tech stack & proficiency'],
        ['projects', 'Featured projects overview'],
        ['contact', 'Get in touch'],
        ['fetch', 'neofetch-style system info'],
        ['ls', 'List directory contents'],
        ['cat [file]', 'Read a file (try: cat resume.txt)'],
        ['pwd', 'Print working directory'],
        ['date', 'Current date & time'],
        ['echo [msg]', 'Print a message'],
        ['ping', 'Ping prakulagarwal.com'],
        ['history', 'Show command history'],
        ['open [url]', 'Open github | linkedin | twitter'],
        ['matrix', 'Toggle matrix rain mode 🟩'],
        ['play', 'Play Asteroids in the background! 🚀'],
        ['services', 'My freelance service offerings'],
        ['sudo [cmd]', 'Try your luck 😈'],
        ['gui', 'Switch to GUI mode (scroll up)'],
        ['clear', 'Clear the terminal'],
      ];
      for (let i = 0; i < cmds.length; i++) {
        await line(
          `  <span class="t-cyan" style="display:inline-block;min-width:180px">${cmds[i][0]}</span><span class="t-dim">${cmds[i][1]}</span>`,
          't-out', i * 28
        );
      }
      await blank(cmds.length * 28 + 30);
    },

    whoami: async () => {
      await blank();
      await line(`<span class="t-purple t-bold">▸ Prakul Agarwal</span>`, 't-out', 0);
      await line(`  <span class="t-dim">Software Developer  ·  India 🇮🇳  ·  Available for hire</span>`, 't-out', 60);
      await blank(80);
      await line(`  <span class="t-yellow">Role</span>       <span class="t-white">Full-Stack Software Developer</span>`, 't-out', 100);
      await line(`  <span class="t-yellow">Focus</span>      <span class="t-white">React · Node.js · Python · AI/ML</span>`, 't-out', 130);
      await line(`  <span class="t-yellow">Passion</span>    <span class="t-white">Building elegant, scalable software</span>`, 't-out', 160);
      await line(`  <span class="t-yellow">Currently</span>  <span class="t-white">Building amazing things ✨</span>`, 't-out', 190);
      await blank(220);
    },

    about: async () => {
      await blank();
      await line(`<span class="t-purple t-bold">/* About Prakul */</span>`, 't-out', 0);
      await blank(30);
      const paras = [
        `I'm a software developer with a deep love for turning complex`,
        `problems into elegant digital solutions. I believe great code`,
        `is invisible — it just works, beautifully and reliably.`,
        ``,
        `From pixel-perfect frontends to robust distributed backends,`,
        `I enjoy crafting the full spectrum of modern software.`,
        ``,
        `Most recently I've been exploring AI integrations — building`,
        `voice assistants, LLM pipelines, and agentic systems.`,
      ];
      for (let i = 0; i < paras.length; i++) {
        await line(paras[i] ? `  ${paras[i]}` : '', paras[i] ? 't-out' : 't-blank', 40 + i * 55);
      }
      await blank(paras.length * 55 + 50);
      await line(`  Type <span class="t-accent">skills</span> to see my tech stack.`, 't-info', paras.length * 55 + 60);
      await blank(paras.length * 55 + 80);
    },

    skills: async () => {
      await blank();
      await line(`<span class="t-purple t-bold">Tech Stack</span>`, 't-out', 0);
      await line(`<span class="t-dim">─────────────────────────────────────────────────</span>`, 't-out', 20);
      const skills = [
        { cat: 'Frontend', items: [['React / Next.js', 92], ['TypeScript', 88], ['JavaScript', 95], ['HTML/CSS', 97], ['Tailwind CSS', 90]] },
        { cat: 'Backend', items: [['Node.js', 88], ['Python', 90], ['FastAPI', 80], ['PostgreSQL', 82], ['MongoDB', 85]] },
        { cat: 'Tools & AI', items: [['Git / GitHub', 94], ['Docker', 78], ['OpenAI / LLMs', 86], ['AWS', 74], ['Voice AI', 82]] },
      ];
      let d = 40;
      for (const group of skills) {
        await line(`<span class="t-cyan t-bold">  ${group.cat}</span>`, 't-out', d); d += 40;
        for (const [name, pct] of group.items) {
          const barHtml = progressBar(pct);
          await line(
            `    <span style="display:inline-block;min-width:160px">${name}</span>${barHtml}<span class="t-dim">${pct}%</span>`,
            't-out', d
          );
          // Animate bars after render
          setTimeout(() => {
            body.querySelectorAll('.t-bar-fill').forEach(b => {
              if (!b.dataset.animated) { b.dataset.animated = 1; b.style.width = b.style.width; }
            });
          }, d + 100);
          d += 55;
        }
        await blank(d); d += 20;
      }
    },

    projects: async () => {
      await blank();
      await line(`<span class="t-purple t-bold">Featured Projects</span>`, 't-out', 0);
      await line(`<span class="t-dim">─────────────────────────────────────────────────</span>`, 't-out', 20);
      const projs = [
        { name: 'Friday — AI Voice Assistant', tech: 'Python · Groq · TTS/STT', desc: 'Tony Stark-inspired voice AI. Real-time voice-to-voice.' },
        { name: 'AI Chat Application', tech: 'React · Node.js · OpenAI', desc: 'Streaming LLM chat with context memory.' },
        { name: 'Analytics Dashboard', tech: 'React · D3.js · FastAPI', desc: 'Real-time metrics with interactive charts.' },
        { name: 'E-Commerce Platform', tech: 'Next.js · Stripe · MongoDB', desc: 'Full-featured store with payments & admin.' },
        { name: 'Portfolio Website', tech: 'HTML · CSS · JS · Canvas', desc: 'This very site — animated + interactive.' },
      ];
      let d = 40;
      for (const p of projs) {
        await line(`  <span class="t-green t-bold">▸ ${p.name}</span>`, 't-out', d); d += 40;
        await line(`    <span class="t-dim">${p.tech}</span>`, 't-out', d); d += 35;
        await line(`    ${p.desc}`, 't-out', d); d += 50;
        await blank(d); d += 15;
      }
      await line(`  <span class="t-info">→ github.com/prakulagarwal</span>`, 't-out', d);
      await blank(d + 20);
    },

    contact: async () => {
      await blank();
      await line(`<span class="t-purple t-bold">Contact Prakul</span>`, 't-out', 0);
      await line(`<span class="t-dim">─────────────────────────────────</span>`, 't-out', 20);
      const items = [
        ['📧 Email', 'prakul.agarwal.dev@gmail.com'],
        ['💼 LinkedIn', 'linkedin.com/in/prakul-agarwal'],
        ['🐙 GitHub', 'github.com/prakulagarwal'],
        ['🐦 Twitter', 'twitter.com/prakulagarwal'],
        ['🌐 Website', 'prakulagarwal.com'],
      ];
      for (let i = 0; i < items.length; i++) {
        await line(
          `  <span class="t-yellow" style="display:inline-block;min-width:120px">${items[i][0]}</span><span class="t-cyan">${items[i][1]}</span>`,
          't-out', 50 + i * 60
        );
      }
      await blank(items.length * 60 + 60);
      await line(`  <span class="t-green">✓ Response time: usually within 24h</span>`, 't-success', items.length * 60 + 70);
      await blank(items.length * 60 + 90);
    },

    fetch: async () => {
      await blank();
      const now = new Date();
      await line(
        `<span class="t-green t-bold">prakulagarwal</span><span class="t-dim">@</span><span class="t-cyan t-bold">portfolio</span>`,
        't-out', 0
      );
      await line(`<span class="t-dim">─────────────────────────────────────────</span>`, 't-out', 30);
      const info = [
        ['OS', 'PrakulOS v1.0.0 (Dark Edition)'],
        ['Host', 'prakulagarwal.com'],
        ['Kernel', 'JavaScript 2024 LTS'],
        ['Uptime', `${Math.floor(Math.random() * 500 + 100)} days, ${Math.floor(Math.random() * 23)} hours`],
        ['Shell', 'portfolio-sh 1.0.0'],
        ['Role', 'Software Developer'],
        ['Location', 'India 🇮🇳'],
        ['Status', '<span class="t-green">● Available for hire</span>'],
        ['Stack', 'React · Node.js · Rust · Web3 · Python · AI/ML'],
        ['Projects', '20+'],
        ['Coffee', '∞ cups consumed'],
        ['Theme', '<span class="t-purple">Purple</span> + <span class="t-cyan">Cyan</span> Dark Mode'],
        ['Memory', `${Math.round(340 + Math.random() * 60)} MB / 512 MB`],
        ['Bugs', '0 (in production 🤔)'],
      ];
      for (let i = 0; i < info.length; i++) {
        await line(
          `  <span class="t-yellow" style="display:inline-block;min-width:100px">${info[i][0]}</span><span class="t-white">${info[i][1]}</span>`,
          't-out', 50 + i * 48
        );
      }
      await blank(info.length * 48 + 70);
      // Color palette
      await line(
        `  ` + ['#7c3aed', '#06b6d4', '#4ade80', '#fbbf24', '#f87171', '#a78bfa', '#38bdf8', '#f8fafc']
          .map(c => `<span style="color:${c}">█</span>`).join(' '),
        't-out', info.length * 48 + 80
      );
      await blank(info.length * 48 + 100);
    },

    ls: async () => {
      await blank();
      await line(`<span class="t-dim">drwxr-xr-x  about/</span>`, 't-out', 0);
      await line(`<span class="t-dim">drwxr-xr-x  skills/</span>`, 't-out', 35);
      await line(`<span class="t-dim">drwxr-xr-x  projects/</span>`, 't-out', 55);
      await line(`<span class="t-cyan">-rw-r--r--  resume.txt</span>`, 't-out', 95);
      await line(`<span class="t-cyan">-rw-r--r--  contact.md</span>`, 't-out', 115);
      await line(`<span class="t-green">-rwxr-xr-x  hire_prakul.sh</span>`, 't-out', 135);
      await blank(155);
    },

    cat: async (args) => {
      const file = args[0] || '';
      await blank();
      if (file === 'resume.txt') {
        await line(`<span class="t-purple t-bold">PRAKUL AGARWAL — RESUME</span>`, 't-out', 0);
        await line(`<span class="t-dim">──────────────────────────────────────</span>`, 't-out', 25);
        await line(`Software Developer | India | prakul.agarwal.dev@gmail.com`, 't-out', 50);
        await blank(70);
        await line(`<span class="t-cyan t-bold">SKILLS</span>`, 't-out', 90);
        await line(`  React, Next.js, TypeScript, Node.js, Python, FastAPI`, 't-out', 110);
        await line(`  PostgreSQL, MongoDB, Docker, AWS, AI/ML, OpenAI`, 't-out', 130);
        await blank(150);
        await line(`<span class="t-cyan t-bold">EXPERIENCE</span>`, 't-out', 170);
        await line(`  Software Developer @ Your Company (2023–Present)`, 't-out', 190);
        await line(`  Junior Developer @ Previous Co. (2022–2023)`, 't-out', 210);
        await line(`  SWE Intern @ Startup (2021–2022)`, 't-out', 230);
        await blank(250);
        await line(`<span class="t-green">→ Full resume available at prakulagarwal.com</span>`, 't-success', 270);
      } else if (file === 'contact.md') {
        await line(`# Contact Prakul`, 't-accent', 0);
        await line(`Email: prakul.agarwal.dev@gmail.com`, 't-out', 40);
        await line(`Web:   prakulagarwal.com`, 't-out', 70);
      } else if (file === 'hire_prakul.sh') {
        await line(`#!/bin/bash`, 't-dim', 0);
        await line(`echo "Great choice! Let's build something amazing."`, 't-out', 40);
        await line(`open "mailto:prakul.agarwal.dev@gmail.com"`, 't-green', 70);
        await blank(90);
        await line(`<span class="t-green">$ bash hire_prakul.sh</span>`, 't-success', 110);
        await line(`Great choice! Let's build something amazing. 🚀`, 't-out', 150);
      } else {
        await line(`cat: ${file || '(no file)'}: No such file or directory`, 't-error');
        await line(`Hint: try <span class="t-accent">ls</span> to see available files`, 't-dim', 30);
      }
      await blank(300);
    },

    pwd: async () => {
      await blank();
      await line(`/home/prakul/portfolio`, 't-out');
      await blank(30);
    },

    date: async () => {
      await blank();
      await line(new Date().toString(), 't-out');
      await blank(30);
    },

    echo: async (args) => {
      await blank();
      await line(args.join(' ') || '(nothing to echo)', 't-out');
      await blank(30);
    },

    history: async () => {
      await blank();
      if (history.length === 0) {
        await line('No commands in history yet.', 't-dim');
      } else {
        for (let i = 0; i < history.length; i++) {
          await line(
            `  <span class="t-dim">${String(i + 1).padStart(3, '0')}</span>  <span class="t-white">${escHtml(history[i])}</span>`,
            't-out', i * 30
          );
        }
      }
      await blank(history.length * 30 + 30);
    },

    clear: () => {
      output.innerHTML = '';
      return Promise.resolve();
    },

    ping: async () => {
      await blank();
      await line(`PING prakulagarwal.com`, 't-out', 0);
      for (let i = 1; i <= 4; i++) {
        const ms = Math.floor(Math.random() * 12) + 2;
        await line(`64 bytes from prakulagarwal.com: icmp_seq=${i} ttl=64 time=${ms} ms`, 't-out', i * 280);
      }
      await blank(1200);
      await line(`— prakulagarwal.com ping statistics —`, 't-dim', 1220);
      await line(`4 packets transmitted, 4 received, <span class="t-green">0% packet loss</span>`, 't-out', 1260);
      await blank(1300);
    },

    open: async (args) => {
      const target = args[0] || '';
      const urls = {
        github: 'https://github.com/prakulagarwal',
        linkedin: 'https://linkedin.com/in/prakul-agarwal',
        twitter: 'https://twitter.com/prakulagarwal',
        website: 'https://prakulagarwal.com',
      };
      const url = urls[target.toLowerCase()];
      await blank();
      if (url) {
        await line(`Opening <span class="t-cyan">${url}</span>...`, 't-out', 0);
        setTimeout(() => window.open(url, '_blank'), 600);
        await line(`<span class="t-green">✓ Launched in new tab</span>`, 't-success', 400);
      } else {
        await line(`Usage: open [github | linkedin | twitter | website]`, 't-error');
      }
      await blank(450);
    },

    gui: async () => {
      await blank();
      await line(`<span class="t-green">✓ Switching to GUI mode...</span>`, 't-success', 0);
      await blank(100);
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 800);
    },

    sudo: async (args) => {
      await blank();
      await line(`<span class="t-warn">[sudo] password for prakul:</span>`, 't-warn', 0);
      await new Promise(r => setTimeout(r, 1200));
      if (args[0] === 'hired' || args.join(' ').includes('hire')) {
        await line(`<span class="t-green t-bold">✓ Access granted! Prakul is officially hired. 🎉</span>`, 't-success', 0);
        await line(`  Redirecting to contact form...`, 't-dim', 200);
        setTimeout(() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }), 1500);
      } else if (args[0] === 'hack') {
        rpgState = 1;
        await line('<span class="t-error t-bold">>>> OVERRIDE INITIATED <<<</span>', 't-error', 0);
        await line('SYSTEM: Connection intercepted.', 't-dim', 400);
        await line('To gain root access, you must prove your worth.', 't-out', 1000);
        await blank(1200);
        await line('<span class="t-cyan">Level 1: I speak without a mouth and hear without ears. What command am I?</span>', 't-out', 1800);
        setTimeout(() => input.focus(), 1900);
      } else if (args[0] === 'rm' && args[1] === '-rf') {
        await line(`<span class="t-error">sudo: Nice try 😂 This portfolio is indestructible.</span>`, 't-error');
      } else {
        await line(`<span class="t-error">sudo: ${args.join(' ') || '(command)'}: Permission denied</span>`, 't-error');
        await line(`  Hint: try <span class="t-accent">sudo hired prakul</span> 😉`, 't-dim', 60);
      }
      await blank(300);
    },

    matrix: async () => {
      matrixActive = !matrixActive;
      await blank();
      if (matrixActive) {
        await line(`<span class="t-green">Entering the Matrix... 🟩</span>`, 't-success', 0);
        await line(`<span class="t-dim">Type <span class="t-accent">matrix</span> again to exit.</span>`, 't-out', 60);
        startMatrix();
      } else {
        await line(`<span class="t-purple">Exited the Matrix. Welcome back. 🕶️</span>`, 't-accent', 0);
        stopMatrix();
      }
      await blank(80);
    },


    services: async () => {
      await blank();
      await line(`<span class="t-purple t-bold">Freelance Services</span>`, 't-out', 0);
      await line(`<span class="t-dim">─────────────────────────────────────────────</span>`, 't-out', 20);
      const svcs = [
        ['🌐 Full-Stack Dev', 'React · Next.js · Node.js · Python'],
        ['⛓️  Web3 & Contracts', 'Solidity · Ethers.js · DeFi · NFTs'],
        ['🤖 AI Integration', 'OpenAI · LangChain · Voice AI · Agents'],
        ['🦀 Rust Development', 'Systems · WASM · CLI · High-perf'],
        ['🔧 API Architecture', 'REST · GraphQL · PostgreSQL · AWS'],
        ['🔍 Consulting', 'Architecture · Security Audits · Review'],
      ];
      let d = 40;
      for (let i = 0; i < svcs.length; i++) {
        await line(
          `  <span class="t-cyan" style="display:inline-block;min-width:210px">${svcs[i][0]}</span><span class="t-dim">${svcs[i][1]}</span>`,
          't-out', d
        );
        d += 50;
      }
      await blank(d);
      await line(`  <span class="t-green">→ Available for remote work worldwide · prakul.agarwal.dev@gmail.com</span>`, 't-success', d + 20);
      await blank(d + 40);
    },

    play: async () => {
      await blank();
      await line(`<span class="t-cyan t-bold">INITIATING ASTEROIDS PROTOCOL...</span>`, 't-out', 0);
      await line(`> Booting canvas thrusters... [OK]`, 't-dim', 400);
      await line(`> Arming laser systems...     [OK]`, 't-dim', 800);
      await line(`<span class="t-green">CONTROLS: Use ⬆️ ⬅️ ➡️ to fly, and [SPACE] to shoot.</span>`, 't-out', 1200);
      await line(`<span class="t-green">Good luck, Commander.</span>`, 't-success', 1600);
      await blank(1800);
      setTimeout(() => {
        window.startAsteroidsGame();
      }, 1900);
    },
  };

  /* ══════════════ MATRIX RAIN ══════════════ */

  function startMatrix() {
    const ctx = matCanvas.getContext('2d');
    matCanvas.width = wrapper.offsetWidth;
    matCanvas.height = wrapper.offsetHeight;
    matCanvas.classList.add('active');

    const cols = Math.floor(matCanvas.width / 16);
    const drops = Array(cols).fill(1);
    const chars = 'アイウエオカキクケコサシスセソ0123456789ABCDEF<>{}();=';

    function frame() {
      ctx.fillStyle = 'rgba(8,13,26,0.06)';
      ctx.fillRect(0, 0, matCanvas.width, matCanvas.height);
      ctx.fillStyle = '#27c93f';
      ctx.font = '14px JetBrains Mono, monospace';
      for (let i = 0; i < drops.length; i++) {
        const ch = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillStyle = Math.random() > 0.95 ? '#a78bfa' : '#27c93f';
        ctx.fillText(ch, i * 16, drops[i] * 16);
        if (drops[i] * 16 > matCanvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
      matrixAnimId = requestAnimationFrame(frame);
    }
    frame();
  }

  function stopMatrix() {
    if (matrixAnimId) cancelAnimationFrame(matrixAnimId);
    matrixAnimId = null;
    matCanvas.classList.remove('active');
    const ctx = matCanvas.getContext('2d');
    ctx.clearRect(0, 0, matCanvas.width, matCanvas.height);
  }

  /* ══════════════ COMMAND EXECUTION ══════════════ */

  async function runCommand(raw) {
    const trimmed = raw.trim();
    if (!trimmed) return;

    // Save history (avoid duplicates)
    if (history[history.length - 1] !== trimmed) history.push(trimmed);
    histIdx = history.length;

    // Echo the command
    prompt(trimmed);

    const parts = trimmed.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    if (commands[cmd]) {
      busy = true;
      try { await commands[cmd](args); } catch (e) { await line(`Error: ${e.message}`, 't-error'); }
      busy = false;
    } else {
      await blank();
      await line(`<span class="t-error">command not found: ${escHtml(cmd)}</span>`, 't-error');
      await line(`Type <span class="t-accent">help</span> to list available commands.`, 't-dim', 40);
      await blank(60);
    }
  }

  /* ══════════════ INPUT HANDLING ══════════════ */

  input.addEventListener('keydown', async e => {
    if (busy) { e.preventDefault(); return; }

    if (e.key === 'Enter') {
      const val = input.value.trim();
      input.value = '';
      if (!val) return;

      if (rpgState > 0) {
        let lval = val.toLowerCase();
        await line(`<span class="t-dim">> ${val}</span>`, 't-out', 0);
        if (val === 'exit' || val === 'quit') {
          rpgState = 0;
          await line('<span class="t-dim">Override cancelled by user.</span>', 't-out');
          return;
        }
        busy = true;

        if (rpgState === 1) {
          if (lval === 'echo') {
            rpgState = 2;
            await line('<span class="t-success">Access granted.</span>', 't-success', 300);
            await line('<span class="t-cyan">Level 2: What does \`typeof null\` evaluate to in JavaScript?</span>', 't-out', 800);
          } else {
            await line('<span class="t-error">Incorrect. Try again.</span>', 't-error', 200);
          }
        } else if (rpgState === 2) {
          if (lval === 'object') {
            rpgState = 3;
            await line('<span class="t-success">Correct. Unfortunate, but correct.</span>', 't-success', 300);
            await line('<span class="t-cyan">Final Level: Type the exact override code to gain root access: </span><span class="t-error">XYZ-99</span>', 't-out', 800);
          } else {
            await line('<span class="t-error">Incorrect. Try again.</span>', 't-error', 200);
          }
        } else if (rpgState === 3) {
          if (lval === 'xyz-99') {
            rpgState = 0;
            await line('<span class="t-success t-bold">ROOT ACCESS GRANTED.</span>', 't-success', 300);
            await line('Welcome, Admin. Initiating Hacker Mode...', 't-dim', 800);
            setTimeout(() => {
              document.body.classList.add('hacker-mode');
            }, 1000);
          } else {
            await line('<span class="t-error">INCORRECT. CONNECTION TERMINATED.</span>', 't-error', 200);
            rpgState = 0;
          }
        }
        busy = false;
        return;
      }

      await runCommand(val);
    }

    else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (histIdx > 0) { histIdx--; input.value = history[histIdx]; }
      // Move cursor to end
      setTimeout(() => input.setSelectionRange(input.value.length, input.value.length), 0);
    }

    else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (histIdx < history.length - 1) { histIdx++; input.value = history[histIdx]; }
      else { histIdx = history.length; input.value = ''; }
    }

    else if (e.key === 'Tab') {
      e.preventDefault();
      const val = input.value.trim();
      if (!val) return;
      const matches = COMMANDS.filter(c => c.startsWith(val.toLowerCase()));
      if (matches.length === 1) {
        input.value = matches[0];
      } else if (matches.length > 1) {
        await blank();
        await line(matches.map(m => `<span class="t-cyan">${m}</span>`).join('  '), 't-out');
        await blank(30);
      }
    }

    else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      output.innerHTML = '';
    }

    else if (e.key === 'c' && e.ctrlKey) {
      e.preventDefault();
      await line(`<span class="t-gray">^C</span>`, 't-out');
      input.value = '';
      busy = false;
    }
  });

  /* Click anywhere on terminal body → focus input */
  body.addEventListener('click', () => input.focus());

  /* ══════════════ WINDOW CONTROLS ══════════════ */

  document.getElementById('term-btn-close')?.addEventListener('click', () => {
    wrapper.style.transition = 'opacity 0.3s, transform 0.3s';
    wrapper.style.opacity = '0';
    wrapper.style.transform = 'scale(0.96)';
    setTimeout(() => { wrapper.style.opacity = ''; wrapper.style.transform = ''; }, 2000);
  });

  document.getElementById('term-btn-min')?.addEventListener('click', () => {
    wrapper.classList.toggle('term-minimised');
  });

  document.getElementById('term-btn-max')?.addEventListener('click', () => {
    wrapper.classList.toggle('term-maximised');
    if (wrapper.classList.contains('term-maximised')) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    scrollBottom();
  });

  document.getElementById('term-clear-btn')?.addEventListener('click', () => {
    output.innerHTML = '';
  });

  document.getElementById('term-copy-btn')?.addEventListener('click', () => {
    const text = output.innerText;
    navigator.clipboard?.writeText(text).catch(() => { });
  });

  /* ══════════════ QUICK CHIPS ══════════════ */

  document.querySelectorAll('.term-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      if (busy) return;
      const cmd = chip.dataset.cmd;
      if (cmd) {
        input.value = cmd;
        input.focus();
        runCommand(cmd).then(() => { input.value = ''; });
      }
    });
  });

})();

