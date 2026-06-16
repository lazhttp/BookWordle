// main.js — Game controller for BookWordle

class Game {
  constructor() {
    this.board   = new Board(6, 6);
    this.battle  = new Battle();
    this.ui      = new UI(this);
    this.busy    = false;   // lock input during animations
  }

  init() {
    this.ui.renderGrid(this.board);
    this.ui.renderEnemy(this.battle.currentEnemy);
    this.ui.updatePlayerHp(this.battle.playerHp, this.battle.playerMaxHp);
    this.ui.addLog('▶ A new battle begins!', 'log-info');
    this.ui.addLog(`⟨ ${this.battle.currentEnemy.name} ⟩ appears!`, 'log-enemy');

    document.getElementById('submit-btn').addEventListener('click', () => this.handleSubmit());
    document.getElementById('clear-btn').addEventListener('click', () => this.handleClear());
  }

  // ── Tile Click ────────────────────────────────────────────────────────────
  handleTileClick(row, col) {
    if (this.busy) return;
    const tile = this.board.getTile(row, col);
    if (!tile) return;

    // If clicking last selected tile — deselect it
    const sel = this.board.selection;
    if (sel.length > 0 && sel[sel.length - 1] === tile) {
      this.board.deselectLast();
    } else {
      this.board.selectTile(tile);
    }

    this.ui.updateTileVisuals(this.board);
    this.ui.updateWordDisplay(this.board.getSelectedWord());
  }

  // ── Submit Word ────────────────────────────────────────────────────────────
  async handleSubmit() {
    if (this.busy) return;
    const word = this.board.getSelectedWord();
    if (!isValidWord(word) || word.length < 3) return;

    this.busy = true;
    const hasFireBonus = this.board.hasFireInSelection();

    // 1. Consume tiles & re-render grid
    this.board.consumeSelection();
    this.ui.renderGrid(this.board);
    this.ui.updateWordDisplay('');
    this.ui.updateEnemyHp(this.battle.currentEnemy.hp, this.battle.currentEnemy.maxHp);

    // 2. Process attack
    const result = this.battle.processPlayerAttack(word, hasFireBonus);

    // 3. Show Wordle row (animated tiles)
    this.ui.addWordleRow(result);
    await delay(result.tiles.length * 80 + 300);

    // 4. Apply damage visuals
    this.ui.shakeEnemy();
    this.ui.showDamageFloat(result.damage, false);
    this.ui.updateEnemyHp(this.battle.currentEnemy.hp, this.battle.currentEnemy.maxHp);

    const greenCount = result.tiles.filter(c => c === 'green').length;
    const logType = greenCount >= 3 ? 'log-good' : greenCount >= 1 ? 'log-neutral' : 'log-bad';
    const fireTag = hasFireBonus ? ' 🔥' : '';
    this.ui.addLog(`"${word}" dealt ${result.damage} dmg!${fireTag}`, logType);

    await delay(500);

    // 5. Check enemy death
    if (result.enemyDied) {
      await this._enemyDefeated();
      this.busy = false;
      return;
    }

    // 6. Enemy counter-attack
    await delay(300);
    const enemyDmg = this.battle.processEnemyAttack();
    this.ui.showDamageFloat(enemyDmg, true);
    this.ui.flashPlayer();
    this.ui.updatePlayerHp(this.battle.playerHp, this.battle.playerMaxHp);
    this.ui.addLog(`${this.battle.currentEnemy.name} attacks for ${enemyDmg}!`, 'log-enemy');

    await delay(400);

    // 7. Check player death
    if (this.battle.gameOver && !this.battle.won) {
      await delay(200);
      this.ui.showOverlay(
        'GAME OVER',
        `You were defeated by ${this.battle.currentEnemy.name}.\nWords spoken: ${this.battle.turn}`,
        '▶ PLAY AGAIN',
        () => this._restart()
      );
    }

    this.busy = false;
  }

  async _enemyDefeated() {
    this.ui.addLog(`${this.battle.currentEnemy.name} defeated!`, 'log-good');

    // Small heal on kill
    const healAmt = 10;
    this.battle.healPlayer(healAmt);
    this.ui.updatePlayerHp(this.battle.playerHp, this.battle.playerMaxHp);
    this.ui.addLog(`Restored ${healAmt} HP!`, 'log-good');

    await delay(600);

    const hasNext = this.battle.advanceEnemy();
    if (!hasNext) {
      // Victory!
      this.ui.showOverlay(
        '✦ VICTORY! ✦',
        'You defeated all enemies and mastered the LEXICON!',
        '▶ PLAY AGAIN',
        () => this._restart()
      );
    } else {
      this.ui.showOverlay(
        'ENEMY SLAIN!',
        `A new challenger appears: ${this.battle.currentEnemy.name}`,
        '▶ CONTINUE',
        () => {
          this.ui.renderEnemy(this.battle.currentEnemy);
          this.ui.addLog(`⟨ ${this.battle.currentEnemy.name} ⟩ appears!`, 'log-enemy');
          this.busy = false;
        }
      );
    }
  }

  // ── Clear Selection ────────────────────────────────────────────────────────
  handleClear() {
    if (this.busy) return;
    this.board.clearSelection();
    this.ui.updateTileVisuals(this.board);
    this.ui.updateWordDisplay('');
  }

  _restart() {
    this.board   = new Board(6, 6);
    this.battle  = new Battle();
    this.ui.renderGrid(this.board);
    this.ui.renderEnemy(this.battle.currentEnemy);
    this.ui.updatePlayerHp(this.battle.playerHp, this.battle.playerMaxHp);
    this.ui.$wordleHistory.innerHTML = '';
    this.ui.$battleLog.innerHTML = '';
    this.ui.addLog('▶ A new battle begins!', 'log-info');
    this.ui.addLog(`⟨ ${this.battle.currentEnemy.name} ⟩ appears!`, 'log-enemy');
    this.busy = false;
  }
}

// ── Utility ───────────────────────────────────────────────────────────────────
function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── Boot ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const game = new Game();
  game.init();
});
