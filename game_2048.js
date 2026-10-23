/**
 * ============================================================================
 * 2048 NUMBER MERGE PUZZLE ENGINE
 * 4x4 Sliding Grid, Merge Physics, Score Tracking & Win/Loss Detection
 * ============================================================================
 */

class Game2048Engine {
  constructor() {
    this.size = 4;
    this.score = 0;
    this.bestScore = parseInt(localStorage.getItem('2048_BEST_SCORE') || '0', 10);
    this.won = false;
    this.over = false;
    this.keepPlaying = false;
    this.grid = this.getEmptyGrid();
    this.history = [];
    this.init();
  }

  getEmptyGrid() {
    return Array.from({ length: this.size }, () => Array(this.size).fill(0));
  }

  init() {
    this.grid = this.getEmptyGrid();
    this.score = 0;
    this.won = false;
    this.over = false;
    this.keepPlaying = false;
    this.history = [];
    this.addRandomTile();
    this.addRandomTile();
  }

  addRandomTile() {
    const emptyCells = [];
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (this.grid[r][c] === 0) emptyCells.push({ r, c });
      }
    }
    if (emptyCells.length === 0) return false;
    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    this.grid[randomCell.r][randomCell.c] = Math.random() < 0.9 ? 2 : 4;
    return true;
  }

  saveHistory() {
    const copy = this.grid.map(row => [...row]);
    this.history.push({ grid: copy, score: this.score });
    if (this.history.length > 10) this.history.shift();
  }

  undo() {
    if (this.history.length === 0) return false;
    const prev = this.history.pop();
    this.grid = prev.grid;
    this.score = prev.score;
    this.over = false;
    return true;
  }

  move(direction) {
    // 0: up, 1: right, 2: down, 3: left
    if (this.over) return { moved: false };

    this.saveHistory();
    let rotated = this.grid.map(row => [...row]);

    // Normalize all directions to left move
    if (direction === 0) rotated = this.rotate(rotated, 3); // Up -> rotate 270
    if (direction === 1) rotated = this.rotate(rotated, 2); // Right -> rotate 180
    if (direction === 2) rotated = this.rotate(rotated, 1); // Down -> rotate 90

    let moved = false;
    let scoreGain = 0;

    for (let r = 0; r < this.size; r++) {
      const row = rotated[r].filter(val => val !== 0);
      const newRow = [];

      for (let c = 0; c < row.length; c++) {
        if (c + 1 < row.length && row[c] === row[c + 1]) {
          const merged = row[c] * 2;
          newRow.push(merged);
          scoreGain += merged;
          if (merged === 2048 && !this.won) this.won = true;
          c++; // Skip next
        } else {
          newRow.push(row[c]);
        }
      }

      while (newRow.length < this.size) newRow.push(0);

      for (let c = 0; c < this.size; c++) {
        if (rotated[r][c] !== newRow[c]) moved = true;
      }
      rotated[r] = newRow;
    }

    // Un-rotate
    if (direction === 0) rotated = this.rotate(rotated, 1);
    if (direction === 1) rotated = this.rotate(rotated, 2);
    if (direction === 2) rotated = this.rotate(rotated, 3);

    if (moved) {
      this.grid = rotated;
      this.score += scoreGain;
      if (this.score > this.bestScore) {
        this.bestScore = this.score;
        localStorage.setItem('2048_BEST_SCORE', this.bestScore.toString());
      }
      this.addRandomTile();

      if (!this.movesAvailable()) {
        this.over = true;
      }

      return {
        moved: true,
        scoreGain: scoreGain,
        won: this.won && !this.keepPlaying,
        over: this.over
      };
    } else {
      this.history.pop(); // Remove redundant snapshot
      return { moved: false };
    }
  }

  rotate(matrix, times) {
    let result = matrix.map(row => [...row]);
    for (let t = 0; t < times; t++) {
      const N = result.length;
      const next = Array.from({ length: N }, () => Array(N).fill(0));
      for (let r = 0; r < N; r++) {
        for (let c = 0; c < N; c++) {
          next[c][N - 1 - r] = result[r][c];
        }
      }
      result = next;
    }
    return result;
  }

  movesAvailable() {
    // Check for any empty cell
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (this.grid[r][c] === 0) return true;
        // Check adjacent horizontal
        if (c + 1 < this.size && this.grid[r][c] === this.grid[r][c + 1]) return true;
        // Check adjacent vertical
        if (r + 1 < this.size && this.grid[r][c] === this.grid[r + 1][c]) return true;
      }
    }
    return false;
  }
}

window.Game2048Engine = Game2048Engine;
