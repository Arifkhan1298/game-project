/**
 * ============================================================================
 * SUDOKU MASTER PUZZLE ENGINE
 * 9x9 Grid Generator, Difficulty Tuner, Conflict Validation & Solver
 * ============================================================================
 */

class SudokuEngine {
  constructor(difficulty = 'medium') {
    this.difficulty = difficulty;
    this.board = Array.from({ length: 9 }, () => Array(9).fill(0));
    this.solution = Array.from({ length: 9 }, () => Array(9).fill(0));
    this.initial = Array.from({ length: 9 }, () => Array(9).fill(false));
    this.notes = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => new Set()));
    this.mistakes = 0;
    this.maxMistakes = 3;
    this.gameOver = false;
    this.gameWon = false;
    this.startTime = Date.now();
    this.elapsedSeconds = 0;
    this.init(difficulty);
  }

  init(difficulty = this.difficulty) {
    this.difficulty = difficulty;
    this.mistakes = 0;
    this.gameOver = false;
    this.gameWon = false;
    this.notes = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => new Set()));
    this.startTime = Date.now();
    this.elapsedSeconds = 0;

    // Generate valid full solved board
    this.solution = Array.from({ length: 9 }, () => Array(9).fill(0));
    this.solve(this.solution, true);

    // Copy solution to board and punch holes according to difficulty
    this.board = this.solution.map(row => [...row]);
    this.initial = Array.from({ length: 9 }, () => Array(9).fill(true));

    let clues = 36;
    if (difficulty === 'easy') clues = 42;
    if (difficulty === 'hard') clues = 28;

    const holes = 81 - clues;
    let removed = 0;
    const cells = [];
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        cells.push({ r, c });
      }
    }
    // Shuffle
    for (let i = cells.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cells[i], cells[j]] = [cells[j], cells[i]];
    }

    for (let i = 0; i < holes && i < cells.length; i++) {
      const { r, c } = cells[i];
      this.board[r][c] = 0;
      this.initial[r][c] = false;
      removed++;
    }
  }

  solve(grid, randomize = false) {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (grid[r][c] === 0) {
          let nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
          if (randomize) {
            for (let i = nums.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [nums[i], nums[j]] = [nums[j], nums[i]];
            }
          }
          for (const num of nums) {
            if (this.isValidPlacement(grid, r, c, num)) {
              grid[r][c] = num;
              if (this.solve(grid, randomize)) return true;
              grid[r][c] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  isValidPlacement(grid, row, col, num) {
    for (let i = 0; i < 9; i++) {
      if (grid[row][i] === num) return false;
      if (grid[i][col] === num) return false;
    }
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        if (grid[startRow + r][startCol + c] === num) return false;
      }
    }
    return true;
  }

  setCell(r, c, val) {
    return this.setCellValue(r, c, val);
  }

  setCellValue(r, c, val) {
    if (this.initial[r][c] || this.gameOver || this.gameWon) return { success: false };

    // Clear notes for this cell
    this.notes[r][c].clear();

    const expected = this.solution[r][c];
    if (val !== 0 && val !== expected) {
      this.mistakes++;
      this.board[r][c] = val;
      if (this.mistakes >= this.maxMistakes) {
        this.gameOver = true;
      }
      return { success: true, mistake: true, mistakes: this.mistakes, gameOver: this.gameOver };
    }

    this.board[r][c] = val;
    this.checkWin();
    return { success: true, mistake: false, gameWon: this.gameWon };
  }

  toggleNote(r, c, val) {
    if (this.initial[r][c] || this.board[r][c] !== 0) return false;
    if (this.notes[r][c].has(val)) {
      this.notes[r][c].delete(val);
    } else {
      this.notes[r][c].add(val);
    }
    return true;
  }

  eraseCell(r, c) {
    if (this.initial[r][c] || this.gameOver || this.gameWon) return false;
    this.board[r][c] = 0;
    this.notes[r][c].clear();
    return true;
  }

  getHint(selectedR, selectedC) {
    if (this.gameOver || this.gameWon) return null;
    let target = null;
    if (selectedR !== null && selectedC !== null && !this.initial[selectedR][selectedC] && this.board[selectedR][selectedC] !== this.solution[selectedR][selectedC]) {
      target = { r: selectedR, c: selectedC };
    } else {
      const empty = [];
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (this.board[r][c] === 0 || this.board[r][c] !== this.solution[r][c]) {
            empty.push({ r, c });
          }
        }
      }
      if (empty.length > 0) {
        target = empty[Math.floor(Math.random() * empty.length)];
      }
    }

    if (target) {
      this.board[target.r][target.c] = this.solution[target.r][target.c];
      this.initial[target.r][target.c] = true; // Lock hint
      this.notes[target.r][target.c].clear();
      this.checkWin();
      return target;
    }
    return null;
  }

  checkWin() {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (this.board[r][c] !== this.solution[r][c]) {
          this.gameWon = false;
          return false;
        }
      }
    }
    this.gameWon = true;
    return true;
  }
}

window.SudokuEngine = SudokuEngine;
