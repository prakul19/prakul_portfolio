import re

# 1. Update style.css
with open('/Users/prakul/fun/portfolio/style.css', 'a', encoding='utf-8') as f:
    f.write("\n\n/* ─── GAME MODE OVERLAY ─── */\n")
    f.write("body.game-mode::after {\n  content: '';\n  position: fixed;\n  inset: 0;\n  background: rgba(10, 10, 14, 0.85);\n  z-index: -1;\n  pointer-events: none;\n  animation: fadeDim 1.5s ease forwards;\n}\n")
    f.write("body.game-mode #particle-canvas {\n  z-index: 100 !important;\n  position: fixed !important;\n}\n")
    f.write("body.game-mode .terminal-section { position: relative; z-index: 101; }\n")
    f.write("@keyframes fadeDim { from { opacity: 0; } to { opacity: 1; } }\n")

# 2. Update app.js -> Replace initParticles IIFE
with open('/Users/prakul/fun/portfolio/app.js', 'r', encoding='utf-8') as f:
    appjs = f.read()

# Find the bounds of the existing initParticles block
start_idx = appjs.find("/* ─── PARTICLE BACKGROUND ─── */")
end_idx = appjs.find("/* ─── CURSOR GLOW ─── */")

if start_idx != -1 and end_idx != -1:
    new_particles_block = """/* ─── PARTICLE BACKGROUND & ASTEROIDS GAME ─── */
(function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  const ctx = canvas.getContext('2d');
  let W, H, particles, animId;

  // Game state
  let gameState = 'inactive'; // 'inactive', 'playing', 'gameover'
  let score = 0;
  let lives = 3;
  const keys = {};

  const ship = { x: 0, y: 0, vx: 0, vy: 0, angle: -Math.PI/2, radius: 12, lasers: [] };

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
    if (gameState === 'playing' && ['ArrowUp','ArrowLeft','ArrowRight',' '].includes(e.key)) {
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
        if (Math.sqrt(dx*dx + dy*dy) < p.r) {
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
      if (Math.sqrt(dx*dx + dy*dy) < p.r + ship.radius - 2) {
        lives--;
        ship.x = W/2; ship.y = H/2;
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
      ctx.lineTo(-ship.radius*0.5, 0);
      ctx.lineTo(-ship.radius, -ship.radius * 0.7);
      ctx.closePath();
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2;
      ctx.stroke();
      if (keys['ArrowUp']) {
        ctx.beginPath();
        ctx.moveTo(-ship.radius*0.5, 0);
        ctx.lineTo(-ship.radius*1.8, (Math.random()-0.5)*5);
        ctx.strokeStyle = '#f87171';
        ctx.stroke();
      }
      ctx.restore();
      
      ctx.fillStyle = '#4ade80';
      for (const l of ship.lasers) {
        ctx.beginPath();
        ctx.arc(l.x, l.y, 3, 0, Math.PI*2);
        ctx.fill();
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#4ade80';
      }
      ctx.shadowBlur = 0;
    } else if (gameState === 'gameover') {
      ctx.fillStyle = '#f87171';
      ctx.font = 'bold 50px "Inter", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`GAME OVER`, W/2, H/2 - 20);
      ctx.fillStyle = '#fff';
      ctx.font = '24px "Fira Code", monospace';
      ctx.fillText(`FINAL SCORE: ${score}`, W/2, H/2 + 30);
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
    ship.x = W/2;
    ship.y = H/2;
    ship.vx = 0;
    ship.vy = 0;
    ship.angle = -Math.PI/2;
    ship.lasers = [];
    particles = createParticles(50); 
    spawnAsteroids(8); 
  };
})();\n\n"""
    
    appjs = appjs[:start_idx] + new_particles_block + appjs[end_idx:]
    print("app.js logic updated")
else:
    print("FAILED TO FIND INit block bounds")

# 3. Add to terminal commands
play_cmd = """
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
"""

# Insert inside commands object
cmd_marker = "  };\n\n  /* ══════════════ MATRIX RAIN"
if cmd_marker in appjs:
    appjs = appjs.replace(cmd_marker, play_cmd + "  };\n\n  /* ══════════════ MATRIX RAIN")
else:
    # Try CRLF
    cmd_marker = "  };\r\n\r\n  /* ══════════════ MATRIX RAIN"
    appjs = appjs.replace(cmd_marker, play_cmd + cmd_marker)

# Add to COMMANDS array
appjs = appjs.replace("'services','fetch',", "'services','play','fetch',")

# Add to help menu
appjs = appjs.replace("['matrix', 'Toggle matrix rain mode 🟩'],", "['matrix', 'Toggle matrix rain mode 🟩'],\n        ['play',   'Play Asteroids in the background! 🚀'],")

with open('/Users/prakul/fun/portfolio/app.js', 'w', encoding='utf-8') as f:
    f.write(appjs)

print("done")
