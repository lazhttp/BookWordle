# WordWorm Battle — Design Notes

## Core Loop

```
Player selects letters (adjacent tiles)
        ↓
Submits valid word (≥ 3 letters)
        ↓
Word is compared to hidden target (Wordle rules)
        ↓
Damage calculated from tile colors
  Green  → 28 dmg  (right letter, right spot)
  Yellow → 12 dmg  (right letter, wrong spot)
  Gray   →  3 dmg  (letter not in target)
        ↓
Enemy counter-attacks with flat damage roll
        ↓
Repeat until one side reaches 0 HP
        ↓
On enemy death → small heal + next enemy
On player death → Game Over
```

---

## Damage Formula

```
base_dmg = sum(tile_color_values)
length_bonus = max(0, word_length - 4) * 8
big_word_bonus = word_length >= 7 ? 20 : 0
fire_multiplier = has_fire_tile ? 1.5 : 1.0

final_dmg = ceil((base_dmg + length_bonus + big_word_bonus) * fire_multiplier)
```

---

## Tile Types (current)

| Type    | Visual         | Effect                       |
|---------|----------------|------------------------------|
| Normal  | Dark blue tile | Standard letter              |
| 🔥 Fire | Orange glow    | ×1.5 damage multiplier       |

### Planned Tile Types

| Type    | Visual       | Effect                                  |
|---------|--------------|-----------------------------------------|
| ☠ Poison | Purple glow | Deals 5 chip damage to player each turn  |
| ❄ Ice   | Cyan glow    | Freezes enemy (skip their counter-attack)|
| ⭐ Gold  | Gold glow    | 2× score multiplier                     |
| 🔒 Lock  | Gray locked  | Must be used in current word or it breaks|

---

## Enemy Design

Each enemy has a hidden **target word pool** matched to the player's word length.
The secret word is randomly drawn each attack, creating variance in Wordle outcomes.

Future: enemies could have **resistances** (e.g., GRAMMARGOYLE takes half damage from gray tiles)
or **abilities** (e.g., VOCALISK shuffles the board every 3 turns).

---

## Future Systems

### Score System
- Base score per word = damage dealt
- Combo multiplier for consecutive words with ≥ 1 green tile
- High score saved to localStorage

### Mobile Touch Input
- Replace click-per-tile with touch-drag across tiles
- Lift finger = submit word

### Audio
- Chiptune BGM loop per enemy
- SFX: tile click, word submit, damage hit, enemy death, game over

### Difficulty Modes
| Mode    | Enemy HP | Enemy ATK | Fire Tile Rate |
|---------|----------|-----------|----------------|
| Casual  | ×0.7     | ×0.6      | 10%            |
| Normal  | ×1.0     | ×1.0      | 6%             |
| Hard    | ×1.4     | ×1.5      | 3%             |
| Cursed  | ×2.0     | ×2.0      | 1%             |
