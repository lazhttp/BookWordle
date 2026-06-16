// ui.js — Rendering & animation for BookWordle

class UI {
  constructor(game) {
    this.game = game;
    this.$grid       = document.getElementById('letter-grid');
    this.$selectedWord = document.getElementById('selected-word');
    this.$submitBtn  = document.getElementById('submit-btn');
    this.$clearBtn   = document.getElementById('clear-btn');
    this.$playerHpFill = document.getElementById('player-hp-fill');
    this.$playerHpText = document.getElementById('player-hp-text');
    this.$enemyHpFill  = document.getElementById('enemy-hp-fill');
    this.$enemyHpText  = document.getElementById('enemy-hp-text');
    this.$enemySprite  = document.getElementById('enemy-sprite');
    this.$enemyName    = document.getElementById('enemy-name');
    this.$battleLog    = document.getElementById('battle-log');
    this.$wordleHistory = document.getElementById('wordle-history');
    this.$overlay       = document.getElementById('game-overlay');
    this.$overlayTitle  = document.getElementById('overlay-title');
    this.$overlayMsg    = document.getElementById('overlay-msg');
    this.$overlayBtn    = document.getElementById('overlay-btn');
  }

  // ── Grid ─────────────────────────────────────────────────────────────────
  renderGrid(board) {
    this.$grid.innerHTML = '';
    this.$grid.style.gridTemplateColumns = `repeat(${board.cols}, 1fr)`;
    for (let r = 0; r < board.rows; r++) {
      for (let c = 0; c < board.cols; c++) {
        const tile = board.grid[r][c];
        const el = document.createElement('div');
        el.className = 'tile';
        if (tile.isOnFire) el.classList.add('tile-fire');
        el.textContent = tile.letter;
        el.dataset.row = r;
        el.dataset.col = c;
        tile.element = el;
        el.addEventListener('click', () => this.game.handleTileClick(r, c));
        this.$grid.appendChild(el);
      }
    }
  }

  updateTileVisuals(board) {
    for (let r = 0; r < board.rows; r++) {
      for (let c = 0; c < board.cols; c++) {
        const tile = board.grid[r][c];
        if (!tile.element) continue;
        tile.element.textContent = tile.letter;
        tile.element.className = 'tile';
        if (tile.isSelected)  tile.element.classList.add('tile-selected');
        if (tile.isOnFire)    tile.element.classList.add('tile-fire');
      }
    }
  }

  // ── Word Display ──────────────────────────────────────────────────────────
  updateWordDisplay(word) {
    this.$selectedWord.textContent = word || '— SELECT LETTERS —';
    this.$selectedWord.classList.toggle('has-word', word.length > 0);
    const valid = isValidWord(word) && word.length >= 3;
    this.$submitBtn.disabled = !valid;
    this.$submitBtn.classList.toggle('ready', valid);
  }

  // ── HP Bars ───────────────────────────────────────────────────────────────
  updatePlayerHp(hp, maxHp) {
    const pct = Math.max(0, hp / maxHp * 100);
    this.$playerHpFill.style.width = pct + '%';
    this.$playerHpText.textContent = `${Math.max(0,hp)}/${maxHp}`;
    this.$playerHpFill.className = 'hp-fill player-fill';
    if (pct < 30) this.$playerHpFill.classList.add('hp-critical');
    else if (pct < 60) this.$playerHpFill.classList.add('hp-warning');
  }

  updateEnemyHp(hp, maxHp) {
    const pct = Math.max(0, hp / maxHp * 100);
    this.$enemyHpFill.style.width = pct + '%';
    this.$enemyHpText.textContent = `${Math.max(0,hp)}/${maxHp}`;
  }

  // ── Enemy Display ─────────────────────────────────────────────────────────
  renderEnemy(enemy) {
    this.$enemyName.textContent = `⟨ ${enemy.name} ⟩  LV.${enemy.level}`;
    this.$enemySprite.className = 'enemy-sprite';
    this.$enemySprite.setAttribute('data-sprite', enemy.sprite);
    this.$wordleHistory.innerHTML = '';
    this.updateEnemyHp(enemy.hp, enemy.maxHp);

    // Entry animation
    this.$enemySprite.classList.add('enemy-enter');
    setTimeout(() => this.$enemySprite.classList.remove('enemy-enter'), 600);
  }

  // ── Wordle Attack Row ─────────────────────────────────────────────────────
  addWordleRow(result) {
    const row = document.createElement('div');
    row.className = 'wordle-row';

    const colorCounts = { green: 0, yellow: 0, gray: 0 };
    result.tiles.forEach(c => colorCounts[c]++);

    result.tiles.forEach((color, i) => {
      const tile = document.createElement('div');
      tile.className = `wordle-tile wordle-${color}`;
      tile.textContent = result.word[i] || '';
      tile.style.animationDelay = `${i * 80}ms`;
      row.appendChild(tile);
    });

    const meta = document.createElement('div');
    meta.className = 'wordle-meta';
    const icon = colorCounts.green > 2 ? '🔥' : colorCounts.yellow > 2 ? '⚡' : '💢';
    meta.innerHTML = `<span class="wordle-vs">VS</span><span class="wordle-target">${result.targetWord}</span>
                      <span class="wordle-dmg">${icon} -${result.damage}</span>`;
    row.appendChild(meta);

    this.$wordleHistory.prepend(row);

    // Trim history display to last 4 rows
    while (this.$wordleHistory.children.length > 4) {
      this.$wordleHistory.removeChild(this.$wordleHistory.lastChild);
    }
  }

  // ── Battle Log ────────────────────────────────────────────────────────────
  addLog(msg, type = '') {
    const el = document.createElement('div');
    el.className = `log-entry ${type}`;
    el.textContent = msg;
    this.$battleLog.prepend(el);
    if (this.$battleLog.children.length > 4)
      this.$battleLog.removeChild(this.$battleLog.lastChild);
  }

  // ── Floating Damage Numbers ───────────────────────────────────────────────
  showDamageFloat(amount, isPlayer = false) {
    const el = document.createElement('div');
    el.className = isPlayer ? 'float-dmg player-dmg' : 'float-dmg enemy-dmg';
    el.textContent = isPlayer ? `-${amount} HP` : `-${amount}`;
    const target = isPlayer
      ? document.getElementById('player-hud')
      : document.getElementById('enemy-section');
    target.appendChild(el);
    setTimeout(() => el.remove(), 1200);
  }

  // ── Overlay (game over / victory / new enemy) ─────────────────────────────
  showOverlay(title, msg, btnText, callback) {
    this.$overlayTitle.textContent = title;
    this.$overlayMsg.textContent = msg;
    this.$overlayBtn.textContent = btnText;
    this.$overlayBtn.onclick = () => {
      this.$overlay.classList.remove('active');
      callback();
    };
    this.$overlay.classList.add('active');
  }

  hideOverlay() {
    this.$overlay.classList.remove('active');
  }

  // ── Enemy shake on hit ────────────────────────────────────────────────────
  shakeEnemy() {
    this.$enemySprite.classList.remove('shake');
    void this.$enemySprite.offsetWidth; // reflow
    this.$enemySprite.classList.add('shake');
    setTimeout(() => this.$enemySprite.classList.remove('shake'), 400);
  }

  // ── Player flash on damage ────────────────────────────────────────────────
  flashPlayer() {
    const hud = document.getElementById('player-hud');
    hud.classList.add('flash-red');
    setTimeout(() => hud.classList.remove('flash-red'), 500);
  }
}
