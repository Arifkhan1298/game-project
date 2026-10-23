# STRATEGY GAME PORTAL — ULTIMATE EDITION
### Premium Strategy Gaming Platform | Production-Quality Architecture | Zero-Dependency Client Execution

> **Tagline:** *THINK SMART. PLAY STRATEGIC. DOMINATE THE BOARD.*

---

## 1. Project Overview

**STRATEGY GAME PORTAL** is an authoritative, AAA-inspired web gaming platform engineered to deliver authentic tactical gameplay. Built entirely with native web technologies, the portal features six complete games, deep algorithmic AI opponents, verified career progression, persistent local storage, tournament bracket simulations, and rich audio synthesis.

Every game adheres to its official competitive ruleset without superficial mockups or fabricated data.

---

## 2. Key Features

- **Six Authoritative Games:**
  - **Standard Chess:** Complete FIDE-standard rules (legal moves, captures, check/checkmate detection, stalemate, castling, en passant, pawn promotion modal, 50-move rule, threefold repetition, algebraic notation log).
  - **Tic-Tac-Toe:** Classical 3×3 grid with an optimal, unyielding Minimax AI and winning line highlight.
  - **Connect Four:** 7-column × 6-row board with gravity physics, 4-in-a-row detection in all directions, and alpha-beta pruned minimax AI.
  - **Reversi / Othello:** 8×8 battlefield with legal flip detection, automatic turn passing, positional matrix AI, and mobility scoring.
  - **Minesweeper:** Beginner (9×9, 10 mines), Intermediate (16×16, 40 mines), and Expert (30×16, 99 mines) with guaranteed safe first click (3×3 safe zone), flood-fill cascade, and LED counters.
  - **Memory Match:** Shuffled relic pairs with 3D card flips, move counting, timer, and difficulty modes (12, 16, 24 cards).

- **Unified AI Arena:**
  - **Easy (Novice):** Opportunistic and friendly heuristics.
  - **Medium (Tactician):** 2-ply evaluation with tactical capture ordering and position bonuses.
  - **Hard (Master AI):** Deep Minimax with Alpha-Beta Pruning, piece-square tables (PST), and mobility weighting.
  - Non-blocking asynchronous calculation that keeps the UI smooth and responsive.

- **Verified Career Progression & Storage:**
  - Deterministic XP and leveling system (`Level = floor(XP / 250) + 1`).
  - Ten verifiable achievements with reward XP and real unlock timestamps.
  - Daily tactical challenges with progress tracking and XP claiming.
  - Local accounts with hashed password protection and guest mode.
  - State persistence for **"Continue Playing"** saved games.
  - Authentic leaderboards (Top XP, Most Victories, Win Rate).

- **Visual & Audio Excellence:**
  - Deep Midnight Black (`#0a0d14`) and Refined Gold (`#d4af37`) design system.
  - Restrained glassmorphism, responsive CSS grid layouts, and high-contrast typography (`Outfit`, `Inter`).
  - Procedural Web Audio API sound synthesis (zero external audio files needed; 100% offline-ready).
  - Dark and Light themes with reduced-motion support.

---

## 3. Technology Stack

- **Core Framework:** Vanilla HTML5, CSS3 Variables, Modern JavaScript (ES6+ Classes).
- **Audio Synthesizer:** Web Audio API (`SoundEngine` oscillator/gain synthesis).
- **State & Data Layer:** HTML5 `localStorage` with JSON serialization and deterministic hashing.
- **AI Engines:** Minimax with Alpha-Beta Pruning, Piece-Square Tables (PST), and Positional Matrix evaluation.
- **Dependencies:** **Zero external npm packages or CDNs required.** The portal is completely self-contained and operates 100% offline.

---

## 4. File Structure

All project files reside in the root directory:

```
c:\Users\Naveedkhan\Desktop\game\
├── index.html       # Complete application interface (all 15 views, modals, game shell)
├── style.css        # Comprehensive design system, theme tokens, and component styling
├── app.js           # Central controller, SPA routing, game shell, and event handlers
├── chess.js         # Authoritative FIDE standard chess engine
├── tictactoe.js     # Tic-Tac-Toe engine with Minimax AI
├── connect4.js      # Connect Four engine with gravity physics and alpha-beta AI
├── reversi.js       # Reversi / Othello engine with disc flipping and matrix AI
├── minesweeper.js   # Minesweeper engine with safe first click and flood fill
├── memory.js        # Memory Match engine with shuffled decks and 3D card state
├── ai.js            # Strategy AI Arena coordinator and Chess evaluator
├── audio.js         # Procedural Web Audio API sound effects engine
├── storage.js       # Progression, authentication, stats, and achievements layer
├── test_runner.js   # Automated test suite (60 unit & integration tests)
├── tests.html       # Dedicated test harness dashboard
└── README.md        # Technical documentation and launch instructions
```

---

## 5. How to Launch & Play

### Immediate Local Launch (No Server Required)
Simply double-click `index.html` or open it directly in any modern web browser:
- Google Chrome
- Microsoft Edge
- Mozilla Firefox
- Apple Safari

### Running the Automated Test Suite
- **In-App:** Open `index.html`, click **Test Suite** in the left sidebar, and click **Run All 60 Tests**.
- **Standalone:** Open `tests.html` directly in your browser to run all 60 tests and view detailed pass/fail assertions.

---

## 6. Testing & Quality Assurance

The test harness executes **60 rigorous unit & integration tests**:
- **Legal Move Verification:** Chess rejects all moves that leave the king in check; Connect Four rejects full columns; Reversi highlights only moves that produce disc flips.
- **First Click Safety:** In Minesweeper, mines are generated strictly after the initial click, guaranteeing that the target and its surrounding 8 cells contain no mines.
- **Persistence Verification:** Refreshing the browser preserves active guest or registered accounts, career XP, achievements, and active saved matches.
- **Accessibility:** Full keyboard focus states, semantic heading hierarchy, and `prefers-reduced-motion` compliance.

---

## 7. Security Notes

- User passwords for local profiles are salted and hashed client-side before being written to localStorage.
- No sensitive credentials or API keys are exposed or required.
- All game moves are validated authoritatively in engine code before state mutation.
