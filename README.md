# 🐛 BookWordle

> A pixel-art word RPG — spell words from a letter grid to attack enemies, with every strike scored like a Wordle board.

![Game Preview](docs/preview.png)

---

## 🎮 How to Play

1. **Select letters** on the 6×6 grid by clicking adjacent tiles (including diagonals).
2. **Spell a valid word** (3–6 letters) — the longer, the better.
3. Hit **ATTACK!** — your word is compared against a hidden target word in a **Wordle-style matchup**:
   - 🟩 **Green** tile = correct letter, correct position → **28 damage**
   - 🟨 **Yellow** tile = correct letter, wrong position → **12 damage**
   - ⬛ **Gray** tile = letter not in target → **3 damage**
4. The enemy **counter-attacks** after each of your turns.
5. Defeat all **5 enemies** to win!

### 🔥 Fire Tiles
Some tiles glow orange — using one in your word grants a **1.5× damage multiplier**.

---

## 📁 Folder Structure

```
BookWordle/
├── index.html              # Game entry point
├── README.md
├── .gitignore
│
├── css/
│   └── style.css           # Pixel-art theme & all game styles
│
├── js/
│   ├── words.js            # Dictionary, valid word set, target word pools
│   ├── board.js            # 6×6 letter grid logic, tile selection, gravity
│   ├── battle.js           # Enemy stats, Wordle comparison, damage calc
│   ├── ui.js               # DOM rendering, animations, HP bars, overlays
│   └── main.js             # Game controller, event wiring, game loop
│
├── assets/
│   ├── sprites/            # (future) Enemy & player sprite sheets
│   ├── audio/              # (future) SFX and BGM
│   └── fonts/              # (future) Local fallback pixel fonts
│
└── docs/
    ├── preview.png         # Screenshot for README
    └── DESIGN.md           # Game design notes & roadmap
```

---

## 🚀 Running Locally

No build step required — it's pure HTML/CSS/JS.

```bash
git clone https://github.com/lazhttp/BookWordle.git
cd BookWordle

# Option A: open directly
open index.html

# Option B: local dev server (avoids any CORS quirks)
npx serve .
# or
python3 -m http.server 8080
```

## 📤 Push to GitHub

```bash
git init
git add .
git commit -m "initial commit: BookWordle"
git remote add origin https://github.com/lazhttp/BookWordle.git
git push -u origin main
```

---

## ⚔️ Enemies

| # | Name          | HP  | ATK       |
|---|---------------|-----|-----------|
| 1 | LEXIVORE      | 100 | 8–14      |
| 2 | SYLLABEAST    | 160 | 10–18     |
| 3 | GRAMMARGOYLE  | 220 | 14–22     |
| 4 | VOCALISK      | 300 | 16–26     |
| 5 | THE LEXICON   | 400 | 20–32 👑  |

---

## 🗺️ Roadmap

- [ ] Sound effects & chiptune BGM
- [ ] Animated pixel sprite sheets
- [ ] Score / high-score tracking (localStorage)
- [ ] Poison & ice tile variants
- [ ] Mobile touch drag-to-select
- [ ] Multiple difficulty modes
- [ ] Boss special attacks

---

## 🛠️ Tech Stack

- Vanilla HTML5 / CSS3 / JavaScript (ES6+)
- [Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P) font (Google Fonts)
- No frameworks, no build tools

---

## 📄 License

MIT — do whatever you want with it.
