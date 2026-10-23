/**
 * ============================================================================
 * NEON TETRIS (BRICK FALL) ARCADE ENGINE
 * 10x20 Matrix, 7 Shapes, Ghost Projection, Hold Queue & Line Clears
 * ============================================================================
 */

class TetrisEngine {
  constructor() {
    this.cols = 10;
    this.rows = 20;
    this.grid = Array.from({ length: this.rows }, () => Array(this.cols).fill(0));
    this.score = 0;
    this.lines = 0;
    this.level = 1;
    this.gameOver = false;
    this.bestScore = parseInt(localStorage.getItem('TETRIS_BEST_SCORE') || '0', 10);
    this.holdPiece = null;
    this.canHold = true;
    this.shapes = {
      I: { shape: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]], color: '#00d2ff' },
      O: { shape: [[1,1],[1,1]], color: '#f59e0b' },
      T: { shape: [[0,1,0],[1,1,1],[0,0,0]], color: '#a855f7' },
      S: { shape: [[0,1,1],[1,1,0],[0,0,0]], color: '#10b981' },
      Z: { shape: [[1,1,0],[0,1,1],[0,0,0]], color: '#ef4444' },
      J: { shape: [[1,0,0],[1,1,1],[0,0,0]], color: '#3b82f6' },
      L: { shape: [[0,0,1],[1,1,1],[0,0,0]], color: '#f97316' }
    };
    this.nextPieceType = this.randomPieceType();
    this.init();
  }

  get nextPiece() {
    return this.nextPieceType;
  }

  assignPieceProperties(piece) {
    if (!piece) return;
    Object.defineProperty(piece, 'x', {
      get: () => this.currentPos.x,
      set: (val) => { this.currentPos.x = val; },
      configurable: true
    });
    Object.defineProperty(piece, 'y', {
      get: () => this.currentPos.y,
      set: (val) => { this.currentPos.y = val; },
      configurable: true
    });
  }

  init() {
    this.grid = Array.from({ length: this.rows }, () => Array(this.cols).fill(0));
    this.score = 0;
    this.lines = 0;
    this.level = 1;
    this.gameOver = false;
    this.holdPiece = null;
    this.canHold = true;
    this.nextPieceType = this.randomPieceType();
    this.spawnPiece();
  }

  randomPieceType() {
    const types = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
    return types[Math.floor(Math.random() * types.length)];
  }

  spawnPiece() {
    this.currentType = this.nextPieceType;
    this.nextPieceType = this.randomPieceType();
    this.currentPiece = this.shapes[this.currentType].shape.map(r => [...r]);
    this.currentColor = this.shapes[this.currentType].color;
    this.currentPos = {
      x: Math.floor((this.cols - this.currentPiece[0].length) / 2),
      y: 0
    };
    this.assignPieceProperties(this.currentPiece);
    this.canHold = true;

    // Check collision on spawn -> Game Over
    if (this.collides(this.currentPiece, this.currentPos)) {
      this.gameOver = true;
    }
  }

  collides(piece, pos) {
    for (let r = 0; r < piece.length; r++) {
      for (let c = 0; c < piece[r].length; c++) {
        if (piece[r][c]) {
          const x = pos.x + c;
          const y = pos.y + r;
          if (x < 0 || x >= this.cols || y >= this.rows) return true;
          if (y >= 0 && this.grid[y][x]) return true;
        }
      }
    }
    return false;
  }

  moveLeft() {
    if (this.gameOver) return false;
    const nextPos = { x: this.currentPos.x - 1, y: this.currentPos.y };
    if (!this.collides(this.currentPiece, nextPos)) {
      this.currentPos = nextPos;
      return true;
    }
    return false;
  }

  moveRight() {
    if (this.gameOver) return false;
    const nextPos = { x: this.currentPos.x + 1, y: this.currentPos.y };
    if (!this.collides(this.currentPiece, nextPos)) {
      this.currentPos = nextPos;
      return true;
    }
    return false;
  }

  rotate() {
    if (this.gameOver) return false;
    const N = this.currentPiece.length;
    const rotated = Array.from({ length: N }, () => Array(N).fill(0));
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        rotated[c][N - 1 - r] = this.currentPiece[r][c];
      }
    }

    // Try basic rotation or wall kick
    if (!this.collides(rotated, this.currentPos)) {
      this.currentPiece = rotated;
      this.assignPieceProperties(this.currentPiece);
      return true;
    }
    // Wall kick left
    if (!this.collides(rotated, { x: this.currentPos.x - 1, y: this.currentPos.y })) {
      this.currentPos.x -= 1;
      this.currentPiece = rotated;
      this.assignPieceProperties(this.currentPiece);
      return true;
    }
    // Wall kick right
    if (!this.collides(rotated, { x: this.currentPos.x + 1, y: this.currentPos.y })) {
      this.currentPos.x += 1;
      this.currentPiece = rotated;
      this.assignPieceProperties(this.currentPiece);
      return true;
    }
    return false;
  }

  stepDown() {
    if (this.gameOver) return { locked: false, gameOver: true };
    const nextPos = { x: this.currentPos.x, y: this.currentPos.y + 1 };
    if (!this.collides(this.currentPiece, nextPos)) {
      this.currentPos = nextPos;
      return { locked: false, gameOver: false };
    } else {
      return this.lockPiece();
    }
  }

  hardDrop() {
    if (this.gameOver) return;
    while (!this.collides(this.currentPiece, { x: this.currentPos.x, y: this.currentPos.y + 1 })) {
      this.currentPos.y++;
    }
    return this.lockPiece();
  }

  hold() {
    if (!this.canHold || this.gameOver) return false;
    const temp = this.currentType;
    if (this.holdPiece) {
      this.currentType = this.holdPiece;
      this.currentPiece = this.shapes[this.currentType].shape.map(r => [...r]);
      this.currentColor = this.shapes[this.currentType].color;
      this.currentPos = {
        x: Math.floor((this.cols - this.currentPiece[0].length) / 2),
        y: 0
      };
    } else {
      this.spawnPiece();
    }
    this.holdPiece = temp;
    this.canHold = false;
    return true;
  }

  getGhostPosition() {
    let ghostY = this.currentPos.y;
    while (!this.collides(this.currentPiece, { x: this.currentPos.x, y: ghostY + 1 })) {
      ghostY++;
    }
    return { x: this.currentPos.x, y: ghostY };
  }

  lockPiece() {
    for (let r = 0; r < this.currentPiece.length; r++) {
      for (let c = 0; c < this.currentPiece[r].length; c++) {
        if (this.currentPiece[r][c]) {
          const x = this.currentPos.x + c;
          const y = this.currentPos.y + r;
          if (y >= 0 && y < this.rows && x >= 0 && x < this.cols) {
            this.grid[y][x] = this.currentColor;
          }
        }
      }
    }

    // Clear lines
    let cleared = 0;
    for (let y = this.rows - 1; y >= 0; y--) {
      if (this.grid[y].every(cell => cell !== 0)) {
        this.grid.splice(y, 1);
        this.grid.unshift(Array(this.cols).fill(0));
        cleared++;
        y++; // Check same row index again after shift
      }
    }

    if (cleared > 0) {
      this.lines += cleared;
      const pts = [0, 100, 300, 500, 800];
      this.score += (pts[cleared] || 1000) * this.level;
      this.level = Math.floor(this.lines / 10) + 1;

      if (this.score > this.bestScore) {
        this.bestScore = this.score;
        localStorage.setItem('TETRIS_BEST_SCORE', this.bestScore.toString());
      }
    }

    this.spawnPiece();

    return {
      locked: true,
      cleared,
      score: this.score,
      lines: this.lines,
      level: this.level,
      gameOver: this.gameOver
    };
  }

  getDropInterval() {
    // Speed decreases as level increases
    return Math.max(120, 800 - (this.level - 1) * 70);
  }
}

window.TetrisEngine = TetrisEngine;
