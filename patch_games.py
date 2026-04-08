import re

# 1. Update style.css
with open('/Users/prakul/fun/portfolio/style.css', 'a', encoding='utf-8') as f:
    f.write("\n\n/* ─── HACKER MODE & SNAKE ─── */\n")
    f.write("body.hacker-mode .terminal-body {\n  color: #16a34a !important;\n}\n")
    f.write("body.hacker-mode .t-white,\nbody.hacker-mode .t-cyan,\nbody.hacker-mode .t-purple,\nbody.hacker-mode .t-green,\nbody.hacker-mode .t-dim,\nbody.hacker-mode .t-error,\nbody.hacker-mode .t-accent {\n  color: #22c55e !important;\n  text-shadow: 0 0 5px rgba(34, 197, 94, 0.4);\n}\n")
    f.write(".snake-board {\n  font-family: monospace;\n  white-space: pre;\n  line-height: 1.1;\n  background: rgba(0,0,0,0.5);\n  display: inline-block;\n  padding: 10px;\n  border-radius: 8px;\n  border: 1px solid rgba(255,255,255,0.1);\n  margin: 10px 0;\n  letter-spacing: -2px;\n}\n")

# 2. Update app.js
with open('/Users/prakul/fun/portfolio/app.js', 'r', encoding='utf-8') as f:
    appjs = f.read()

# ADD STATE VARIABLES
state_vars = """
  let history = [];
  let histIdx = -1;
  let matrixActive = false;
  let matrixAnimId = null;
  let booted = false;
  let busy = false;

  // Games State
  let rpgState = 0;
  let snakeActive = false;
  let snake = [];
  let apple = {x:0, y:0};
  let snakeDir = {dx:1, dy:0};
  let nextDir = {dx:1, dy:0};
  let snakeScore = 0;
  let snakeInterval;
  let snakeBoardEl;
"""
appjs = re.sub(r'let history = \[\];.*?let busy = false;  // prevent input while typing boot sequence', state_vars, appjs, flags=re.DOTALL)

# ADD SNAKE LOGIC FUNCTION inside output helpers
snake_func = """
  async function startSnake() {
    snakeActive = true;
    snake = [{x: 10, y: 5}];
    snakeDir = {dx: 1, dy: 0};
    nextDir = {dx: 1, dy: 0};
    snakeScore = 0;
    apple = {x: 15, y: 5};
    
    await blank();
    await line('<span class="t-cyan">Starting Snake... Use Arrow Keys to move!</span>', 't-out');
    
    snakeBoardEl = document.createElement('div');
    snakeBoardEl.className = 'snake-board';
    body.appendChild(snakeBoardEl);
    
    function drawSnake() {
      let output = '';
      for (let y = 0; y < 10; y++) {
        for (let x = 0; x < 20; x++) {
          if (x === apple.x && y === apple.y) output += '🍎';
          else if (snake.some(s => s.x === x && s.y === y)) output += '🟩';
          else output += '⬛';
        }
        output += '\\n';
      }
      output += `<span style="color:#4ade80">Score: ${snakeScore}</span>`;
      snakeBoardEl.innerHTML = output;
      wrapper.scrollTop = wrapper.scrollHeight;
    }
    
    drawSnake();
    
    snakeInterval = setInterval(() => {
      snakeDir = nextDir;
      const head = {x: snake[0].x + snakeDir.dx, y: snake[0].y + snakeDir.dy};
      
      if (head.x < 0 || head.x >= 20 || head.y < 0 || head.y >= 10 || snake.some(s => s.x === head.x && s.y === head.y)) {
        clearInterval(snakeInterval);
        snakeActive = false;
        line(`<span class="t-error">Game Over! Score: ${snakeScore}</span>`, 't-error').then(() => blank());
        return;
      }
      
      snake.unshift(head);
      
      if (head.x === apple.x && head.y === apple.y) {
        snakeScore += 10;
        let nx, ny, ok;
        do {
           nx = Math.floor(Math.random() * 20); ny = Math.floor(Math.random() * 10);
           ok = !snake.some(s => s.x === nx && s.y === ny);
        } while(!ok);
        apple = {x: nx, y: ny};
      } else {
        snake.pop();
      }
      drawSnake();
    }, 120);
  }

  /* ══════════════ OUTPUT HELPERS ══════════════ */
"""
appjs = appjs.replace("  /* ══════════════ OUTPUT HELPERS ══════════════ */", snake_func)

# UPDATE SUDO COMMAND
old_sudo = "} else if (args[0] === 'rm' && args[1] === '-rf') {"
new_sudo = """} else if (args[0] === 'hack') {
        rpgState = 1;
        await line('<span class="t-error t-bold">>>> OVERRIDE INITIATED <<<</span>', 't-error', 0);
        await line('SYSTEM: Connection intercepted.', 't-dim', 400);
        await line('To gain root access, you must prove your worth.', 't-out', 1000);
        await blank(1200);
        await line('<span class="t-cyan">Level 1: I speak without a mouth and hear without ears. What command am I?</span>', 't-out', 1800);
        setTimeout(() => input.focus(), 1900);
      } else if (args[0] === 'rm' && args[1] === '-rf') {"""
appjs = appjs.replace(old_sudo, new_sudo)

# UPDATE PLAY COMMAND
old_play = """    play: async () => {
      await blank();
      await line(`<span class="t-cyan t-bold">INITIATING ASTEROIDS PROTOCOL...</span>`, 't-out', 0);"""
new_play = """    play: async (args) => {
      const mode = args[0]?.toLowerCase();
      if (mode === 'snake') {
        await startSnake();
        return;
      }
      await blank();
      if (!mode || mode === 'asteroids') {
        await line(`<span class="t-cyan t-bold">INITIATING ASTEROIDS PROTOCOL...</span>`, 't-out', 0);"""
appjs = appjs.replace(old_play, new_play)

# UPDATE HTTP LISTENER
old_listener = """  input.addEventListener('keydown', async e => {
    if (busy) { e.preventDefault(); return; }

    if (e.key === 'Enter') {
      const val = input.value;
      input.value = '';
      await runCommand(val);
    }"""
new_listener = """  input.addEventListener('keydown', async e => {
    if (snakeActive && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
      if (e.key === 'ArrowUp' && snakeDir.dy === 0) nextDir = {dx: 0, dy: -1};
      if (e.key === 'ArrowDown' && snakeDir.dy === 0) nextDir = {dx: 0, dy: 1};
      if (e.key === 'ArrowLeft' && snakeDir.dx === 0) nextDir = {dx: -1, dy: 0};
      if (e.key === 'ArrowRight' && snakeDir.dx === 0) nextDir = {dx: 1, dy: 0};
      return;
    }

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
            await line('<span class="t-cyan">Level 2: What does \\`typeof null\\` evaluate to in JavaScript?</span>', 't-out', 800);
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
    }"""
appjs = appjs.replace(old_listener, new_listener)

# Fix play command ending bracket issue introduced by replace
appjs = appjs.replace("""        await line(`<span class="t-cyan t-bold">INITIATING ASTEROIDS PROTOCOL...</span>`, 't-out', 0);
      await line(`> Booting canvas thrusters... [OK]`, 't-dim', 400);""", """        await line(`<span class="t-cyan t-bold">INITIATING ASTEROIDS PROTOCOL...</span>`, 't-out', 0);
      }
      await line(`> Booting canvas thrusters... [OK]`, 't-dim', 400);""")

with open('/Users/prakul/fun/portfolio/app.js', 'w', encoding='utf-8') as f:
    f.write(appjs)

print("done")
