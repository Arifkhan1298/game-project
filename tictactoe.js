/**
 * ============================================================================
 * STRATEGY GAME PORTAL — AUTHORITATIVE TIC-TAC-TOE ENGINE
 * Complete Rules: Win Detection, Draw Detection, Minimax AI (Optimal Play),
 * Winning Lines, State Persistence, and Undo Support
 * ============================================================================
 */

class TicTacToeEngine {
  constructor() {
    this.reset();
  }

  reset() {
    this.board = Array(9).fill(null); // Indices 0-8
    this.turn = 'X'; // 'X' always starts
    this.winner = null; // 'X', 'O', or 'draw'
    this.winningLine = null; // Array of 3 indices [a, b, c]
    this.history = []; // Array of previous board states
    this.moveCount = 0;
  }

  // Winning line combinations
  static WINNING_LINES = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
  ];

  getAvailableMoves(board = this.board) {
    const moves = [];
    for (let i = 0; i < 9; i++) {
      if (!board[i]) moves.push(i);
    }
    return moves;
  }

  checkWinner(board = this.board) {
    for (const [a, b, c] of TicTacToeEngine.WINNING_LINES) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return { winner: board[a], line: [a, b, c] };
      }
    }
    if (board.every(cell => cell !== null)) {
      return { winner: 'draw', line: null };
    }
    return null;
  }

  makeMove(index) {
    if (index < 0 || index > 8 || this.board[index] !== null || this.winner !== null) {
      return { success: false, error: 'Illegal move' };
    }

    // Save history for undo
    this.history.push({
      board: [...this.board],
      turn: this.turn,
      moveCount: this.moveCount
    });

    this.board[index] = this.turn;
    this.moveCount++;

    const outcome = this.checkWinner(this.board);
    if (outcome) {
      this.winner = outcome.winner;
      this.winningLine = outcome.line;
    } else {
      this.turn = this.turn === 'X' ? 'O' : 'X';
    }

    return {
      success: true,
      index: index,
      player: this.board[index],
      winner: this.winner,
      winningLine: this.winningLine,
      isOver: this.winner !== null
    };
  }

  undo() {
    if (this.history.length === 0) return false;
    const prev = this.history.pop();
    this.board = prev.board;
    this.turn = prev.turn;
    this.moveCount = prev.moveCount;
    this.winner = null;
    this.winningLine = null;
    return true;
  }

  // --- Minimax AI Implementation ---

  getAIMove(difficulty = 'hard', aiPlayer = 'O') {
    const humanPlayer = aiPlayer === 'X' ? 'O' : 'X';
    const available = this.getAvailableMoves();
    if (available.length === 0) return null;

    if (difficulty === 'easy') {
      // Friendly decisions / random
      const randIdx = Math.floor(Math.random() * available.length);
      return available[randIdx];
    }

    if (difficulty === 'medium') {
      // Balanced: 50% minimax tactical, 50% opportunistic / random
      if (Math.random() < 0.45) {
        const randIdx = Math.floor(Math.random() * available.length);
        return available[randIdx];
      }
    }

    // Hard / Optimal: Full Minimax
    let bestScore = -Infinity;
    let bestMove = available[0];

    for (const move of available) {
      this.board[move] = aiPlayer;
      const score = this.minimax(this.board, 0, false, aiPlayer, humanPlayer);
      this.board[move] = null;

      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    return bestMove;
  }

  minimax(board, depth, isMaximizing, aiPlayer, humanPlayer) {
    const outcome = this.checkWinner(board);
    if (outcome) {
      if (outcome.winner === aiPlayer) return 10 - depth;
      if (outcome.winner === humanPlayer) return depth - 10;
      if (outcome.winner === 'draw') return 0;
    }

    const available = this.getAvailableMoves(board);
    if (available.length === 0) return 0;

    if (isMaximizing) {
      let maxScore = -Infinity;
      for (const move of available) {
        board[move] = aiPlayer;
        const score = this.minimax(board, depth + 1, false, aiPlayer, humanPlayer);
        board[move] = null;
        maxScore = Math.max(score, maxScore);
      }
      return maxScore;
    } else {
      let minScore = Infinity;
      for (const move of available) {
        board[move] = humanPlayer;
        const score = this.minimax(board, depth + 1, true, aiPlayer, humanPlayer);
        board[move] = null;
        minScore = Math.min(score, minScore);
      }
      return minScore;
    }
  }

  exportState() {
    return {
      board: [...this.board],
      turn: this.turn,
      winner: this.winner,
      winningLine: this.winningLine,
      moveCount: this.moveCount
    };
  }

  loadState(saved) {
    if (!saved || !saved.board) return false;
    this.board = [...saved.board];
    this.turn = saved.turn || 'X';
    this.winner = saved.winner || null;
    this.winningLine = saved.winningLine || null;
    this.moveCount = saved.moveCount || 0;
    this.history = [];
    return true;
  }
}

// Global engine export
window.TicTacToeEngine = TicTacToeEngine;
