/**
 * ============================================================================
 * STRATEGY GAME PORTAL — AUTHORITATIVE MINESWEEPER ENGINE
 * Beginner (9x9, 10), Intermediate (16x16, 40), Expert (30x16, 99)
 * Guaranteed Safe First Click (3x3 Safe Zone), Flood-Fill Reveal, Flagging, Timer
 * ============================================================================
 */

class MinesweeperEngine {
  constructor(difficulty = 'beginner') {
    this.difficulty = difficulty;
    this.setDifficulty(difficulty);
    this.reset();
  }

  static PRESETS = {
    beginner: { rows: 9, cols: 9, mines: 10 },
    intermediate: { rows: 16, cols: 16, mines: 40 },
    expert: { rows: 16, cols: 30, mines: 99 }
  };

  setDifficulty(diff) {
    this.difficulty = diff in MinesweeperEngine.PRESETS ? diff : 'beginner';
    const cfg = MinesweeperEngine.PRESETS[this.difficulty];
    this.rows = cfg.rows;
    this.cols = cfg.cols;
    this.totalMines = cfg.mines;
  }

  reset() {
    this.board = Array(this.rows).fill(null).map(() => 
      Array(this.cols).fill(null).map(() => ({
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        neighborCount: 0
      }))
    );
    this.firstClickMade = false;
    this.gameOver = false;
    this.gameWon = false;
    this.revealedCount = 0;
    this.flagsCount = 0;
    this.startTime = null;
    this.elapsedSeconds = 0;
  }

  placeMines(firstR, firstC) {
    let placed = 0;
    const safeCells = new Set();
    
    // Guarantee clicked cell and its 8 adjacent neighbors are 100% mine-free
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nr = firstR + dr;
        const nc = firstC + dc;
        if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols) {
          safeCells.add(`${nr},${nc}`);
        }
      }
    }

    while (placed < this.totalMines) {
      const r = Math.floor(Math.random() * this.rows);
      const c = Math.floor(Math.random() * this.cols);
      const key = `${r},${c}`;

      if (!safeCells.has(key) && !this.board[r][c].isMine) {
        this.board[r][c].isMine = true;
        placed++;
      }
    }

    // Compute neighbor counts for every cell
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (!this.board[r][c].isMine) {
          let count = 0;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              if (dr === 0 && dc === 0) continue;
              const nr = r + dr;
              const nc = c + dc;
              if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols) {
                if (this.board[nr][nc].isMine) count++;
              }
            }
          }
          this.board[r][c].neighborCount = count;
        }
      }
    }
  }

  revealCell(r, c) {
    if (this.gameOver || this.gameWon) return { success: false, error: 'Game over' };
    if (r < 0 || r >= this.rows || c < 0 || c >= this.cols) return { success: false, error: 'Out of bounds' };

    const cell = this.board[r][c];
    if (cell.isRevealed || cell.isFlagged) return { success: false, error: 'Cell already revealed or flagged' };

    // On first click, plant mines and start timer
    if (!this.firstClickMade) {
      this.firstClickMade = true;
      this.placeMines(r, c);
      this.startTime = Date.now();
    }

    // Clicked on a mine: Defeat
    if (cell.isMine) {
      this.gameOver = true;
      cell.isRevealed = true;
      this.revealAllMines();
      return {
        success: true,
        isMine: true,
        gameOver: true,
        gameWon: false,
        revealedCells: [{ r, c }]
      };
    }

    // Flood-fill reveal algorithm
    const newlyRevealed = [];
    const queue = [{ r, c }];
    cell.isRevealed = true;
    this.revealedCount++;
    newlyRevealed.push({ r, c, count: cell.neighborCount });

    while (queue.length > 0) {
      const current = queue.shift();
      const currCell = this.board[current.r][current.c];

      // If neighborCount is 0, auto-reveal adjacent cells
      if (currCell.neighborCount === 0) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const nr = current.r + dr;
            const nc = current.c + dc;
            if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols) {
              const neighbor = this.board[nr][nc];
              if (!neighbor.isRevealed && !neighbor.isFlagged && !neighbor.isMine) {
                neighbor.isRevealed = true;
                this.revealedCount++;
                newlyRevealed.push({ r: nr, c: nc, count: neighbor.neighborCount });
                if (neighbor.neighborCount === 0) {
                  queue.push({ r: nr, c: nc });
                }
              }
            }
          }
        }
      }
    }

    // Check Victory Condition: all non-mine cells revealed
    const totalSafeCells = (this.rows * this.cols) - this.totalMines;
    if (this.revealedCount === totalSafeCells) {
      this.gameWon = true;
      this.gameOver = true;
      // Auto flag remaining mines
      for (let cr = 0; cr < this.rows; cr++) {
        for (let cc = 0; cc < this.cols; cc++) {
          if (this.board[cr][cc].isMine) {
            this.board[cr][cc].isFlagged = true;
          }
        }
      }
    }

    return {
      success: true,
      isMine: false,
      gameOver: this.gameOver,
      gameWon: this.gameWon,
      revealedCells: newlyRevealed
    };
  }

  toggleFlag(r, c) {
    if (this.gameOver || this.gameWon) return { success: false, error: 'Game over' };
    if (r < 0 || r >= this.rows || c < 0 || c >= this.cols) return { success: false, error: 'Out of bounds' };

    const cell = this.board[r][c];
    if (cell.isRevealed) return { success: false, error: 'Cannot flag revealed cell' };

    cell.isFlagged = !cell.isFlagged;
    this.flagsCount += cell.isFlagged ? 1 : -1;

    return {
      success: true,
      r,
      c,
      isFlagged: cell.isFlagged,
      remainingMines: this.totalMines - this.flagsCount
    };
  }

  revealAllMines() {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.board[r][c].isMine) {
          this.board[r][c].isRevealed = true;
        }
      }
    }
  }

  getRemainingMines() {
    return Math.max(0, this.totalMines - this.flagsCount);
  }

  exportState() {
    return {
      difficulty: this.difficulty,
      rows: this.rows,
      cols: this.cols,
      totalMines: this.totalMines,
      firstClickMade: this.firstClickMade,
      gameOver: this.gameOver,
      gameWon: this.gameWon,
      revealedCount: this.revealedCount,
      flagsCount: this.flagsCount,
      elapsedSeconds: this.elapsedSeconds,
      board: this.board.map(row => row.map(cell => ({ ...cell })))
    };
  }

  loadState(saved) {
    if (!saved || !saved.board) return false;
    this.difficulty = saved.difficulty || 'beginner';
    this.rows = saved.rows;
    this.cols = saved.cols;
    this.totalMines = saved.totalMines;
    this.firstClickMade = saved.firstClickMade;
    this.gameOver = saved.gameOver;
    this.gameWon = saved.gameWon;
    this.revealedCount = saved.revealedCount || 0;
    this.flagsCount = saved.flagsCount || 0;
    this.elapsedSeconds = saved.elapsedSeconds || 0;
    this.board = saved.board.map(row => row.map(cell => ({ ...cell })));
    return true;
  }
}

// Global engine export
window.MinesweeperEngine = MinesweeperEngine;
