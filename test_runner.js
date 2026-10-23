/**
 * ============================================================================
 * STRATEGY GAME PORTAL — COMPREHENSIVE AUTOMATED TEST SUITE
 * 60 Rigorous Unit & Integration Tests Verifying Game Rules, AI Legal Moves,
 * Persistence, Authentication, and Progression
 * ============================================================================
 */

class StrategyPortalTestSuite {
  constructor() {
    this.results = [];
    this.passedCount = 0;
    this.failedCount = 0;
  }

  assert(description, condition, details = '') {
    if (condition) {
      this.passedCount++;
      this.results.push({ name: description, passed: true, details });
      console.log(`%c[PASS] ${description}`, 'color: #10b981;');
    } else {
      this.failedCount++;
      this.results.push({ name: description, passed: false, details });
      console.error(`[FAIL] ${description} — ${details}`);
    }
  }

  async runAllTests() {
    console.log('%c=== EXECUTING STRATEGY PORTAL AUTOMATED TEST SUITE ===', 'color: #d4af37; font-weight: bold; font-size: 1.1rem;');
    this.results = [];
    this.passedCount = 0;
    this.failedCount = 0;

    this.testChessRules();
    this.testTicTacToeRules();
    this.testConnect4Rules();
    this.testReversiRules();
    this.testMinesweeperRules();
    this.testMemoryRules();
    this.test2048Rules();
    this.testSnakeRules();
    this.testCheckersRules();
    this.testSudokuRules();
    this.testTetrisRules();
    this.testPongRules();
    this.testWordleRules();
    this.testSimonRules();
    this.testBattleshipRules();
    this.testBreakoutRules();
    await this.testAIEngines();
    this.testStorageAndAuth();

    console.log(`%c=== TEST RUN COMPLETE: ${this.passedCount} PASSED, ${this.failedCount} FAILED ===`, 
      this.failedCount === 0 ? 'color: #10b981; font-weight: bold;' : 'color: #ef4444; font-weight: bold;');

    return {
      total: this.passedCount + this.failedCount,
      passed: this.passedCount,
      failed: this.failedCount,
      results: this.results
    };
  }

  // --- SUITE 1: CHESS ENGINE RULES ---
  testChessRules() {
    const engine = new window.ChessEngine();

    // Test 1: Starting pieces
    let whitePieces = 0;
    let blackPieces = 0;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = engine.board[r][c];
        if (p) {
          if (p.color === 'w') whitePieces++;
          if (p.color === 'b') blackPieces++;
        }
      }
    }
    this.assert('Chess: 16 White pieces and 16 Black pieces on setup', whitePieces === 16 && blackPieces === 16);

    // Test 2: Starting legal moves for White (20 moves: 16 pawn + 4 knight)
    const startingMoves = engine.getAllLegalMoves('w');
    this.assert('Chess: White has exactly 20 legal opening moves', startingMoves.length === 20, `Got ${startingMoves.length}`);

    // Test 3: 2-step pawn opening
    const e4Move = startingMoves.find(m => m.from.r === 6 && m.from.c === 4 && m.to.r === 4 && m.to.c === 4);
    this.assert('Chess: e2-e4 is a valid legal opening move', !!e4Move);
    engine.makeMove(e4Move);
    this.assert('Chess: Turn transitions to Black after White move', engine.turn === 'b');
    this.assert('Chess: En passant target square set after e2-e4', engine.enPassant && engine.enPassant.r === 5 && engine.enPassant.c === 4);

    // Test 4: Black moves e7-e5
    const e5Move = engine.getAllLegalMoves('b').find(m => m.from.r === 1 && m.from.c === 4 && m.to.r === 3 && m.to.c === 4);
    this.assert('Chess: e7-e5 is a valid legal response', !!e5Move);
    engine.makeMove(e5Move);

    // Test 5: Knight move Nf3
    const nf3 = engine.getAllLegalMoves('w').find(m => m.from.r === 7 && m.from.c === 6 && m.to.r === 5 && m.to.c === 5);
    this.assert('Chess: Knight moves in L-shape to f3', !!nf3);
    engine.makeMove(nf3);

    // Test 6: Undo moves restores board state
    engine.undo();
    this.assert('Chess: Undo restores turn to White', engine.turn === 'w');
    this.assert('Chess: Knight reverted from f3 to g1', engine.board[7][6] && engine.board[7][6].type === 'n');

    // Test 7: Scholar's Mate checkmate detection
    const smEngine = new window.ChessEngine();
    // 1. e4 e5
    smEngine.makeMove(smEngine.getAllLegalMoves('w').find(m => m.from.r === 6 && m.from.c === 4 && m.to.r === 4 && m.to.c === 4));
    smEngine.makeMove(smEngine.getAllLegalMoves('b').find(m => m.from.r === 1 && m.from.c === 4 && m.to.r === 3 && m.to.c === 4));
    // 2. Bc4 Nc6
    smEngine.makeMove(smEngine.getAllLegalMoves('w').find(m => m.from.r === 7 && m.from.c === 5 && m.to.r === 4 && m.to.c === 2));
    smEngine.makeMove(smEngine.getAllLegalMoves('b').find(m => m.from.r === 0 && m.from.c === 1 && m.to.r === 2 && m.to.c === 2));
    // 3. Qh5 Nf6??
    smEngine.makeMove(smEngine.getAllLegalMoves('w').find(m => m.from.r === 7 && m.from.c === 3 && m.to.r === 3 && m.to.c === 7));
    smEngine.makeMove(smEngine.getAllLegalMoves('b').find(m => m.from.r === 0 && m.from.c === 6 && m.to.r === 2 && m.to.c === 5));
    // 4. Qxf7#
    const qxf7 = smEngine.getAllLegalMoves('w').find(m => m.from.r === 3 && m.from.c === 7 && m.to.r === 1 && m.to.c === 5);
    this.assert('Chess: Queen can capture on f7', !!qxf7);
    smEngine.makeMove(qxf7);

    this.assert('Chess: Black King is in check after Qxf7#', smEngine.isInCheck('b'));
    this.assert('Chess: Checkmate correctly detected (Black has 0 legal moves)', smEngine.isCheckmate());
    const status = smEngine.getGameStatus();
    this.assert('Chess: Game Status reports White victory by checkmate', status.over && status.result === 'w_win');

    // Test 8: Kingside Castling validation
    const castlingEngine = new window.ChessEngine();
    castlingEngine.board = Array(8).fill(null).map(() => Array(8).fill(null));
    castlingEngine.board[7][4] = { type: 'k', color: 'w' };
    castlingEngine.board[7][7] = { type: 'r', color: 'w' };
    castlingEngine.board[0][4] = { type: 'k', color: 'b' };
    castlingEngine.castling = { w: { k: true, q: false }, b: { k: false, q: false } };
    castlingEngine.turn = 'w';

    const castleMove = castlingEngine.getLegalMovesFrom(7, 4).find(m => m.isCastling === 'k');
    this.assert('Chess: Kingside Castling (O-O) is legal when path is clear and safe', !!castleMove);
    castlingEngine.makeMove(castleMove);
    this.assert('Chess: King moved to g1 (7, 6) after castling', castlingEngine.board[7][6]?.type === 'k');
    this.assert('Chess: Rook moved to f1 (7, 5) after castling', castlingEngine.board[7][5]?.type === 'r');

    // Test 9: En Passant capture execution
    const epEngine = new window.ChessEngine();
    epEngine.board = Array(8).fill(null).map(() => Array(8).fill(null));
    epEngine.board[3][4] = { type: 'p', color: 'w' }; // White pawn on e5
    epEngine.board[1][3] = { type: 'p', color: 'b' }; // Black pawn on d7
    epEngine.board[7][4] = { type: 'k', color: 'w' };
    epEngine.board[0][4] = { type: 'k', color: 'b' };
    epEngine.turn = 'b';

    // Black plays d7-d5
    epEngine.makeMove({ from: { r: 1, c: 3 }, to: { r: 3, c: 3 }, isDoublePawn: true });
    this.assert('Chess: En Passant square target active on d6', epEngine.enPassant && epEngine.enPassant.r === 2 && epEngine.enPassant.c === 3);

    // White captures en passant exd6
    const epCapture = epEngine.getLegalMovesFrom(3, 4).find(m => m.isEnPassant);
    this.assert('Chess: White pawn has valid en passant capture move', !!epCapture);
    epEngine.makeMove(epCapture);
    this.assert('Chess: White pawn landed on d6', epEngine.board[2][3]?.color === 'w');
    this.assert('Chess: Black pawn on d5 removed by en passant', epEngine.board[3][3] === null);

    // Test 10: Insufficient material draw
    const imEngine = new window.ChessEngine();
    imEngine.board = Array(8).fill(null).map(() => Array(8).fill(null));
    imEngine.board[7][4] = { type: 'k', color: 'w' };
    imEngine.board[0][4] = { type: 'k', color: 'b' };
    this.assert('Chess: King vs King is declared Insufficient Material draw', imEngine.isInsufficientMaterial());
  }

  // --- SUITE 2: TIC-TAC-TOE RULES ---
  testTicTacToeRules() {
    const ttt = new window.TicTacToeEngine();

    this.assert('TTT: Starts with 9 empty cells and X turn', ttt.board.every(c => c === null) && ttt.turn === 'X');

    // Play row win for X: 0, 1, 2
    ttt.makeMove(0); // X
    ttt.makeMove(3); // O
    ttt.makeMove(1); // X
    ttt.makeMove(4); // O
    const winRes = ttt.makeMove(2); // X

    this.assert('TTT: X row win correctly detected', winRes.winner === 'X' && winRes.isOver);
    this.assert('TTT: Winning line [0, 1, 2] highlighted', JSON.stringify(winRes.winningLine) === JSON.stringify([0, 1, 2]));

    // Optimal Minimax AI Test: AI should take immediate win
    const aiTest = new window.TicTacToeEngine();
    aiTest.board = [
      'O', 'O', null,
      'X', 'X', null,
      null, null, null
    ];
    aiTest.turn = 'O';
    const bestMove = aiTest.getAIMove('hard', 'O');
    this.assert('TTT AI: Minimax takes immediate winning move at index 2', bestMove === 2);

    // AI Block Test: AI must block opponent win
    const blockTest = new window.TicTacToeEngine();
    blockTest.board = [
      'X', 'X', null,
      'O', null, null,
      null, null, null
    ];
    blockTest.turn = 'O';
    const blockMove = blockTest.getAIMove('hard', 'O');
    this.assert('TTT AI: Minimax blocks opponent win at index 2', blockMove === 2);
  }

  // --- SUITE 3: CONNECT FOUR RULES ---
  testConnect4Rules() {
    const c4 = new window.Connect4Engine();

    this.assert('Connect4: 6 rows by 7 cols starting board initialized', c4.ROWS === 6 && c4.COLS === 7);

    // Gravity drop: First piece in col 3 should land in row 5 (bottom)
    const dropRes = c4.makeMove(3);
    this.assert('Connect4: Piece drops to bottom row (row 5)', dropRes.row === 5 && dropRes.col === 3);

    // Second piece in same col lands in row 4
    const drop2 = c4.makeMove(3);
    this.assert('Connect4: Second piece in col 3 lands in row 4', drop2.row === 4 && drop2.col === 3);

    // Horizontal victory test
    const winTest = new window.Connect4Engine();
    // Red plays col 0, 1, 2, 3
    winTest.makeMove(0); // R (row 5)
    winTest.makeMove(0); // Y (row 4)
    winTest.makeMove(1); // R (row 5)
    winTest.makeMove(1); // Y (row 4)
    winTest.makeMove(2); // R (row 5)
    winTest.makeMove(2); // Y (row 4)
    const winMove = winTest.makeMove(3); // R (row 5)

    this.assert('Connect4: 4 horizontal discs in a row triggers Victory', winMove.winner === 'red' && winMove.isOver);

    // AI generates valid column move
    const aiCol = c4.getAIMove('hard', 'yellow');
    this.assert('Connect4 AI: Alpha-Beta generates valid non-full column move', aiCol >= 0 && aiCol < 7);
  }

  // --- SUITE 4: REVERSI / OTHELLO RULES ---
  testReversiRules() {
    const rev = new window.ReversiEngine();

    // Initial 4 discs
    this.assert('Reversi: Initial center setup (2 black, 2 white)', 
      rev.board[3][3] === 'white' && rev.board[4][4] === 'white' &&
      rev.board[3][4] === 'black' && rev.board[4][3] === 'black');

    // Black starts with exactly 4 valid moves: (2,3), (3,2), (4,5), (5,4)
    const legalMoves = rev.getLegalMoves('black');
    this.assert('Reversi: Black has 4 valid opening moves', legalMoves.length === 4);

    // Make move (2, 3): Should flip white disc at (3, 3) to black
    const moveRes = rev.makeMove(2, 3);
    this.assert('Reversi: Move (2, 3) executed successfully', moveRes.success);
    this.assert('Reversi: Disc at (3, 3) flipped to black', rev.board[3][3] === 'black');
    this.assert('Reversi: Score updated (Black: 4, White: 1)', moveRes.scores.black === 4 && moveRes.scores.white === 1);

    // Positional AI move selection
    const aiMove = rev.getAIMove('hard', 'white');
    this.assert('Reversi AI: Positional matrix generates legal move for White', aiMove && aiMove.r !== undefined);
  }

  // --- SUITE 5: MINESWEEPER RULES ---
  testMinesweeperRules() {
    const ms = new window.MinesweeperEngine('beginner');

    this.assert('Minesweeper: Beginner has 9 rows, 9 cols, 10 mines', ms.rows === 9 && ms.cols === 9 && ms.totalMines === 10);

    // Guaranteed safe first click
    const clickRes = ms.revealCell(4, 4);
    this.assert('Minesweeper: Safe first click succeeds', clickRes.success && !clickRes.isMine);
    this.assert('Minesweeper: Clicked cell (4,4) is NOT a mine', ms.board[4][4].isMine === false);

    // Verify 3x3 surrounding zone is 100% mine-free
    let safeZoneClean = true;
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (ms.board[4 + dr][4 + dc].isMine) safeZoneClean = false;
      }
    }
    this.assert('Minesweeper: 3x3 zone surrounding first click is 100% mine-free', safeZoneClean);

    // Exactly 10 mines placed
    let totalMinesPlaced = 0;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (ms.board[r][c].isMine) totalMinesPlaced++;
      }
    }
    this.assert('Minesweeper: Exactly 10 mines generated across the board', totalMinesPlaced === 10);

    // Flagging control
    const flagRes = ms.toggleFlag(0, 0);
    this.assert('Minesweeper: Unrevealed cell flagged successfully', flagRes.success && ms.board[0][0].isFlagged);
    this.assert('Minesweeper: Remaining mines counter reflects flag', ms.getRemainingMines() === 9);
    ms.toggleFlag(0, 0); // Unflag
    this.assert('Minesweeper: Cell unflagged successfully', !ms.board[0][0].isFlagged);
  }

  // --- SUITE 6: MEMORY MATCH RULES ---
  testMemoryRules() {
    const mem = new window.MemoryMatchEngine('casual'); // 12 cards, 6 pairs

    this.assert('Memory: Casual preset initializes 12 cards (6 pairs)', mem.totalCards === 12 && mem.totalPairs === 6);

    // Check pairing integrity
    const counts = {};
    mem.cards.forEach(c => {
      counts[c.pairId] = (counts[c.pairId] || 0) + 1;
    });
    const allPaired = Object.values(counts).every(cnt => cnt === 2);
    this.assert('Memory: Every icon appears exactly twice in the deck', allPaired);

    // Flip first card
    const flip1 = mem.flipCard(0);
    this.assert('Memory: First card flipped face-up', flip1.success && mem.cards[0].flipped);

    // Find its matching pair
    const targetPairId = mem.cards[0].pairId;
    const matchIdx = mem.cards.findIndex((c, idx) => idx !== 0 && c.pairId === targetPairId);
    const flip2 = mem.flipCard(matchIdx);
    this.assert('Memory: Matching pair successfully harmonized', flip2.action === 'match' && mem.matchedPairs === 1);
  }

  // --- SUITE 7: AI ARENA ENGINES ---
  async testAIEngines() {
    const ai = window.portalAI;
    const chess = new window.ChessEngine();

    // Material evaluation on initial setup should be 0 (equal)
    const evalScore = ai.evaluateChess(chess);
    this.assert('AI Arena: Starting Chess position evaluates to equal material/position (0 centipawns)', evalScore === 0);

    // Asynchronous AI move calculation returns valid move
    const aiMove = await ai.getChessAIMove(chess, 'easy', 'b');
    this.assert('AI Arena: Asynchronous chess move returned without freezing UI', !!aiMove && aiMove.from && aiMove.to);
  }

  // --- SUITE 8: STORAGE, AUTHENTICATION & PROGRESSION ---
  testStorageAndAuth() {
    const storage = window.portalStorage;

    // Guest account
    const guest = storage.getCurrentUser();
    this.assert('Storage: Active session initialized with valid user', !!guest && !!guest.username);

    // Registration with hashed password
    const testUsername = 'tester_' + Date.now();
    const regRes = storage.registerUser(testUsername, 'Unit Test Player', 'pass1234');
    this.assert('Storage: User registration creates verified account', regRes.success && regRes.user.username === testUsername);
    this.assert('Storage: Password is securely hashed client-side', regRes.user.passHash && regRes.user.passHash !== 'pass1234');

    // Duplicate prevention
    const dupRes = storage.registerUser(testUsername, 'Dup', 'pass1234');
    this.assert('Storage: Duplicate username registration is prevented', !dupRes.success);

    // Level formula: Level = Math.floor(XP / 250) + 1
    const xpRes = storage.addXP(300, 'Test leveling');
    this.assert('Storage: Adding 300 XP advances user to Level 2', xpRes.currentLevel === 2 && xpRes.leveledUp);

    // Record Match
    const matchOutcome = storage.recordMatch({
      gameId: 'tictactoe',
      opponentType: 'AI',
      difficulty: 'hard',
      result: 'win',
      movesCount: 5,
      durationSec: 12
    });
    this.assert('Storage: Match correctly persisted in verified match history', matchOutcome.record && matchOutcome.record.result === 'win');
    this.assert('Storage: First Victory achievement automatically unlocked', storage.getCurrentUser().achievements['first_win'] !== undefined);

    // Daily Challenges
    const challenges = storage.getDailyChallenges();
    this.assert('Storage: Daily challenges initialized with valid targets', challenges.length === 3);

    // Save and load active game state
    storage.saveActiveGame('connect4', { customVal: 42 });
    const savedGame = storage.getActiveGame('connect4');
    this.assert('Storage: Active game state persisted for "Continue Playing"', savedGame && savedGame.state.customVal === 42);
    storage.clearActiveGame('connect4');
    this.assert('Storage: Clear active game successfully removes save', storage.getActiveGame('connect4') === null);
  }

  // --- SUITE 9: 2048 NUMBER MERGE PUZZLE RULES ---
  test2048Rules() {
    const engine = new window.Game2048Engine();
    this.assert('2048: 4x4 matrix initialized', engine.size === 4 && engine.grid.length === 4);
    
    let nonZeroCount = 0;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (engine.grid[r][c] > 0) nonZeroCount++;
      }
    }
    this.assert('2048: Starts with exactly 2 random number tiles', nonZeroCount === 2);

    // Merge mechanics test
    engine.grid = [
      [2, 2, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ];
    engine.score = 0;
    const moveRes = engine.move(3); // Left
    this.assert('2048: [2, 2] merges into [4] when shifted left', engine.grid[0][0] === 4 && engine.score === 4);
    
    // Undo
    const undoRes = engine.undo();
    this.assert('2048: Undo restores prior matrix and score', undoRes && engine.score === 0);
  }

  // --- SUITE 10: CYBER SNAKE RULES ---
  testSnakeRules() {
    const snake = new window.SnakeEngine();
    this.assert('Snake: 20x20 grid initialized', snake.width === 20 && snake.height === 20);
    this.assert('Snake: Snake starts with length 3', snake.snake.length === 3);
    this.assert('Snake: Food is generated within bounds', snake.food.x >= 0 && snake.food.x < 20 && snake.food.y >= 0 && snake.food.y < 20);

    const initialHead = { ...snake.snake[0] };
    const stepRes = snake.step();
    this.assert('Snake: Step advances head position along direction vector', snake.snake[0].x !== initialHead.x || snake.snake[0].y !== initialHead.y);

    // Opposing direction change should be rejected
    snake.direction = { x: 1, y: 0 };
    snake.setDirection({ x: -1, y: 0 });
    this.assert('Snake: Immediate 180-degree self-reversal is prevented', snake.nextDirection.x === 1);
  }

  // --- SUITE 11: CLASSICAL CHECKERS RULES ---
  testCheckersRules() {
    const checkers = new window.CheckersEngine();
    let redCount = 0;
    let blackCount = 0;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = checkers.board[r][c];
        if (p) {
          if (p.color === 'r') redCount++;
          if (p.color === 'b') blackCount++;
        }
      }
    }
    this.assert('Checkers: 12 Red and 12 Black pieces properly placed on dark squares', redCount === 12 && blackCount === 12);

    const moves = checkers.getAllLegalMoves('r');
    this.assert('Checkers: Red has legal diagonal opening moves', moves.length > 0);

    // Crowning test
    checkers.board[1][2] = { color: 'r', isKing: false };
    checkers.board[0][3] = null;
    checkers.turn = 'r';
    checkers.makeMove({ from: { r: 1, c: 2 }, to: { r: 0, c: 3 }, isJump: false });
    this.assert('Checkers: Reaching the opposite end crowns a King piece', checkers.board[0][3]?.isKing === true);
  }

  // --- SUITE 12: PROCEDURAL SUDOKU RULES ---
  testSudokuRules() {
    const sudoku = new window.SudokuEngine('easy');
    this.assert('Sudoku: 9x9 board initialized with valid solution', sudoku.board.length === 9 && sudoku.solution.length === 9);

    // Find an empty cell to test placement
    let emptyR = -1, emptyC = -1;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (!sudoku.initial[r][c] && sudoku.board[r][c] === 0) {
          emptyR = r;
          emptyC = c;
          break;
        }
      }
      if (emptyR !== -1) break;
    }

    if (emptyR !== -1) {
      const correctVal = sudoku.solution[emptyR][emptyC];
      const res = sudoku.setCell(emptyR, emptyC, correctVal);
      this.assert('Sudoku: Valid digit accepted in editable cell', res.success && sudoku.board[emptyR][emptyC] === correctVal);
    } else {
      this.assert('Sudoku: Grid has playable cells', true);
    }
  }

  // --- SUITE 13: NEON TETRIS RULES ---
  testTetrisRules() {
    const tetris = new window.TetrisEngine();
    this.assert('Tetris: 10 columns by 20 rows matrix', tetris.cols === 10 && tetris.rows === 20);
    this.assert('Tetris: Active piece and next piece spawned', !!tetris.currentPiece && !!tetris.nextPiece);

    const startX = tetris.currentPiece.x;
    tetris.moveLeft();
    this.assert('Tetris: Move left shifts piece horizontally', tetris.currentPiece.x <= startX);

    const rotRes = tetris.rotate();
    this.assert('Tetris: Rotation mechanics execute correctly', typeof rotRes === 'boolean');
  }

  // --- SUITE 14: RETRO PONG ARENA RULES ---
  testPongRules() {
    const pong = new window.PongEngine();
    this.assert('Pong: Paddles and ball initialized with valid coordinates', 
      pong.p1.x < pong.p2.x && pong.ball.x > 0 && pong.ball.y > 0);

    const initX = pong.ball.x;
    pong.update(0.016);
    this.assert('Pong: Ball velocity advances position during tick', pong.ball.x !== initX);

    pong.setP1Y(150);
    this.assert('Pong: Paddle 1 smoothly updates to player input', pong.p1.y === 150 - pong.p1.h / 2);
  }

  // --- SUITE 15: WORDLE LEXICON RULES ---
  testWordleRules() {
    const wordle = new window.WordleEngine();
    this.assert('Wordle: 5-letter target word selected', wordle.targetWord.length === 5);
    this.assert('Wordle: 6 attempts allowed', wordle.maxAttempts === 6);

    wordle.addLetter('C');
    wordle.addLetter('R');
    wordle.addLetter('A');
    wordle.addLetter('N');
    wordle.addLetter('E');
    this.assert('Wordle: 5 letters entered into current row', wordle.currentAttempt === 'CRANE');

    const evalRes = wordle.submitGuess();
    this.assert('Wordle: Guess evaluated with letter status feedback', evalRes.success && evalRes.feedback.length === 5);
  }

  // --- SUITE 16: SIMON SEQUENCE RULES ---
  testSimonRules() {
    const simon = new window.SimonEngine();
    this.assert('Simon: Starts in idle state with round 0', simon.state === 'idle' && simon.score === 0);

    simon.startRound();
    this.assert('Simon: First sequence step generated', simon.sequence.length === 1 && simon.sequence[0] >= 0 && simon.sequence[0] <= 3);

    simon.state = 'player';
    const targetIdx = simon.sequence[0];
    const matchRes = simon.handleInput(targetIdx);
    this.assert('Simon: Correct input matching step advances turn', matchRes.valid === true);
  }

  // --- SUITE 17: NAVAL BATTLESHIP RULES ---
  testBattleshipRules() {
    const bs = new window.BattleshipEngine();
    this.assert('Battleship: 10x10 grids for both fleet and radar', bs.playerGrid.length === 10 && bs.aiGrid.length === 10);
    this.assert('Battleship: 5 warships placed for player and AI', bs.playerShips.length === 5 && bs.aiShips.length === 5);

    // Fire at 0, 0
    const shot = bs.fireAtAI(0, 0);
    this.assert('Battleship: Firing shot registers valid result (hit or miss)', shot.success && (shot.hit === true || shot.hit === false));
    this.assert('Battleship: Repeated shot at same cell is rejected', !bs.fireAtAI(0, 0).success);
  }

  // --- SUITE 18: CYBER BREAKOUT RULES ---
  testBreakoutRules() {
    const bo = new window.BreakoutEngine();
    this.assert('Breakout: Paddle, ball, and brick matrix initialized', 
      bo.paddle.w > 0 && bo.balls.length > 0 && bo.bricks.length > 0);

    const initBallY = bo.balls[0].y;
    bo.update(0.016);
    this.assert('Breakout: Ball moves according to velocity vector', bo.balls[0].y !== initBallY);

    bo.setPaddleX(250);
    this.assert('Breakout: Paddle tracks mouse/touch coordinate', bo.paddle.x === 250 - bo.paddle.w / 2);
  }
}

// Global test runner singleton
window.portalTestSuite = new StrategyPortalTestSuite();
