/**
 * ============================================================================
 * CYBER PONG (NEON PADDLE VS AI) ARCADE ENGINE
 * High-performance 60fps Canvas, Spin Physics, AI Difficulty & Particle Effects
 * ============================================================================
 */

class PongEngine {
  constructor(difficulty = 'medium', targetScore = 5) {
    this.width = 600;
    this.height = 400;
    this.difficulty = difficulty;
    this.targetScore = targetScore;
    this.playerScore = 0;
    this.aiScore = 0;
    this.winner = null;
    this.paused = false;
    this.particles = [];
    this.init();
  }

  init(difficulty = this.difficulty) {
    this.difficulty = difficulty;
    this.playerScore = 0;
    this.aiScore = 0;
    this.winner = null;
    this.paused = false;
    this.particles = [];

    this.paddleHeight = 70;
    this.paddleWidth = 12;
    this.playerY = (this.height - this.paddleHeight) / 2;
    this.aiY = (this.height - this.paddleHeight) / 2;

    this.resetBall(1);
  }

  get p1() {
    return {
      x: 20,
      y: this.playerY,
      w: this.paddleWidth,
      h: this.paddleHeight
    };
  }

  get p2() {
    return {
      x: this.width - 20 - this.paddleWidth,
      y: this.aiY,
      w: this.paddleWidth,
      h: this.paddleHeight
    };
  }

  setP1Y(targetY) {
    this.playerY = targetY - this.paddleHeight / 2;
  }

  resetBall(direction = 1) {
    this.ball = {
      x: this.width / 2,
      y: this.height / 2,
      vx: direction * 5,
      vy: (Math.random() * 4 - 2),
      radius: 7,
      speed: 5
    };
  }

  createSparks(x, y, color = '#00d2ff') {
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        radius: Math.random() * 2 + 1,
        color,
        life: 1.0
      });
    }
  }

  update(playerTargetY) {
    if (this.winner || this.paused) return { active: false };

    // Update Player Paddle
    if (playerTargetY !== undefined && typeof playerTargetY === 'number' && playerTargetY >= 1) {
      const clamped = Math.max(0, Math.min(this.height - this.paddleHeight, playerTargetY - this.paddleHeight / 2));
      this.playerY += (clamped - this.playerY) * 0.3; // Smooth lerp
    }

    // Update AI Paddle
    let aiSpeed = 3.5;
    if (this.difficulty === 'easy') aiSpeed = 2.4;
    if (this.difficulty === 'hard') aiSpeed = 4.8;

    const aiCenter = this.aiY + this.paddleHeight / 2;
    // Add small reaction delay/error on easy/medium
    let targetAI = this.ball.y;
    if (this.difficulty === 'easy' && Math.random() < 0.2) {
      targetAI += (Math.random() * 60 - 30);
    }

    if (aiCenter < targetAI - 8) {
      this.aiY += Math.min(aiSpeed, targetAI - aiCenter);
    } else if (aiCenter > targetAI + 8) {
      this.aiY -= Math.min(aiSpeed, aiCenter - targetAI);
    }
    this.aiY = Math.max(0, Math.min(this.height - this.paddleHeight, this.aiY));

    // Move Ball
    this.ball.x += this.ball.vx;
    this.ball.y += this.ball.vy;

    // Top / Bottom collision
    if (this.ball.y - this.ball.radius <= 0) {
      this.ball.y = this.ball.radius;
      this.ball.vy *= -1;
      this.createSparks(this.ball.x, 0, '#f5d77f');
    } else if (this.ball.y + this.ball.radius >= this.height) {
      this.ball.y = this.height - this.ball.radius;
      this.ball.vy *= -1;
      this.createSparks(this.ball.x, this.height, '#f5d77f');
    }

    // Player Paddle Collision (Left)
    const playerPaddleX = 20;
    if (
      this.ball.x - this.ball.radius <= playerPaddleX + this.paddleWidth &&
      this.ball.x + this.ball.radius >= playerPaddleX &&
      this.ball.y >= this.playerY &&
      this.ball.y <= this.playerY + this.paddleHeight
    ) {
      // Impact offset gives angle
      const hitOffset = (this.ball.y - (this.playerY + this.paddleHeight / 2)) / (this.paddleHeight / 2);
      this.ball.speed = Math.min(11, this.ball.speed + 0.35);
      const angle = hitOffset * (Math.PI / 3); // Max 60 deg
      this.ball.vx = Math.abs(Math.cos(angle) * this.ball.speed);
      this.ball.vy = Math.sin(angle) * this.ball.speed;
      this.ball.x = playerPaddleX + this.paddleWidth + this.ball.radius;
      this.createSparks(this.ball.x, this.ball.y, '#00d2ff');
      window.portalAudio?.playClick?.();
    }

    // AI Paddle Collision (Right)
    const aiPaddleX = this.width - 20 - this.paddleWidth;
    if (
      this.ball.x + this.ball.radius >= aiPaddleX &&
      this.ball.x - this.ball.radius <= aiPaddleX + this.paddleWidth &&
      this.ball.y >= this.aiY &&
      this.ball.y <= this.aiY + this.paddleHeight
    ) {
      const hitOffset = (this.ball.y - (this.aiY + this.paddleHeight / 2)) / (this.paddleHeight / 2);
      this.ball.speed = Math.min(11, this.ball.speed + 0.35);
      const angle = hitOffset * (Math.PI / 3);
      this.ball.vx = -Math.abs(Math.cos(angle) * this.ball.speed);
      this.ball.vy = Math.sin(angle) * this.ball.speed;
      this.ball.x = aiPaddleX - this.ball.radius;
      this.createSparks(this.ball.x, this.ball.y, '#f59e0b');
      window.portalAudio?.playClick?.();
    }

    // Score Check
    let scored = false;
    if (this.ball.x < 0) {
      // AI scores
      this.aiScore++;
      scored = true;
      this.resetBall(1);
    } else if (this.ball.x > this.width) {
      // Player scores
      this.playerScore++;
      scored = true;
      this.resetBall(-1);
    }

    // Check Match Conclusion
    if (this.playerScore >= this.targetScore) {
      this.winner = 'player';
    } else if (this.aiScore >= this.targetScore) {
      this.winner = 'ai';
    }

    // Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.04;
      if (p.life <= 0) this.particles.splice(i, 1);
    }

    return {
      active: true,
      scored,
      playerScore: this.playerScore,
      aiScore: this.aiScore,
      winner: this.winner
    };
  }
}

window.PongEngine = PongEngine;
