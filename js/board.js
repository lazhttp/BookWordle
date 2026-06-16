// board.js — Letter grid logic for BookWordle

const LETTER_WEIGHTS = {
  A:9,B:2,C:3,D:4,E:13,F:2,G:2,H:6,I:7,J:1,
  K:1,L:4,M:2,N:7,O:8,P:2,Q:1,R:6,S:6,T:9,
  U:3,V:1,W:2,X:1,Y:2,Z:1
};

const VOWELS = new Set(['A','E','I','O','U']);

// Build weighted letter pool
const LETTER_POOL = [];
for (const [letter, weight] of Object.entries(LETTER_WEIGHTS)) {
  for (let i = 0; i < weight; i++) LETTER_POOL.push(letter);
}

class Tile {
  constructor(row, col) {
    this.row = row;
    this.col = col;
    this.letter = '';
    this.isSelected = false;
    this.isOnFire = false;   // fire tile: bonus damage multiplier
    this.isPoison = false;   // poison tile: deals chip damage to player (future)
    this.element = null;     // DOM reference
  }

  setLetter(letter) {
    this.letter = letter;
    this.isOnFire = Math.random() < 0.06;  // 6% fire chance
    this.isPoison = false;
  }

  reset() {
    this.isSelected = false;
    this.isOnFire = false;
    this.isPoison = false;
  }
}

class Board {
  constructor(rows = 6, cols = 6) {
    this.rows = rows;
    this.cols = cols;
    this.grid = [];
    this.selection = [];    // ordered list of selected Tile objects
    this._init();
  }

  _init() {
    for (let r = 0; r < this.rows; r++) {
      this.grid[r] = [];
      for (let c = 0; c < this.cols; c++) {
        const tile = new Tile(r, c);
        tile.setLetter(this._randomLetter());
        this.grid[r][c] = tile;
      }
    }
    this._ensureVowels();
  }

  _randomLetter() {
    return LETTER_POOL[Math.floor(Math.random() * LETTER_POOL.length)];
  }

  // Make sure at least 20% of the board is vowels
  _ensureVowels() {
    const total = this.rows * this.cols;
    const minVowels = Math.floor(total * 0.20);
    let vowelCount = 0;
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (VOWELS.has(this.grid[r][c].letter)) vowelCount++;
      }
    }
    while (vowelCount < minVowels) {
      const r = Math.floor(Math.random() * this.rows);
      const c = Math.floor(Math.random() * this.cols);
      if (!VOWELS.has(this.grid[r][c].letter)) {
        const vowels = ['A','E','I','O','U'];
        this.grid[r][c].setLetter(vowels[Math.floor(Math.random() * vowels.length)]);
        vowelCount++;
      }
    }
  }

  getTile(row, col) {
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return null;
    return this.grid[row][col];
  }

  isAdjacent(tileA, tileB) {
    return Math.abs(tileA.row - tileB.row) <= 1 &&
           Math.abs(tileA.col - tileB.col) <= 1 &&
           !(tileA.row === tileB.row && tileA.col === tileB.col);
  }

  canSelect(tile) {
    if (tile.isSelected) return false;
    if (this.selection.length === 0) return true;
    const last = this.selection[this.selection.length - 1];
    return this.isAdjacent(last, tile);
  }

  selectTile(tile) {
    if (!this.canSelect(tile)) return false;
    tile.isSelected = true;
    this.selection.push(tile);
    return true;
  }

  deselectLast() {
    const tile = this.selection.pop();
    if (tile) tile.isSelected = false;
  }

  clearSelection() {
    for (const tile of this.selection) tile.isSelected = false;
    this.selection = [];
  }

  getSelectedWord() {
    return this.selection.map(t => t.letter).join('');
  }

  hasFireInSelection() {
    return this.selection.some(t => t.isOnFire);
  }

  // Remove used tiles; drop columns down; fill empties from top
  consumeSelection() {
    const used = new Set(this.selection.map(t => `${t.row},${t.col}`));
    this.selection = [];

    for (let c = 0; c < this.cols; c++) {
      // Collect non-used tiles in column, bottom to top
      const remaining = [];
      for (let r = this.rows - 1; r >= 0; r--) {
        const tile = this.grid[r][c];
        if (!used.has(`${r},${c}`)) {
          tile.isSelected = false;
          remaining.push(tile.letter);
          remaining.push(tile.isOnFire);
        }
      }
      // Place them back from the bottom
      let idx = 0;
      for (let r = this.rows - 1; r >= 0; r--) {
        const tile = this.grid[r][c];
        if (idx < remaining.length) {
          tile.letter = remaining[idx * 2];
          tile.isOnFire = remaining[idx * 2 + 1];
          tile.isSelected = false;
          idx++;
        } else {
          // New tile from top
          tile.reset();
          tile.setLetter(this._randomLetter());
        }
      }
    }
  }
}
