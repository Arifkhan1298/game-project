/**
 * ============================================================================
 * CLASSICAL CHECKERS (DRAUGHTS) ENGINE
 * 8x8 Board, Diagonal Moves, Jumping Captures, Kings & Minimax AI
 * ============================================================================
 */

class CheckersEngine {
  constructor() {
    this.board = Array.from({ length: 8 }, () => Array(8).fill(null));
    this.turn = 'r'; // 'r' (red - human / player 1), 'b' (black - AI / player 2)
    this.winner = null;
    this.history = [];
    this.mustContinueJumpFrom = null; // { r, c } if in a multi-jump sequence
    this.movesWithoutCapture = 0;
    this.init();
  }

  init() {
    this.board = Array.from({ length: 8 }, () => Array(8).fill(null));
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if ((r + c) % 2 === 1) {
          if (r < 3) this.board[r][c] = { color: 'b', isKing: false };
          else if (r > 4) this.board[r][c] = { color: 'r', isKing: false };
        }
      }
    }
    this.turn = 'r';
    this.winner = null;
    this.history = [];
    this.mustContinueJumpFrom = null;
    this.movesWithoutCapture = 0;
  }

  getPiece(r, c) {
    if (r < 0 || r >= 8 || c < 0 || c >= 8) return null;
    return this.board[r][c];
  }

  getLegalMovesForPiece(r, c) {
    const piece = this.getPiece(r, c);
    if (!piece || piece.color !== this.turn) return [];
    if (this.mustContinueJumpFrom && (this.mustContinueJumpFrom.r !== r || this.mustContinueJumpFrom.c !== c)) {
      return [];
    }

    const moves = [];
    const jumps = [];

    // Direction vectors
    const dirs = [];
    if (piece.color === 'r' || piece.isKing) {
      dirs.push({ dr: -1, dc: -1 }, { dr: -1, dc: 1 });
    }
    if (piece.color === 'b' || piece.isKing) {
      dirs.push({ dr: 1, dc: -1 }, { dr: 1, dc: 1 });
    }

    dirs.forEach(({ dr, dc }) => {
      const stepR = r + dr;
      const stepC = c + dc;
      const jumpR = r + dr * 2;
      const jumpC = c + dc * 2;

      // Normal single diagonal step (only valid if not in multi-jump)
      if (!this.mustContinueJumpFrom) {
        if (stepR >= 0 && stepR < 8 && stepC >= 0 && stepC < 8 && !this.board[stepR][stepC]) {
          moves.push({ from: { r, c }, to: { r: stepR, c: stepC }, isJump: false });
        }
      }

      // Jump capture
      if (jumpR >= 0 && jumpR < 8 && jumpC >= 0 && jumpC < 8 && !this.board[jumpR][jumpC]) {
        const mid = this.board[stepR][stepC];
        if (mid && mid.color !== piece.color) {
          jumps.push({
            from: { r, c },
            to: { r: jumpR, c: jumpC },
            isJump: true,
            captured: { r: stepR, c: stepC }
          });
        }
      }
    });

    // If jump is available, jumps are required (or at least returned)
    return jumps.length > 0 ? jumps : moves;
  }

  getAllLegalMoves(color = this.turn) {
    const allJumps = [];
    const allSteps = [];

    if (this.mustContinueJumpFrom) {
      return this.getLegalMovesForPiece(this.mustContinueJumpFrom.r, this.mustContinueJumpFrom.c);
    }

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = this.board[r][c];
        if (p && p.color === color) {
          const pieceMoves = this.getLegalMovesForPiece(r, c);
          pieceMoves.forEach(m => {
            if (m.isJump) allJumps.push(m);
            else allSteps.push(m);
          });
        }
      }
    }

    // Force jumps if any exist
    return allJumps.length > 0 ? allJumps : allSteps;
  }

  makeMove(move) {
    if (this.winner) return { success: false, reason: 'Game over' };

    const { from, to, isJump, captured } = move;
    const piece = this.board[from.r][from.c];
    if (!piece) return { success: false, reason: 'No piece' };

    // Move piece
    this.board[to.r][to.c] = piece;
    this.board[from.r][from.c] = null;

    let capturedPiece = null;
    if (isJump && captured) {
      capturedPiece = this.board[captured.r][captured.c];
      this.board[captured.r][captured.c] = null;
      this.movesWithoutCapture = 0;
    } else {
      this.movesWithoutCapture++;
    }

    // Check King promotion
    let promoted = false;
    if (!piece.isKing) {
      if (piece.color === 'r' && to.r === 0) {
        piece.isKing = true;
        promoted = true;
      } else if (piece.color === 'b' && to.r === 7) {
        piece.isKing = true;
        promoted = true;
      }
    }

    this.history.push({ move, piece, capturedPiece, promoted });

    // Check for multi-jump
    if (isJump && !promoted) {
      const moreJumps = this.getLegalMovesForPiece(to.r, to.c).filter(m => m.isJump);
      if (moreJumps.length > 0) {
        this.mustContinueJumpFrom = { r: to.r, c: to.c };
        return {
          success: true,
          mustContinueJump: true,
          promoted,
          turn: this.turn,
          isOver: false
        };
      }
    }

    this.mustContinueJumpFrom = null;
    this.turn = (this.turn === 'r') ? 'b' : 'r';

    // Check Win/Loss or Draw
    const nextMoves = this.getAllLegalMoves(this.turn);
    let isOver = false;
    let reason = '';

    if (nextMoves.length === 0) {
      this.winner = (this.turn === 'r') ? 'b' : 'r';
      isOver = true;
      reason = `${this.winner === 'r' ? 'Red' : 'Black'} wins! Opponent has no legal moves.`;
    } else if (this.movesWithoutCapture >= 40) {
      this.winner = 'draw';
      isOver = true;
      reason = 'Match concluded in a Draw (40 moves without captures).';
    }

    return {
      success: true,
      promoted,
      turn: this.turn,
      isOver,
      winner: this.winner,
      reason
    };
  }

  getAIMove(difficulty = 'medium') {
    const legalMoves = this.getAllLegalMoves('b');
    if (legalMoves.length === 0) return null;

    if (difficulty === 'easy') {
      return legalMoves[Math.floor(Math.random() * legalMoves.length)];
    }

    // Score each move
    let bestMove = legalMoves[0];
    let bestScore = -Infinity;

    for (const m of legalMoves) {
      let score = 0;
      if (m.isJump) score += 15;
      if (m.to.r === 7) score += 10; // Promotion
      // Advance toward opponent
      score += m.to.r * 2;
      // Protect edges
      if (m.to.c === 0 || m.to.c === 7) score += 3;

      if (score > bestScore) {
        bestScore = score;
        bestMove = m;
      }
    }

    return bestMove;
  }
}

window.CheckersEngine = CheckersEngine;
