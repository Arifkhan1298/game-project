/**
 * ============================================================================
 * CYBER RETRO SNAKE ARCADE ENGINE
 * Smooth Grid Navigation, Dynamic Food Spawns, Speed Ramp, and Score Tracking
 * ============================================================================
 */

class SnakeEngine {
  constructor(cols = 20, rows = 20) {
    this.cols = cols;
    this.rows = rows;
    this.score = 0;
    this.bestScore = parseInt(localStorage.getItem('SNAKE_BEST_SCORE') || '0', 10);
    this.speed = 130; // ms per tick
    this.minSpeed = 65;
    this.gameOver = false;
    this.paused = false;
    this.goldenFood = null;
    this.goldenTimer = null;
    this.init();
  }

  get width() { return this.cols; }
  set width(val) { this.cols = val; }
  get height() { return this.rows; }
  set height(val) { this.rows = val; }
  get direction() { return this.dir; }
  set direction(val) { this.dir = val; }
  get nextDirection() { return this.nextDir; }
  set nextDirection(val) { this.nextDir = val; }

  init() {
    this.snake = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 }
    ];
    this.dir = { x: 1, y: 0 };
    this.nextDir = { x: 1, y: 0 };
    this.score = 0;
    this.speed = 130;
    this.gameOver = false;
    this.paused = false;
    this.goldenFood = null;
    this.spawnFood();
  }

  spawnFood() {
    let emptyCells = [];
    for (let x = 0; x < this.cols; x++) {
      for (let y = 0; y < this.rows; y++) {
        if (!this.snake.some(segment => segment.x === x && segment.y === y)) {
          emptyCells.push({ x, y });
        }
      }
    }
    if (emptyCells.length > 0) {
      this.food = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    }

    // Chance to spawn golden bonus fruit (15% chance if score > 30 and no active golden food)
    if (Math.random() < 0.25 && !this.goldenFood && this.score >= 20) {
      const remaining = emptyCells.filter(c => c.x !== this.food.x || c.y !== this.food.y);
      if (remaining.length > 0) {
        this.goldenFood = remaining[Math.floor(Math.random() * remaining.length)];
        this.goldenExpiresAt = Date.now() + 7000; // 7 seconds
      }
    }
  }

  setDirection(newDir) {
    // Prevent 180-degree instant reversal
    if (newDir.x === -this.dir.x && newDir.y === -this.dir.y) return false;
    this.nextDir = newDir;
    return true;
  }

  step() {
    if (this.gameOver || this.paused) return { active: false };

    this.dir = this.nextDir;
    const head = { x: this.snake[0].x + this.dir.x, y: this.snake[0].y + this.dir.y };

    // Wall collision
    if (head.x < 0 || head.x >= this.cols || head.y < 0 || head.y >= this.rows) {
      this.gameOver = true;
      return { active: true, over: true, reason: 'Collision with perimeter barrier.' };
    }

    // Self collision
    if (this.snake.some(seg => seg.x === head.x && seg.y === head.y)) {
      this.gameOver = true;
      return { active: true, over: true, reason: 'Collision with your own trail.' };
    }

    this.snake.unshift(head);

    let ateFood = false;
    let ateGolden = false;

    // Check normal food
    if (this.food && head.x === this.food.x && head.y === this.food.y) {
      this.score += 10;
      ateFood = true;
      this.speed = Math.max(this.minSpeed, this.speed - 2); // Accelerate
      this.spawnFood();
    } 
    // Check golden food
    else if (this.goldenFood && head.x === this.goldenFood.x && head.y === this.goldenFood.y) {
      this.score += 50;
      ateGolden = true;
      this.goldenFood = null;
    } else {
      this.snake.pop(); // Remove tail
    }

    // Check golden expiration
    if (this.goldenFood && Date.now() > this.goldenExpiresAt) {
      this.goldenFood = null;
    }

    if (this.score > this.bestScore) {
      this.bestScore = this.score;
      localStorage.setItem('SNAKE_BEST_SCORE', this.bestScore.toString());
    }

    return {
      active: true,
      over: false,
      ateFood,
      ateGolden,
      score: this.score,
      speed: this.speed
    };
  }
}

window.SnakeEngine = SnakeEngine;
