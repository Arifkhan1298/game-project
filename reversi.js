/**
 * ============================================================================
 * STRATEGY GAME PORTAL — AUTHORITATIVE REVERSI / OTHELLO ENGINE
 * Standard 8x8 Board, Legal Move Flips, Pass-Turn Handling, Positional Matrix AI
 * ============================================================================
 */

class ReversiEngine {
  constructor() {
    this.SIZE = 8;
    this.reset();
  }

  reset() {
    this.board = Array(8).fill(null).map(() => Array(8).fill(null));
    // Standard starting position
    this.board[3][3] = 'white';
    this.board[3][4] = 'black';
    this.board[4][3] = 'black';
    this.board[4][4] = 'white';

    this.turn = 'black'; // Black always moves first in standard Reversi
    this.winner = null; // 'black', 'white', or 'draw'
    this.consecutivePasses = 0;
    this.history = [];
    this.moveCount = 0;
  }

  static DIRECTIONS = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1]
  ];

  // Static evaluation weights for Reversi squares
  static POSITION_WEIGHTS = [
    [ 120, -20,  20,   5,   5,  20, -20,  120 ],
    [ -20, -40,  -5,  -5,  -5,  -5, -40,  -20 ],
    [  20,  -5,  15,   3,   3,  15,  -5,   20 ],
    [   5,  -5,   3,   3,   3,   3,  -5,    5 ],
    [   5,  -5,   3,   3,   3,   3,  -5,    5 ],
    [  20,  -5,  15,   3,   3,  15,  -5,   20 ],
    [ -20, -40,  -5,  -5,  -5,  -5, -40,  -20 ],
    [ 120, -20,  20,   5,   5,  20, -20,  120 ]
  ];

  getOpponent(player) {
    return player === 'black' ? 'white' : 'black';
  }

  getFlipsInDirection(r, c, dr, dc, player, board = this.board) {
    const opp = this.getOpponent(player);
    let step = 1;
    const flips = [];

    while (true) {
      const nr = r + dr * step;
      const nc = c + dc * step;
      if (nr < 0 || nr >= this.SIZE || nc < 0 || nc >= this.SIZE) return [];
      const cell = board[nr][nc];
      if (cell === opp) {
        flips.push({ r: nr, c: nc });
        step++;
      } else if (cell === player) {
        return flips;
      } else {
        return []; // Empty cell breaks line
      }
    }
  }

  getLegalFlipsForSquare(r, c, player = this.turn, board = this.board) {
    if (board[r][c] !== null) return [];
    let allFlips = [];
    for (const [dr, dc] of ReversiEngine.DIRECTIONS) {
      const dirFlips = this.getFlipsInDirection(r, c, dr, dc, player, board);
      if (dirFlips.length > 0) {
        allFlips = allFlips.concat(dirFlips);
      }
    }
    return allFlips;
  }

  getLegalMoves(player = this.turn, board = this.board) {
    const legalMoves = [];
    for (let r = 0; r < this.SIZE; r++) {
      for (let c = 0; c < this.SIZE; c++) {
        const flips = this.getLegalFlipsForSquare(r, c, player, board);
        if (flips.length > 0) {
          legalMoves.push({ r, c, flips });
        }
      }
    }
    return legalMoves;
  }

  getScores(board = this.board) {
    let black = 0;
    let white = 0;
    let empty = 0;
    for (let r = 0; r < this.SIZE; r++) {
      for (let c = 0; c < this.SIZE; c++) {
        if (board[r][c] === 'black') black++;
        else if (board[r][c] === 'white') white++;
        else empty++;
      }
    }
    return { black, white, empty };
  }

  makeMove(r, c) {
    if (this.winner !== null) return { success: false, error: 'Game is already over' };

    const flips = this.getLegalFlipsForSquare(r, c, this.turn);
    if (flips.length === 0) return { success: false, error: 'Illegal move' };

    // Record history
    this.history.push({
      board: this.board.map(row => [...row]),
      turn: this.turn,
      moveCount: this.moveCount,
      consecutivePasses: this.consecutivePasses
    });

    // Place disc and flip
    this.board[r][c] = this.turn;
    for (const f of flips) {
      this.board[f.r][f.c] = this.turn;
    }

    this.consecutivePasses = 0;
    this.moveCount++;

    // Switch turn and verify opponent moves
    const nextPlayer = this.getOpponent(this.turn);
    const nextLegalMoves = this.getLegalMoves(nextPlayer);

    let passed = false;

    if (nextLegalMoves.length > 0) {
      this.turn = nextPlayer;
    } else {
      // Next player has no moves -> Must pass
      this.consecutivePasses++;
      const currentLegalAgain = this.getLegalMoves(this.turn);
      if (currentLegalAgain.length > 0) {
        // Current player goes again
        passed = true;
      } else {
        // Neither player has legal moves -> Game over
        this.consecutivePasses++;
        this.concludeGame();
      }
    }

    const scores = this.getScores();
    if (scores.empty === 0 && !this.winner) {
      this.concludeGame();
    }

    return {
      success: true,
      r,
      c,
      player: this.board[r][c],
      flipsCount: flips.length,
      scores: this.getScores(),
      passed: passed,
      turn: this.turn,
      winner: this.winner,
      isOver: this.winner !== null
    };
  }

  concludeGame() {
    const scores = this.getScores();
    if (scores.black > scores.white) {
      this.winner = 'black';
    } else if (scores.white > scores.black) {
      this.winner = 'white';
    } else {
      this.winner = 'draw';
    }
  }

  undo() {
    if (this.history.length === 0) return false;
    const prev = this.history.pop();
    this.board = prev.board;
    this.turn = prev.turn;
    this.moveCount = prev.moveCount;
    this.consecutivePasses = prev.consecutivePasses;
    this.winner = null;
    return true;
  }

  // --- AI Opponent with Positional Strategy & Mobility Heuristics ---

  getAIMove(difficulty = 'hard', aiPlayer = 'white') {
    const legalMoves = this.getLegalMoves(aiPlayer);
    if (legalMoves.length === 0) return null;

    if (difficulty === 'easy') {
      // Casual random move
      return legalMoves[Math.floor(Math.random() * legalMoves.length)];
    }

    if (difficulty === 'medium') {
      // Greedy with basic corner priority
      let bestMove = legalMoves[0];
      let bestScore = -Infinity;
      for (const m of legalMoves) {
        let score = m.flips.length;
        if ((m.r === 0 || m.r === 7) && (m.c === 0 || m.c === 7)) score += 50; // Corner
        if (score > bestScore) {
          bestScore = score;
          bestMove = m;
        }
      }
      return bestMove;
    }

    // Hard AI: Minimax depth 3 with positional evaluation matrix and mobility
    let bestScore = -Infinity;
    let bestMove = legalMoves[0];

    for (const m of legalMoves) {
      const clonedBoard = this.board.map(row => [...row]);
      clonedBoard[m.r][m.c] = aiPlayer;
      for (const f of m.flips) {
        clonedBoard[f.r][f.c] = aiPlayer;
      }

      const score = this.minimax(clonedBoard, 3, -Infinity, Infinity, false, aiPlayer);
      if (score > bestScore) {
        bestScore = score;
        bestMove = m;
      }
    }

    return bestMove;
  }

  minimax(board, depth, alpha, beta, isMaximizing, aiPlayer) {
    const opp = this.getOpponent(aiPlayer);
    const currentPlayer = isMaximizing ? aiPlayer : opp;
    const moves = this.getLegalMoves(currentPlayer, board);

    if (depth === 0 || moves.length === 0) {
      return this.evaluatePosition(board, aiPlayer);
    }

    if (isMaximizing) {
      let maxScore = -Infinity;
      for (const m of moves) {
        const nextBoard = board.map(r => [...r]);
        nextBoard[m.r][m.c] = aiPlayer;
        for (const f of m.flips) nextBoard[f.r][f.c] = aiPlayer;

        const score = this.minimax(nextBoard, depth - 1, alpha, beta, false, aiPlayer);
        maxScore = Math.max(maxScore, score);
        alpha = Math.max(alpha, score);
        if (alpha >= beta) break;
      }
      return maxScore;
    } else {
      let minScore = Infinity;
      for (const m of moves) {
        const nextBoard = board.map(r => [...r]);
        nextBoard[m.r][m.c] = opp;
        for (const f of m.flips) nextBoard[f.r][f.c] = opp;

        const score = this.minimax(nextBoard, depth - 1, alpha, beta, true, aiPlayer);
        minScore = Math.min(minScore, score);
        beta = Math.min(beta, score);
        if (alpha >= beta) break;
      }
      return minScore;
    }
  }

  evaluatePosition(board, aiPlayer) {
    const opp = this.getOpponent(aiPlayer);
    let positionalScore = 0;
    let myCount = 0;
    let oppCount = 0;

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece === aiPlayer) {
          myCount++;
          positionalScore += ReversiEngine.POSITION_WEIGHTS[r][c];
        } else if (piece === opp) {
          oppCount++;
          positionalScore -= ReversiEngine.POSITION_WEIGHTS[r][c];
        }
      }
    }

    // Mobility difference
    const myMobility = this.getLegalMoves(aiPlayer, board).length;
    const oppMobility = this.getLegalMoves(opp, board).length;
    const mobilityScore = (myMobility - oppMobility) * 10;

    return positionalScore + mobilityScore + (myCount - oppCount);
  }

  exportState() {
    return {
      board: this.board.map(r => [...r]),
      turn: this.turn,
      winner: this.winner,
      moveCount: this.moveCount,
      consecutivePasses: this.consecutivePasses
    };
  }

  loadState(saved) {
    if (!saved || !saved.board) return false;
    this.board = saved.board.map(r => [...r]);
    this.turn = saved.turn || 'black';
    this.winner = saved.winner || null;
    this.moveCount = saved.moveCount || 0;
    this.consecutivePasses = saved.consecutivePasses || 0;
    this.history = [];
    return true;
  }
}

// Global engine export
window.ReversiEngine = ReversiEngine;
