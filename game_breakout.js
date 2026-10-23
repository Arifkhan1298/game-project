/**
 * ============================================================================
 * BREAKOUT (ARCADE BRICK BREAKER) ENGINE
 * Canvas 60fps, Destructible Bricks, Power-Up Drops (Laser/Multi/Wide) & Lives
 * ============================================================================
 */

class BreakoutEngine {
  constructor() {
    this.width = 600;
    this.height = 420;
    this.lives = 3;
    this.score = 0;
    this.bestScore = parseInt(localStorage.getItem('BREAKOUT_BEST_SCORE') || '0', 10);
    this.gameOver = false;
    this.gameWon = false;
    this.paused = false;
    this.powerups = [];
    this.particles = [];
    this.balls = [];
    this.lasers = [];
    this.laserActiveUntil = 0;
    this.wideActiveUntil = 0;
    this.init();
  }

  init() {
    this.lives = 3;
    this.score = 0;
    this.gameOver = false;
    this.gameWon = false;
    this.paused = false;
    this.powerups = [];
    this.particles = [];
    this.lasers = [];
    this.laserActiveUntil = 0;
    this.wideActiveUntil = 0;

    this.paddleWidth = 90;
    this.paddleHeight = 12;
    this.paddleX = (this.width - this.paddleWidth) / 2;
    this.paddleY = this.height - 30;

    this.balls = [
      {
        x: this.width / 2,
        y: this.paddleY - 12,
        vx: 3.5 * (Math.random() > 0.5 ? 1 : -1),
        vy: -4.5,
        radius: 6,
        speed: 5.5
      }
    ];

    this.createBricks();
  }

  createBricks() {
    this.bricks = [];
    const rows = 5;
    const cols = 8;
    const brickWidth = 62;
    const brickHeight = 18;
    const padding = 8;
    const offsetTop = 40;
    const offsetLeft = (this.width - (cols * (brickWidth + padding) - padding)) / 2;

    const colors = ['#ef4444', '#f59e0b', '#10b981', '#00d2ff', '#a855f7'];
    const pointValues = [50, 40, 30, 20, 10];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        this.bricks.push({
          x: offsetLeft + c * (brickWidth + padding),
          y: offsetTop + r * (brickHeight + padding),
          w: brickWidth,
          h: brickHeight,
          color: colors[r],
          pts: pointValues[r],
          alive: true
        });
      }
    }
  }

  createSparks(x, y, color) {
    for (let i = 0; i < 7; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 5,
        vy: (Math.random() - 0.5) * 5,
        color,
        life: 1.0
      });
    }
  }

  spawnPowerup(x, y) {
    if (Math.random() < 0.28) {
      const types = ['wide', 'multi', 'laser'];
      const type = types[Math.floor(Math.random() * types.length)];
      this.powerups.push({
        x,
        y,
        type,
        vy: 2.2,
        w: 24,
        h: 24
      });
    }
  }

  fireLaser() {
    if (Date.now() > this.laserActiveUntil) return;
    this.lasers.push({ x: this.paddleX + 10, y: this.paddleY, vy: -7, w: 4, h: 12 });
    this.lasers.push({ x: this.paddleX + this.paddleWidth - 14, y: this.paddleY, vy: -7, w: 4, h: 12 });
    window.portalAudio?.playClick?.();
  }

  get paddle() {
    return {
      x: this.paddleX,
      y: this.paddleY,
      w: this.paddleWidth,
      h: this.paddleHeight
    };
  }

  setPaddleX(targetX) {
    this.paddleX = targetX - this.paddleWidth / 2;
  }

  update(mouseOrTargetX) {
    if (this.gameOver || this.gameWon || this.paused) return { active: false };

    // Update Paddle Width if powerup active
    if (Date.now() < this.wideActiveUntil) {
      this.paddleWidth = 140;
    } else {
      this.paddleWidth = 90;
    }

    // Move Paddle
    if (mouseOrTargetX !== undefined && typeof mouseOrTargetX === 'number' && mouseOrTargetX > 1) {
      this.paddleX = Math.max(0, Math.min(this.width - this.paddleWidth, mouseOrTargetX - this.paddleWidth / 2));
    }

    // Update Balls
    for (let bIdx = this.balls.length - 1; bIdx >= 0; bIdx--) {
      const b = this.balls[bIdx];
      b.x += b.vx;
      b.y += b.vy;

      // Wall reflections
      if (b.x - b.radius <= 0) {
        b.x = b.radius;
        b.vx *= -1;
      } else if (b.x + b.radius >= this.width) {
        b.x = this.width - b.radius;
        b.vx *= -1;
      }

      if (b.y - b.radius <= 0) {
        b.y = b.radius;
        b.vy *= -1;
      }

      // Paddle collision
      if (
        b.y + b.radius >= this.paddleY &&
        b.y - b.radius <= this.paddleY + this.paddleHeight &&
        b.x >= this.paddleX - 4 &&
        b.x <= this.paddleX + this.paddleWidth + 4 &&
        b.vy > 0
      ) {
        const hitOffset = (b.x - (this.paddleX + this.paddleWidth / 2)) / (this.paddleWidth / 2);
        const angle = hitOffset * (Math.PI / 3); // Max 60 deg
        const speed = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
        b.vx = Math.sin(angle) * speed;
        b.vy = -Math.cos(angle) * speed;
        this.createSparks(b.x, this.paddleY, '#d4af37');
        window.portalAudio?.playClick?.();
      }

      // Brick collisions
      for (const brick of this.bricks) {
        if (!brick.alive) continue;
        if (
          b.x + b.radius >= brick.x &&
          b.x - b.radius <= brick.x + brick.w &&
          b.y + b.radius >= brick.y &&
          b.y - b.radius <= brick.y + brick.h
        ) {
          brick.alive = false;
          b.vy *= -1;
          this.score += brick.pts;
          this.createSparks(brick.x + brick.w / 2, brick.y + brick.h / 2, brick.color);
          this.spawnPowerup(brick.x + brick.w / 2, brick.y + brick.h / 2);
          window.portalAudio?.playCapture?.();
          break;
        }
      }

      // Bottom death
      if (b.y - b.radius > this.height) {
        this.balls.splice(bIdx, 1);
      }
    }

    // Check if all balls lost
    if (this.balls.length === 0) {
      this.lives--;
      if (this.lives <= 0) {
        this.gameOver = true;
      } else {
        // Respawn single ball
        this.balls.push({
          x: this.paddleX + this.paddleWidth / 2,
          y: this.paddleY - 14,
          vx: 3.5 * (Math.random() > 0.5 ? 1 : -1),
          vy: -4.5,
          radius: 6,
          speed: 5.5
        });
      }
    }

    // Update Lasers
    for (let lIdx = this.lasers.length - 1; lIdx >= 0; lIdx--) {
      const laser = this.lasers[lIdx];
      laser.y += laser.vy;

      for (const brick of this.bricks) {
        if (!brick.alive) continue;
        if (
          laser.x >= brick.x &&
          laser.x <= brick.x + brick.w &&
          laser.y >= brick.y &&
          laser.y <= brick.y + brick.h
        ) {
          brick.alive = false;
          this.score += brick.pts;
          this.createSparks(brick.x + brick.w / 2, brick.y + brick.h / 2, brick.color);
          this.lasers.splice(lIdx, 1);
          break;
        }
      }

      if (laser.y < 0) this.lasers.splice(lIdx, 1);
    }

    // Update Powerups
    for (let pIdx = this.powerups.length - 1; pIdx >= 0; pIdx--) {
      const p = this.powerups[pIdx];
      p.y += p.vy;

      // Check paddle catch
      if (
        p.y + p.h >= this.paddleY &&
        p.y <= this.paddleY + this.paddleHeight &&
        p.x + p.w >= this.paddleX &&
        p.x <= this.paddleX + this.paddleWidth
      ) {
        // Apply powerup
        if (p.type === 'wide') {
          this.wideActiveUntil = Date.now() + 10000;
        } else if (p.type === 'multi') {
          if (this.balls.length > 0) {
            const src = this.balls[0];
            this.balls.push(
              { x: src.x, y: src.y, vx: src.vx - 2, vy: src.vy, radius: 6, speed: 5.5 },
              { x: src.x, y: src.y, vx: src.vx + 2, vy: src.vy, radius: 6, speed: 5.5 }
            );
          }
        } else if (p.type === 'laser') {
          this.laserActiveUntil = Date.now() + 8000;
        }
        window.portalAudio?.playAchievement?.();
        this.powerups.splice(pIdx, 1);
      } else if (p.y > this.height) {
        this.powerups.splice(pIdx, 1);
      }
    }

    // Check Victory
    if (this.bricks.every(b => !b.alive)) {
      this.gameWon = true;
    }

    if (this.score > this.bestScore) {
      this.bestScore = this.score;
      localStorage.setItem('BREAKOUT_BEST_SCORE', this.bestScore.toString());
    }

    // Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const part = this.particles[i];
      part.x += part.vx;
      part.y += part.vy;
      part.life -= 0.04;
      if (part.life <= 0) this.particles.splice(i, 1);
    }

    return {
      active: true,
      score: this.score,
      lives: this.lives,
      gameOver: this.gameOver,
      gameWon: this.gameWon
    };
  }
}

window.BreakoutEngine = BreakoutEngine;
