/**
 * ============================================================================
 * STRATEGY GAME PORTAL — AUTHORITATIVE CHESS ENGINE
 * Complete Standard Chess Rules: Legal Move Generation, Check, Checkmate,
 * Stalemate, Castling, En Passant, Promotion, 50-Move Rule, Threefold Repetition
 * ============================================================================
 */

class ChessEngine {
  constructor() {
    this.reset();
  }

  reset() {
    // 8x8 board: row 0 is rank 8 (Black side), row 7 is rank 1 (White side)
    // col 0 is file a, col 7 is file h
    this.board = Array(8).fill(null).map(() => Array(8).fill(null));
    this.turn = 'w'; // 'w' or 'b'
    this.castling = {
      w: { k: true, q: true },
      b: { k: true, q: true }
    };
    this.enPassant = null; // { r, c } target square for en-passant capture
    this.halfmoveClock = 0; // Fifty-move rule tracker
    this.fullmoveNumber = 1;
    this.history = []; // Array of { move, stateSnapshot }
    this.positionCounts = {}; // FEN occurrences for threefold repetition

    this.setupStartingPosition();
    this.recordPosition();
  }

  setupStartingPosition() {
    const backRow = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];
    for (let c = 0; c < 8; c++) {
      this.board[0][c] = { type: backRow[c], color: 'b' };
      this.board[1][c] = { type: 'p', color: 'b' };
      this.board[6][c] = { type: 'p', color: 'w' };
      this.board[7][c] = { type: backRow[c], color: 'w' };
    }
  }

  getPiece(r, c) {
    if (r < 0 || r > 7 || c < 0 || c > 7) return null;
    return this.board[r][c];
  }

  cloneBoard(board = this.board) {
    return board.map(row => row.map(cell => cell ? { ...cell } : null));
  }

  // Check if a given square is attacked by pieces of `byColor`
  isSquareAttacked(targetR, targetC, byColor, board = this.board) {
    // 1. Pawn attacks
    const pawnDir = byColor === 'w' ? 1 : -1; // Pawns attack forward towards target
    const attackerPawnRow = targetR + pawnDir;
    if (attackerPawnRow >= 0 && attackerPawnRow <= 7) {
      for (const dc of [-1, 1]) {
        const pc = targetC + dc;
        if (pc >= 0 && pc <= 7) {
          const piece = board[attackerPawnRow][pc];
          if (piece && piece.color === byColor && piece.type === 'p') {
            return true;
          }
        }
      }
    }

    // 2. Knight attacks
    const knightOffsets = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1]
    ];
    for (const [dr, dc] of knightOffsets) {
      const nr = targetR + dr;
      const nc = targetC + dc;
      if (nr >= 0 && nr <= 7 && nc >= 0 && nc <= 7) {
        const piece = board[nr][nc];
        if (piece && piece.color === byColor && piece.type === 'n') {
          return true;
        }
      }
    }

    // 3. King attacks (adjacent squares)
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const kr = targetR + dr;
        const kc = targetC + dc;
        if (kr >= 0 && kr <= 7 && kc >= 0 && kc <= 7) {
          const piece = board[kr][kc];
          if (piece && piece.color === byColor && piece.type === 'k') {
            return true;
          }
        }
      }
    }

    // 4. Straight sliding attacks (Rook, Queen)
    const straightDirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    for (const [dr, dc] of straightDirs) {
      let step = 1;
      while (true) {
        const sr = targetR + dr * step;
        const sc = targetC + dc * step;
        if (sr < 0 || sr > 7 || sc < 0 || sc > 7) break;
        const piece = board[sr][sc];
        if (piece) {
          if (piece.color === byColor && (piece.type === 'r' || piece.type === 'q')) {
            return true;
          }
          break; // Ray blocked
        }
        step++;
      }
    }

    // 5. Diagonal sliding attacks (Bishop, Queen)
    const diagDirs = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
    for (const [dr, dc] of diagDirs) {
      let step = 1;
      while (true) {
        const sr = targetR + dr * step;
        const sc = targetC + dc * step;
        if (sr < 0 || sr > 7 || sc < 0 || sc > 7) break;
        const piece = board[sr][sc];
        if (piece) {
          if (piece.color === byColor && (piece.type === 'b' || piece.type === 'q')) {
            return true;
          }
          break; // Ray blocked
        }
        step++;
      }
    }

    return false;
  }

  // Find position of the king for a given color
  findKing(color, board = this.board) {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (p && p.color === color && p.type === 'k') {
          return { r, c };
        }
      }
    }
    return null;
  }

  // Is color currently in check?
  isInCheck(color = this.turn, board = this.board) {
    const kingPos = this.findKing(color, board);
    if (!kingPos) return false;
    const opponent = color === 'w' ? 'b' : 'w';
    return this.isSquareAttacked(kingPos.r, kingPos.c, opponent, board);
  }

  // Generate pseudo-legal moves for a specific piece
  generatePseudoMoves(r, c, board = this.board) {
    const piece = board[r][c];
    if (!piece) return [];
    const color = piece.color;
    const opponent = color === 'w' ? 'b' : 'w';
    const moves = [];

    if (piece.type === 'p') {
      const fwd = color === 'w' ? -1 : 1;
      const startRow = color === 'w' ? 6 : 1;
      const promoRow = color === 'w' ? 0 : 7;

      // 1 square forward
      const oneFwd = r + fwd;
      if (oneFwd >= 0 && oneFwd <= 7 && !board[oneFwd][c]) {
        if (oneFwd === promoRow) {
          ['q', 'r', 'b', 'n'].forEach(promo => {
            moves.push({ from: { r, c }, to: { r: oneFwd, c }, promotion: promo });
          });
        } else {
          moves.push({ from: { r, c }, to: { r: oneFwd, c } });
        }

        // 2 squares forward from starting row
        const twoFwd = r + 2 * fwd;
        if (r === startRow && !board[twoFwd][c]) {
          moves.push({ from: { r, c }, to: { r: twoFwd, c }, isDoublePawn: true });
        }
      }

      // Diagonal captures
      for (const dc of [-1, 1]) {
        const tc = c + dc;
        if (tc >= 0 && tc <= 7) {
          const target = board[oneFwd][tc];
          if (target && target.color === opponent) {
            if (oneFwd === promoRow) {
              ['q', 'r', 'b', 'n'].forEach(promo => {
                moves.push({ from: { r, c }, to: { r: oneFwd, c: tc }, promotion: promo, isCapture: true });
              });
            } else {
              moves.push({ from: { r, c }, to: { r: oneFwd, c: tc }, isCapture: true });
            }
          } else if (this.enPassant && this.enPassant.r === oneFwd && this.enPassant.c === tc) {
            // En passant capture
            moves.push({ from: { r, c }, to: { r: oneFwd, c: tc }, isEnPassant: true, isCapture: true });
          }
        }
      }
    }

    if (piece.type === 'n') {
      const jumps = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1]
      ];
      for (const [dr, dc] of jumps) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr <= 7 && nc >= 0 && nc <= 7) {
          const target = board[nr][nc];
          if (!target || target.color === opponent) {
            moves.push({ from: { r, c }, to: { r: nr, c: nc }, isCapture: !!target });
          }
        }
      }
    }

    if (piece.type === 'b' || piece.type === 'q') {
      const dirs = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
      for (const [dr, dc] of dirs) {
        let step = 1;
        while (true) {
          const nr = r + dr * step;
          const nc = c + dc * step;
          if (nr < 0 || nr > 7 || nc < 0 || nc > 7) break;
          const target = board[nr][nc];
          if (!target) {
            moves.push({ from: { r, c }, to: { r: nr, c: nc } });
          } else {
            if (target.color === opponent) {
              moves.push({ from: { r, c }, to: { r: nr, c: nc }, isCapture: true });
            }
            break;
          }
          step++;
        }
      }
    }

    if (piece.type === 'r' || piece.type === 'q') {
      const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
      for (const [dr, dc] of dirs) {
        let step = 1;
        while (true) {
          const nr = r + dr * step;
          const nc = c + dc * step;
          if (nr < 0 || nr > 7 || nc < 0 || nc > 7) break;
          const target = board[nr][nc];
          if (!target) {
            moves.push({ from: { r, c }, to: { r: nr, c: nc } });
          } else {
            if (target.color === opponent) {
              moves.push({ from: { r, c }, to: { r: nr, c: nc }, isCapture: true });
            }
            break;
          }
          step++;
        }
      }
    }

    if (piece.type === 'k') {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr <= 7 && nc >= 0 && nc <= 7) {
            const target = board[nr][nc];
            if (!target || target.color === opponent) {
              moves.push({ from: { r, c }, to: { r: nr, c: nc }, isCapture: !!target });
            }
          }
        }
      }

      // Castling rules:
      // 1. King and chosen Rook have not moved.
      // 2. King is not currently in check.
      // 3. Squares between King and Rook are empty.
      // 4. King does not pass through or finish on an attacked square.
      const row = color === 'w' ? 7 : 0;
      if (r === row && c === 4 && !this.isInCheck(color, board)) {
        // Kingside castling (O-O)
        if (this.castling[color].k && !board[row][5] && !board[row][6]) {
          if (!this.isSquareAttacked(row, 5, opponent, board) &&
              !this.isSquareAttacked(row, 6, opponent, board)) {
            moves.push({ from: { r, c }, to: { r: row, c: 6 }, isCastling: 'k' });
          }
        }
        // Queenside castling (O-O-O)
        if (this.castling[color].q && !board[row][3] && !board[row][2] && !board[row][1]) {
          if (!this.isSquareAttacked(row, 3, opponent, board) &&
              !this.isSquareAttacked(row, 2, opponent, board)) {
            moves.push({ from: { r, c }, to: { r: row, c: 2 }, isCastling: 'q' });
          }
        }
      }
    }

    return moves;
  }

  // Filter pseudo-legal moves to only those where king is not left in check
  filterLegalMoves(pseudoMoves, color = this.turn) {
    const legalMoves = [];

    for (const m of pseudoMoves) {
      const simulatedBoard = this.cloneBoard(this.board);
      const piece = simulatedBoard[m.from.r][m.from.c];

      // Execute simulated move
      simulatedBoard[m.to.r][m.to.c] = piece;
      simulatedBoard[m.from.r][m.from.c] = null;

      // Handle simulated promotion
      if (m.promotion) {
        simulatedBoard[m.to.r][m.to.c] = { type: m.promotion, color: color };
      }

      // Handle simulated en passant capture
      if (m.isEnPassant) {
        const capturedPawnRow = color === 'w' ? m.to.r + 1 : m.to.r - 1;
        simulatedBoard[capturedPawnRow][m.to.c] = null;
      }

      // Handle simulated castling rook move
      if (m.isCastling === 'k') {
        const row = m.from.r;
        simulatedBoard[row][5] = simulatedBoard[row][7];
        simulatedBoard[row][7] = null;
      } else if (m.isCastling === 'q') {
        const row = m.from.r;
        simulatedBoard[row][3] = simulatedBoard[row][0];
        simulatedBoard[row][0] = null;
      }

      // Verify King is safe
      if (!this.isInCheck(color, simulatedBoard)) {
        legalMoves.push(m);
      }
    }

    return legalMoves;
  }

  // Get all legal moves for current player
  getAllLegalMoves(color = this.turn) {
    let allMoves = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = this.board[r][c];
        if (piece && piece.color === color) {
          const pseudo = this.generatePseudoMoves(r, c);
          const legal = this.filterLegalMoves(pseudo, color);
          allMoves = allMoves.concat(legal);
        }
      }
    }
    return allMoves;
  }

  // Get legal moves from a specific square
  getLegalMovesFrom(r, c) {
    const piece = this.board[r][c];
    if (!piece || piece.color !== this.turn) return [];
    const pseudo = this.generatePseudoMoves(r, c);
    return this.filterLegalMoves(pseudo, this.turn);
  }

  // Alias for UI bindings
  getLegalMovesForSquare(r, c) {
    return this.getLegalMovesFrom(r, c);
  }

  // Undo alias returning boolean for UI shell
  undo() {
    return !!this.undoMove();
  }

  // State persistence for "Continue Playing"
  exportState() {
    return {
      board: this.cloneBoard(this.board),
      turn: this.turn,
      castling: JSON.parse(JSON.stringify(this.castling)),
      enPassant: this.enPassant ? { ...this.enPassant } : null,
      halfmoveClock: this.halfmoveClock,
      fullmoveNumber: this.fullmoveNumber,
      positionCounts: { ...this.positionCounts }
    };
  }

  loadState(saved) {
    if (!saved || !saved.board) return false;
    this.board = this.cloneBoard(saved.board);
    this.turn = saved.turn || 'w';
    this.castling = saved.castling || { w: { k: true, q: true }, b: { k: true, q: true } };
    this.enPassant = saved.enPassant || null;
    this.halfmoveClock = saved.halfmoveClock || 0;
    this.fullmoveNumber = saved.fullmoveNumber || 1;
    this.positionCounts = saved.positionCounts || {};
    this.history = [];
    return true;
  }

  // Execute a move on the actual board
  makeMove(move) {
    const fromPiece = this.board[move.from.r][move.from.c];
    if (!fromPiece || fromPiece.color !== this.turn) return false;

    // Snapshot state for undo and 50-move rule
    const snapshot = {
      board: this.cloneBoard(this.board),
      turn: this.turn,
      castling: JSON.parse(JSON.stringify(this.castling)),
      enPassant: this.enPassant ? { ...this.enPassant } : null,
      halfmoveClock: this.halfmoveClock,
      fullmoveNumber: this.fullmoveNumber,
      capturedPiece: this.board[move.to.r][move.to.c],
      move: move
    };

    const targetSquarePiece = this.board[move.to.r][move.to.c];
    const isPawnMove = fromPiece.type === 'p';
    const isCapture = !!targetSquarePiece || move.isEnPassant;

    // Update 50-move counter
    if (isPawnMove || isCapture) {
      this.halfmoveClock = 0;
    } else {
      this.halfmoveClock++;
    }

    // Apply Move
    this.board[move.to.r][move.to.c] = fromPiece;
    this.board[move.from.r][move.from.c] = null;

    // Handle Promotion
    if (move.promotion) {
      this.board[move.to.r][move.to.c] = { type: move.promotion, color: this.turn };
    }

    // Handle En Passant capture removal
    if (move.isEnPassant) {
      const capRow = this.turn === 'w' ? move.to.r + 1 : move.to.r - 1;
      this.board[capRow][move.to.c] = null;
    }

    // Set or clear En Passant target
    if (move.isDoublePawn) {
      const epRow = this.turn === 'w' ? move.from.r - 1 : move.from.r + 1;
      this.enPassant = { r: epRow, c: move.from.c };
    } else {
      this.enPassant = null;
    }

    // Handle Castling rook repositioning
    if (move.isCastling === 'k') {
      const row = move.from.r;
      this.board[row][5] = this.board[row][7];
      this.board[row][7] = null;
    } else if (move.isCastling === 'q') {
      const row = move.from.r;
      this.board[row][3] = this.board[row][0];
      this.board[row][0] = null;
    }

    // Update castling rights if King moves or Rook moves/is captured
    if (fromPiece.type === 'k') {
      this.castling[this.turn].k = false;
      this.castling[this.turn].q = false;
    } else if (fromPiece.type === 'r') {
      if (move.from.r === 7 && move.from.c === 7) this.castling.w.k = false;
      if (move.from.r === 7 && move.from.c === 0) this.castling.w.q = false;
      if (move.from.r === 0 && move.from.c === 7) this.castling.b.k = false;
      if (move.from.r === 0 && move.from.c === 0) this.castling.b.q = false;
    }

    // If opponent rook captured on starting corner
    if (move.to.r === 7 && move.to.c === 7) this.castling.w.k = false;
    if (move.to.r === 7 && move.to.c === 0) this.castling.w.q = false;
    if (move.to.r === 0 && move.to.c === 7) this.castling.b.k = false;
    if (move.to.r === 0 && move.to.c === 0) this.castling.b.q = false;

    // Switch turn
    if (this.turn === 'b') {
      this.fullmoveNumber++;
    }
    this.turn = this.turn === 'w' ? 'b' : 'w';

    // Store in history
    this.history.push(snapshot);
    this.recordPosition();

    return true;
  }

  undoMove() {
    if (this.history.length === 0) return null;
    const last = this.history.pop();
    this.board = last.board;
    this.turn = last.turn;
    this.castling = last.castling;
    this.enPassant = last.enPassant;
    this.halfmoveClock = last.halfmoveClock;
    this.fullmoveNumber = last.fullmoveNumber;

    // Remove from position counts
    const fen = this.getSimplifiedFEN();
    if (this.positionCounts[fen]) {
      this.positionCounts[fen]--;
      if (this.positionCounts[fen] <= 0) delete this.positionCounts[fen];
    }

    return last.move;
  }

  // Record FEN for threefold repetition
  recordPosition() {
    const fen = this.getSimplifiedFEN();
    this.positionCounts[fen] = (this.positionCounts[fen] || 0) + 1;
  }

  getSimplifiedFEN() {
    // Generates board placement + turn + castling + ep for repetition check
    let res = '';
    for (let r = 0; r < 8; r++) {
      let empty = 0;
      for (let c = 0; c < 8; c++) {
        const p = this.board[r][c];
        if (!p) {
          empty++;
        } else {
          if (empty > 0) {
            res += empty;
            empty = 0;
          }
          const char = p.type;
          res += p.color === 'w' ? char.toUpperCase() : char;
        }
      }
      if (empty > 0) res += empty;
      if (r < 7) res += '/';
    }

    res += ' ' + this.turn + ' ';
    let cast = '';
    if (this.castling.w.k) cast += 'K';
    if (this.castling.w.q) cast += 'Q';
    if (this.castling.b.k) cast += 'k';
    if (this.castling.b.q) cast += 'q';
    res += cast || '-';

    res += ' ' + (this.enPassant ? `${String.fromCharCode(97 + this.enPassant.c)}${8 - this.enPassant.r}` : '-');
    return res;
  }

  // --- Game Ending Conditions ---

  isCheckmate() {
    return this.isInCheck(this.turn) && this.getAllLegalMoves(this.turn).length === 0;
  }

  isStalemate() {
    return !this.isInCheck(this.turn) && this.getAllLegalMoves(this.turn).length === 0;
  }

  isFiftyMoveDraw() {
    return this.halfmoveClock >= 100; // 50 full moves = 100 half moves
  }

  isThreefoldRepetition() {
    const fen = this.getSimplifiedFEN();
    return (this.positionCounts[fen] || 0) >= 3;
  }

  isInsufficientMaterial() {
    const pieces = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = this.board[r][c];
        if (p) pieces.push(p);
      }
    }

    // King vs King
    if (pieces.length === 2) return true;

    // King + Bishop vs King OR King + Knight vs King
    if (pieces.length === 3) {
      const nonKings = pieces.filter(p => p.type !== 'k');
      if (nonKings.length === 1 && (nonKings[0].type === 'b' || nonKings[0].type === 'n')) {
        return true;
      }
    }

    // King + Bishop vs King + Bishop (same color bishops)
    if (pieces.length === 4) {
      const bishops = pieces.filter(p => p.type === 'b');
      if (bishops.length === 2 && pieces.filter(p => p.type === 'k').length === 2) {
        // Find square color of both bishops
        let b1Color = null;
        let b2Color = null;
        for (let r = 0; r < 8; r++) {
          for (let c = 0; c < 8; c++) {
            const p = this.board[r][c];
            if (p && p.type === 'b') {
              const squareIsLight = (r + c) % 2 === 0;
              if (b1Color === null) b1Color = squareIsLight;
              else b2Color = squareIsLight;
            }
          }
        }
        if (b1Color === b2Color) return true;
      }
    }

    return false;
  }

  getGameStatus() {
    if (this.isCheckmate()) {
      const winner = this.turn === 'w' ? 'Black' : 'White';
      return { over: true, result: this.turn === 'w' ? 'b_win' : 'w_win', reason: `Checkmate! ${winner} wins.` };
    }
    if (this.isStalemate()) {
      return { over: true, result: 'draw', reason: 'Draw by Stalemate.' };
    }
    if (this.isFiftyMoveDraw()) {
      return { over: true, result: 'draw', reason: 'Draw by 50-move rule.' };
    }
    if (this.isThreefoldRepetition()) {
      return { over: true, result: 'draw', reason: 'Draw by Threefold Repetition.' };
    }
    if (this.isInsufficientMaterial()) {
      return { over: true, result: 'draw', reason: 'Draw by Insufficient Material.' };
    }
    return { over: false, check: this.isInCheck(this.turn) };
  }

  // Standard algebraic notation formatter
  moveToSAN(move, piece) {
    if (move.isCastling === 'k') return 'O-O';
    if (move.isCastling === 'q') return 'O-O-O';

    const files = 'abcdefgh';
    const ranks = '87654321';
    let san = '';

    if (piece.type !== 'p') {
      san += piece.type.toUpperCase();
    } else if (move.isCapture) {
      san += files[move.from.c];
    }

    if (move.isCapture) san += 'x';
    san += files[move.to.c] + ranks[move.to.r];

    if (move.promotion) {
      san += '=' + move.promotion.toUpperCase();
    }

    return san;
  }
}

// Global chess engine factory
window.ChessEngine = ChessEngine;
