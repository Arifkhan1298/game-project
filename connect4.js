/**
 * ============================================================================
 * STRATEGY GAME PORTAL — AUTHORITATIVE CONNECT FOUR ENGINE
 * Standard 7-column x 6-row Board, Gravity Physics, 4-in-a-row Detection,
 * Alpha-Beta Minimax AI (Easy, Medium, Hard), Win Lines, State Persistence
 * ============================================================================
 */

class Connect4Engine {
  constructor() {
    this.ROWS = 6;
    this.COLS = 7;
    this.reset();
  }

  reset() {
    // 6 rows x 7 cols: row 0 is top, row 5 is bottom
    this.board = Array(this.ROWS).fill(null).map(() => Array(this.COLS).fill(null));
    this.turn = 'red'; // 'red' (human/Player 1) or 'yellow' (AI/Player 2)
    this.winner = null; // 'red', 'yellow', or 'draw'
    this.winningCells = null; // Array of { r, c }
    this.history = [];
    this.moveCount = 0;
  }

  getValidColumns(board = this.board) {
    const valid = [];
    for (let c = 0; c < this.COLS; c++) {
      if (board[0][c] === null) valid.push(c);
    }
    return valid;
  }

  getDropRow(col, board = this.board) {
    if (col < 0 || col >= this.COLS) return -1;
    for (let r = this.ROWS - 1; r >= 0; r--) {
      if (board[r][col] === null) return r;
    }
    return -1; // Column full
  }

  checkWinFromCell(r, c, player, board = this.board) {
    const directions = [
      [0, 1],  // Horizontal
      [1, 0],  // Vertical
      [1, 1],  // Diagonal down-right
      [1, -1]  // Diagonal down-left
    ];

    for (const [dr, dc] of directions) {
      const cells = [{ r, c }];
      // Check forward
      let step = 1;
      while (true) {
        const nr = r + dr * step;
        const nc = c + dc * step;
        if (nr >= 0 && nr < this.ROWS && nc >= 0 && nc < this.COLS && board[nr][nc] === player) {
          cells.push({ r: nr, c: nc });
          step++;
        } else {
          break;
        }
      }
      // Check backward
      step = 1;
      while (true) {
        const nr = r - dr * step;
        const nc = c - dc * step;
        if (nr >= 0 && nr < this.ROWS && nc >= 0 && nc < this.COLS && board[nr][nc] === player) {
          cells.push({ r: nr, c: nc });
          step++;
        } else {
          break;
        }
      }

      if (cells.length >= 4) {
        return cells.slice(0, 4);
      }
    }
    return null;
  }

  checkFullBoardWin(board = this.board) {
    for (let r = 0; r < this.ROWS; r++) {
      for (let c = 0; c < this.COLS; c++) {
        const player = board[r][c];
        if (player) {
          const winCells = this.checkWinFromCell(r, c, player, board);
          if (winCells) return { winner: player, cells: winCells };
        }
      }
    }
    // Check draw
    if (this.getValidColumns(board).length === 0) {
      return { winner: 'draw', cells: null };
    }
    return null;
  }

  makeMove(col) {
    if (this.winner !== null) return { success: false, error: 'Game is already over' };
    const r = this.getDropRow(col);
    if (r === -1) return { success: false, error: 'Column is full' };

    // Record for undo
    this.history.push({
      r,
      c: col,
      player: this.turn
    });

    this.board[r][col] = this.turn;
    this.moveCount++;

    const winCells = this.checkWinFromCell(r, col, this.turn);
    if (winCells) {
      this.winner = this.turn;
      this.winningCells = winCells;
    } else if (this.getValidColumns().length === 0) {
      this.winner = 'draw';
      this.winningCells = null;
    } else {
      this.turn = this.turn === 'red' ? 'yellow' : 'red';
    }

    return {
      success: true,
      row: r,
      col: col,
      player: this.board[r][col],
      winner: this.winner,
      winningCells: this.winningCells,
      isOver: this.winner !== null
    };
  }

  undo() {
    if (this.history.length === 0) return false;
    const last = this.history.pop();
    this.board[last.r][last.c] = null;
    this.turn = last.player;
    this.winner = null;
    this.winningCells = null;
    this.moveCount = Math.max(0, this.moveCount - 1);
    return true;
  }

  // --- AI Opponent with Minimax & Alpha-Beta Pruning ---

  getAIMove(difficulty = 'hard', aiPlayer = 'yellow') {
    const valid = this.getValidColumns();
    if (valid.length === 0) return null;

    const opponent = aiPlayer === 'red' ? 'yellow' : 'red';

    // Easy AI: Random moves with rare instant win capture
    if (difficulty === 'easy') {
      for (const col of valid) {
        const r = this.getDropRow(col);
        this.board[r][col] = aiPlayer;
        const win = this.checkWinFromCell(r, col, aiPlayer);
        this.board[r][col] = null;
        if (win) return col;
      }
      return valid[Math.floor(Math.random() * valid.length)];
    }

    // Medium AI: Immediate win or block, else depth 2 minimax
    if (difficulty === 'medium') {
      // 1. Win if possible
      for (const col of valid) {
        const r = this.getDropRow(col);
        this.board[r][col] = aiPlayer;
        const win = this.checkWinFromCell(r, col, aiPlayer);
        this.board[r][col] = null;
        if (win) return col;
      }
      // 2. Block opponent win
      for (const col of valid) {
        const r = this.getDropRow(col);
        this.board[r][col] = opponent;
        const oppWin = this.checkWinFromCell(r, col, opponent);
        this.board[r][col] = null;
        if (oppWin) return col;
      }

      // Minimax depth 2
      let bestScore = -Infinity;
      let bestMove = valid[0];
      // Prefer center
      const centerOrdered = [...valid].sort((a, b) => Math.abs(a - 3) - Math.abs(b - 3));
      for (const col of centerOrdered) {
        const r = this.getDropRow(col);
        this.board[r][col] = aiPlayer;
        const score = this.minimax(this.board, 2, -Infinity, Infinity, false, aiPlayer, opponent);
        this.board[r][col] = null;
        if (score > bestScore) {
          bestScore = score;
          bestMove = col;
        }
      }
      return bestMove;
    }

    // Hard AI: Minimax depth 5 with alpha-beta and position heuristics
    let bestScore = -Infinity;
    let bestMove = valid[0];
    const centerOrdered = [...valid].sort((a, b) => Math.abs(a - 3) - Math.abs(b - 3));

    for (const col of centerOrdered) {
      const r = this.getDropRow(col);
      this.board[r][col] = aiPlayer;
      const score = this.minimax(this.board, 4, -Infinity, Infinity, false, aiPlayer, opponent);
      this.board[r][col] = null;

      if (score > bestScore) {
        bestScore = score;
        bestMove = col;
      }
    }

    return bestMove;
  }

  evaluateWindow(window, player, opponent) {
    let score = 0;
    const playerCount = window.filter(c => c === player).length;
    const emptyCount = window.filter(c => c === null).length;
    const oppCount = window.filter(c => c === opponent).length;

    if (playerCount === 4) score += 1000;
    else if (playerCount === 3 && emptyCount === 1) score += 50;
    else if (playerCount === 2 && emptyCount === 2) score += 10;

    if (oppCount === 3 && emptyCount === 1) score -= 80;
    else if (oppCount === 2 && emptyCount === 2) score -= 15;

    return score;
  }

  scoreBoard(board, player, opponent) {
    let score = 0;

    // Center column preference
    const centerArray = [];
    for (let r = 0; r < this.ROWS; r++) {
      centerArray.push(board[r][3]);
    }
    const centerCount = centerArray.filter(c => c === player).length;
    score += centerCount * 6;

    // Horizontal
    for (let r = 0; r < this.ROWS; r++) {
      for (let c = 0; c < this.COLS - 3; c++) {
        const window = [board[r][c], board[r][c + 1], board[r][c + 2], board[r][c + 3]];
        score += this.evaluateWindow(window, player, opponent);
      }
    }

    // Vertical
    for (let c = 0; c < this.COLS; c++) {
      for (let r = 0; r < this.ROWS - 3; r++) {
        const window = [board[r][c], board[r + 1][c], board[r + 2][c], board[r + 3][c]];
        score += this.evaluateWindow(window, player, opponent);
      }
    }

    // Diagonal positive slope
    for (let r = 0; r < this.ROWS - 3; r++) {
      for (let c = 0; c < this.COLS - 3; c++) {
        const window = [board[r][c], board[r + 1][c + 1], board[r + 2][c + 2], board[r + 3][c + 3]];
        score += this.evaluateWindow(window, player, opponent);
      }
    }

    // Diagonal negative slope
    for (let r = 3; r < this.ROWS; r++) {
      for (let c = 0; c < this.COLS - 3; c++) {
        const window = [board[r][c], board[r - 1][c + 1], board[r - 2][c + 2], board[r - 3][c + 3]];
        score += this.evaluateWindow(window, player, opponent);
      }
    }

    return score;
  }

  minimax(board, depth, alpha, beta, isMaximizing, aiPlayer, opponent) {
    const outcome = this.checkFullBoardWin(board);
    if (outcome) {
      if (outcome.winner === aiPlayer) return 100000 + depth;
      if (outcome.winner === opponent) return -100000 - depth;
      if (outcome.winner === 'draw') return 0;
    }

    const validCols = this.getValidColumns(board);
    if (depth === 0 || validCols.length === 0) {
      return this.scoreBoard(board, aiPlayer, opponent);
    }

    const centerOrdered = [...validCols].sort((a, b) => Math.abs(a - 3) - Math.abs(b - 3));

    if (isMaximizing) {
      let maxScore = -Infinity;
      for (const col of centerOrdered) {
        const r = this.getDropRow(col, board);
        board[r][col] = aiPlayer;
        const score = this.minimax(board, depth - 1, alpha, beta, false, aiPlayer, opponent);
        board[r][col] = null;
        maxScore = Math.max(maxScore, score);
        alpha = Math.max(alpha, score);
        if (alpha >= beta) break;
      }
      return maxScore;
    } else {
      let minScore = Infinity;
      for (const col of centerOrdered) {
        const r = this.getDropRow(col, board);
        board[r][col] = opponent;
        const score = this.minimax(board, depth - 1, alpha, beta, true, aiPlayer, opponent);
        board[r][col] = null;
        minScore = Math.min(minScore, score);
        beta = Math.min(beta, score);
        if (alpha >= beta) break;
      }
      return minScore;
    }
  }

  exportState() {
    return {
      board: this.board.map(r => [...r]),
      turn: this.turn,
      winner: this.winner,
      winningCells: this.winningCells ? [...this.winningCells] : null,
      moveCount: this.moveCount
    };
  }

  loadState(saved) {
    if (!saved || !saved.board) return false;
    this.board = saved.board.map(r => [...r]);
    this.turn = saved.turn || 'red';
    this.winner = saved.winner || null;
    this.winningCells = saved.winningCells || null;
    this.moveCount = saved.moveCount || 0;
    this.history = [];
    return true;
  }
}

// Global engine export
window.Connect4Engine = Connect4Engine;
