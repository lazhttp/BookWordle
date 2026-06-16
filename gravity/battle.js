// battle.js — Combat engine & Wordle comparison for BookWordle

const TILE_DAMAGE = { green: 28, yellow: 12, gray: 3 };

const ENEMIES = [
  { name: 'LEXIVORE',    maxHp: 100, sprite: 0, atk: [8, 14],  level: 1 },
  { name: 'SYLLABEAST',  maxHp: 160, sprite: 1, atk: [10, 18], level: 2 },
  { name: 'GRAMMARGOYLE',maxHp: 220, sprite: 2, atk: [14, 22], level: 3 },
  { name: 'VOCALISK',    maxHp: 300, sprite: 3, atk: [16, 26], level: 4 },
  { name: 'THE LEXICON', maxHp: 400, sprite: 4, atk: [20, 32], level: 5 },
];

class Enemy {
  constructor(index) {
    const template = ENEMIES[Math.min(index, ENEMIES.length - 1)];
    this.name = template.name;
    this.maxHp = template.maxHp;
    this.hp = template.maxHp;
    this.sprite = template.sprite;
    this.atk = template.atk;    // [min, max]
    this.level = template.level;
    this.index = index;
  }

  takeDamage(amount) {
    this.hp = Math.max(0, this.hp - amount);
  }

  isDead() { return this.hp <= 0; }

  // Returns damage dealt to player
  attack() {
    const [min, max] = this.atk;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}

// ─── Wordle-style comparison ─────────────────────────────────────────────────
// Returns array of 'green' | 'yellow' | 'gray' for each letter of `guess`
// Target word is padded/truncated to match guess length
function compareWords(guess, target) {
  const g = guess.toUpperCase();
  const t = target.toUpperCase().padEnd(g.length, ' ');
  const result = Array(g.length).fill('gray');
  const targetCount = {};

  for (const ch of t) {
    if (ch !== ' ') targetCount[ch] = (targetCount[ch] || 0) + 1;
  }

  // Pass 1: exact matches
  for (let i = 0; i < g.length; i++) {
    if (g[i] === t[i]) {
      result[i] = 'green';
      targetCount[g[i]]--;
    }
  }

  // Pass 2: wrong position
  for (let i = 0; i < g.length; i++) {
    if (result[i] !== 'green' && (targetCount[g[i]] || 0) > 0) {
      result[i] = 'yellow';
      targetCount[g[i]]--;
    }
  }

  return result;
}

function calculateDamage(tileColors, hasFireBonus) {
  let dmg = tileColors.reduce((sum, color) => sum + TILE_DAMAGE[color], 0);
  // Word length bonus — anything over 4 letters gets extra
  if (tileColors.length >= 5) dmg += (tileColors.length - 4) * 8;
  if (tileColors.length >= 7) dmg += 20;  // big word bonus
  if (hasFireBonus) dmg = Math.ceil(dmg * 1.5);
  return dmg;
}

class Battle {
  constructor() {
    this.enemyIndex = 0;
    this.enemy = new Enemy(0);
    this.playerMaxHp = 100;
    this.playerHp = 100;
    this.attackHistory = [];   // { word, targetWord, tiles, damage, turn }
    this.turn = 0;
    this.gameOver = false;
    this.won = false;
  }

  get currentEnemy() { return this.enemy; }

  // Process player's submitted word; returns result object
  processPlayerAttack(word, hasFireBonus) {
    const targetWord = getTargetWord(word.length);
    const tiles = compareWords(word, targetWord);
    const damage = calculateDamage(tiles, hasFireBonus);

    this.enemy.takeDamage(damage);
    this.turn++;

    const result = {
      word: word.toUpperCase(),
      targetWord,
      tiles,
      damage,
      enemyDied: this.enemy.isDead(),
      turn: this.turn,
    };

    this.attackHistory.push(result);
    return result;
  }

  // Enemy counter-attack; returns damage to player
  processEnemyAttack() {
    if (this.enemy.isDead()) return 0;
    const dmg = this.enemy.attack();
    this.playerHp = Math.max(0, this.playerHp - dmg);
    if (this.playerHp <= 0) {
      this.gameOver = true;
      this.won = false;
    }
    return dmg;
  }

  advanceEnemy() {
    this.enemyIndex++;
    if (this.enemyIndex >= ENEMIES.length) {
      this.gameOver = true;
      this.won = true;
      return false;
    }
    this.enemy = new Enemy(this.enemyIndex);
    this.attackHistory = [];
    this.turn = 0;
    return true;
  }

  healPlayer(amount) {
    this.playerHp = Math.min(this.playerMaxHp, this.playerHp + amount);
  }
}
