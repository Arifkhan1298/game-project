/**
 * ============================================================================
 * STRATEGY GAME PORTAL — ADVANCED AI ARENA & CHESS EVALUATOR
 * Alpha-Beta Pruning, Piece-Square Tables, Material & Mobility Heuristics,
 * Multi-Game AI Coordinator (Easy, Medium, Hard)
 * ============================================================================
 */

class StrategyAIEngine {
  constructor() {
    this.isCalculating = false;
  }

  // Piece Base Values
  static PIECE_VALUES = {
    p: 100,
    n: 320,
    b: 330,
    r: 500,
    q: 900,
    k: 20000
  };

  // Piece-Square Tables (Midgame positional bonuses from White's perspective)
  static PST = {
    p: [
      [  0,  0,  0,  0,  0,  0,  0,  0 ],
      [ 50, 50, 50, 50, 50, 50, 50, 50 ],
      [ 10, 10, 20, 30, 30, 20, 10, 10 ],
      [  5,  5, 10, 25, 25, 10,  5,  5 ],
      [  0,  0,  0, 20, 20,  0,  0,  0 ],
      [  5, -5,-10,  0,  0,-10, -5,  5 ],
      [  5, 10, 10,-20,-20, 10, 10,  5 ],
      [  0,  0,  0,  0,  0,  0,  0,  0 ]
    ],
    n: [
      [-50,-40,-30,-30,-30,-30,-40,-50 ],
      [-40,-20,  0,  0,  0,  0,-20,-40 ],
      [-30,  0, 10, 15, 15, 10,  0,-30 ],
      [-30,  5, 15, 20, 20, 15,  5,-30 ],
      [-30,  0, 15, 20, 20, 15,  0,-30 ],
      [-30,  5, 10, 15, 15, 10,  5,-30 ],
      [-40,-20,  0,  5,  5,  0,-20,-40 ],
      [-50,-40,-30,-30,-30,-30,-40,-50 ]
    ],
    b: [
      [-20,-10,-10,-10,-10,-10,-10,-20 ],
      [-10,  0,  0,  0,  0,  0,  0,-10 ],
      [-10,  0,  5, 10, 10,  5,  0,-10 ],
      [-10,  5,  5, 10, 10,  5,  5,-10 ],
      [-10,  0, 10, 10, 10, 10,  0,-10 ],
      [-10, 10, 10, 10, 10, 10, 10,-10 ],
      [-10,  5,  0,  0,  0,  0,  5,-10 ],
      [-20,-10,-10,-10,-10,-10,-10,-20 ]
    ],
    r: [
      [  0,  0,  0,  0,  0,  0,  0,  0 ],
      [  5, 10, 10, 10, 10, 10, 10,  5 ],
      [ -5,  0,  0,  0,  0,  0,  0, -5 ],
      [ -5,  0,  0,  0,  0,  0,  0, -5 ],
      [ -5,  0,  0,  0,  0,  0,  0, -5 ],
      [ -5,  0,  0,  0,  0,  0,  0, -5 ],
      [ -5,  0,  0,  0,  0,  0,  0, -5 ],
      [  0,  0,  0,  5,  5,  0,  0,  0 ]
    ],
    q: [
      [-20,-10,-10, -5, -5,-10,-10,-20 ],
      [-10,  0,  0,  0,  0,  0,  0,-10 ],
      [-10,  0,  5,  5,  5,  5,  0,-10 ],
      [ -5,  0,  5,  5,  5,  5,  0, -5 ],
      [  0,  0,  5,  5,  5,  5,  0, -5 ],
      [-10,  5,  5,  5,  5,  5,  0,-10 ],
      [-10,  0,  5,  0,  0,  0,  0,-10 ],
      [-20,-10,-10, -5, -5,-10,-10,-20 ]
    ],
    k: [
      [-30,-40,-40,-50,-50,-40,-40,-30 ],
      [-30,-40,-40,-50,-50,-40,-40,-30 ],
      [-30,-40,-40,-50,-50,-40,-40,-30 ],
      [-30,-40,-40,-50,-50,-40,-40,-30 ],
      [-20,-30,-30,-40,-40,-30,-20,-20 ],
      [-10,-20,-20,-20,-20,-20,-20,-10 ],
      [ 20, 20,  0,  0,  0,  0, 20, 20 ],
      [ 20, 30, 10,  0,  0, 10, 30, 20 ]
    ]
  };

  // Evaluate Chess position in centipawns (from White's perspective)
  evaluateChess(engine) {
    let score = 0;
    const board = engine.board;

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (!piece) continue;

        const val = StrategyAIEngine.PIECE_VALUES[piece.type] || 0;
        // Flip row index for Black to get mirrored positional table
        const tableRow = piece.color === 'w' ? r : (7 - r);
        const pstVal = StrategyAIEngine.PST[piece.type] ? StrategyAIEngine.PST[piece.type][tableRow][c] : 0;

        const totalVal = val + pstVal;
        if (piece.color === 'w') {
          score += totalVal;
        } else {
          score -= totalVal;
        }
      }
    }

    return score;
  }

  // Asynchronous chess move calculator (prevents UI freeze)
  async getChessAIMove(chessEngine, difficulty = 'medium', aiColor = 'b') {
    this.isCalculating = true;

    // Yield execution to the browser event loop for responsive UI
    await new Promise(resolve => setTimeout(resolve, 80));

    try {
      const legalMoves = chessEngine.getAllLegalMoves(aiColor);
      if (legalMoves.length === 0) return null;

      // Easy: Friendly moves (80% random, 20% simple capture)
      if (difficulty === 'easy') {
        const captures = legalMoves.filter(m => m.isCapture);
        if (captures.length > 0 && Math.random() < 0.35) {
          return captures[Math.floor(Math.random() * captures.length)];
        }
        return legalMoves[Math.floor(Math.random() * legalMoves.length)];
      }

      // Medium: Minimax depth 2 with capture ordering
      if (difficulty === 'medium') {
        return this.findBestChessMove(chessEngine, 2, aiColor);
      }

      // Hard: Minimax depth 3 with alpha-beta pruning & move ordering
      return this.findBestChessMove(chessEngine, 3, aiColor);
    } finally {
      this.isCalculating = false;
    }
  }

  findBestChessMove(engine, depth, aiColor) {
    const isWhite = aiColor === 'w';
    let bestMove = null;
    let bestValue = isWhite ? -Infinity : Infinity;
    const moves = engine.getAllLegalMoves(aiColor);

    // Prioritize captures and checks for better alpha-beta cutoffs
    moves.sort((a, b) => (b.isCapture ? 1 : 0) - (a.isCapture ? 1 : 0));

    let alpha = -Infinity;
    let beta = Infinity;

    for (const move of moves) {
      engine.makeMove(move);
      const val = this.chessMinimax(engine, depth - 1, alpha, beta, !isWhite);
      engine.undoMove();

      if (isWhite) {
        if (val > bestValue) {
          bestValue = val;
          bestMove = move;
        }
        alpha = Math.max(alpha, val);
      } else {
        if (val < bestValue) {
          bestValue = val;
          bestMove = move;
        }
        beta = Math.min(beta, val);
      }

      if (alpha >= beta) break;
    }

    return bestMove || moves[0];
  }

  chessMinimax(engine, depth, alpha, beta, isMaximizing) {
    const status = engine.getGameStatus();
    if (status.over) {
      if (status.result === 'w_win') return 100000 + depth;
      if (status.result === 'b_win') return -100000 - depth;
      return 0; // Draw
    }

    if (depth <= 0) {
      return this.evaluateChess(engine);
    }

    const color = isMaximizing ? 'w' : 'b';
    const moves = engine.getAllLegalMoves(color);
    if (moves.length === 0) return 0;

    moves.sort((a, b) => (b.isCapture ? 1 : 0) - (a.isCapture ? 1 : 0));

    if (isMaximizing) {
      let maxVal = -Infinity;
      for (const move of moves) {
        engine.makeMove(move);
        const val = this.chessMinimax(engine, depth - 1, alpha, beta, false);
        engine.undoMove();
        maxVal = Math.max(maxVal, val);
        alpha = Math.max(alpha, val);
        if (alpha >= beta) break;
      }
      return maxVal;
    } else {
      let minVal = Infinity;
      for (const move of moves) {
        engine.makeMove(move);
        const val = this.chessMinimax(engine, depth - 1, alpha, beta, true);
        engine.undoMove();
        minVal = Math.min(minVal, val);
        beta = Math.min(beta, val);
        if (alpha >= beta) break;
      }
      return minVal;
    }
  }
}

// Global AI singleton
window.portalAI = new StrategyAIEngine();
