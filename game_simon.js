/**
 * ============================================================================
 * SIMON SAYS (NEON SEQUENCE MEMORY) ENGINE
 * 4 Glowing Color Pads, Audio Chimes, Streak Counter & High Score
 * ============================================================================
 */

class SimonEngine {
  constructor() {
    this.sequence = [];
    this.playerStep = 0;
    this.score = 0;
    this.bestScore = parseInt(localStorage.getItem('SIMON_BEST_SCORE') || '0', 10);
    this.isPlayingSequence = false;
    this.gameOver = false;
    this.padFrequencies = [329.6, 261.6, 440.0, 392.0]; // E4, C4, A4, G4
    this.padColors = ['emerald', 'crimson', 'amber', 'cyan'];
    this.init();
  }

  init() {
    this.sequence = [];
    this.playerStep = 0;
    this.score = 0;
    this.state = 'idle';
    this.isPlayingSequence = false;
    this.gameOver = false;
  }

  startRound() {
    this.state = 'simon';
    return this.nextRound();
  }

  handleInput(padIndex) {
    return this.pressPad(padIndex);
  }

  nextRound() {
    this.playerStep = 0;
    const nextPad = Math.floor(Math.random() * 4);
    this.sequence.push(nextPad);
    this.score = this.sequence.length - 1;
    if (this.score > this.bestScore) {
      this.bestScore = this.score;
      localStorage.setItem('SIMON_BEST_SCORE', this.bestScore.toString());
    }
    return {
      round: this.sequence.length,
      sequence: [...this.sequence]
    };
  }

  pressPad(padIndex) {
    if (this.isPlayingSequence || this.gameOver || this.sequence.length === 0) {
      return { valid: false };
    }

    const expected = this.sequence[this.playerStep];
    if (padIndex === expected) {
      this.playerStep++;
      const roundComplete = (this.playerStep === this.sequence.length);
      return {
        valid: true,
        correct: true,
        pad: padIndex,
        freq: this.padFrequencies[padIndex],
        roundComplete,
        score: this.score
      };
    } else {
      this.gameOver = true;
      return {
        valid: true,
        correct: false,
        pad: padIndex,
        gameOver: true,
        score: this.score
      };
    }
  }
}

window.SimonEngine = SimonEngine;
