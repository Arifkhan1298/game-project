/**
 * ============================================================================
 * WORDLE (TACTICAL WORD GUESS) ENGINE
 * 5-Letter Secret Words, 6 Attempts, Letter Validation & Key State Tracking
 * ============================================================================
 */

class WordleEngine {
  constructor() {
    this.maxGuesses = 6;
    this.wordLength = 5;
    this.wordsList = [
      'CHESS', 'QUEEN', 'CHECK', 'BOARD', 'SMART', 'BRAIN', 'TIGER', 'GUARD',
      'STONE', 'CROWN', 'SWORD', 'SHIELD', 'LIGHT', 'CYBER', 'SPACE', 'FORCE',
      'POWER', 'NINJA', 'TITAN', 'BLADE', 'FLASH', 'MAGIC', 'GLORY', 'QUEST',
      'ARENA', 'VIPER', 'FROST', 'STORM', 'SHARP', 'HONOR', 'VALOR', 'BRAVE',
      'FOCUS', 'LOGIC', 'MATCH', 'SCORE', 'LEVEL', 'SPEED', 'GHOST', 'PILOT',
      'RADAR', 'LASER', 'SOLAR', 'FLAME', 'ARROW', 'SPEAR', 'STEEL', 'ROYAL',
      'NOBLE', 'PRIDE', 'POWER', 'CLOCK', 'POINT', 'TRACE', 'CRANE', 'DRIFT'
    ];
    this.init();
  }

  get targetWord() { return this.secretWord; }
  set targetWord(val) { this.secretWord = val; }
  get maxAttempts() { return this.maxGuesses; }
  set maxAttempts(val) { this.maxGuesses = val; }
  get currentAttempt() { return this.currentGuess; }
  set currentAttempt(val) { this.currentGuess = val; }

  init() {
    this.secretWord = this.wordsList[Math.floor(Math.random() * this.wordsList.length)];
    this.guesses = [];
    this.currentGuess = '';
    this.evaluations = [];
    this.gameOver = false;
    this.gameWon = false;
    this.keyStates = {}; // letter -> 'correct' | 'present' | 'absent'
  }

  addLetter(letter) {
    if (this.gameOver || this.gameWon) return false;
    if (this.currentGuess.length < this.wordLength) {
      this.currentGuess += letter.toUpperCase();
      return true;
    }
    return false;
  }

  removeLetter() {
    if (this.gameOver || this.gameWon) return false;
    if (this.currentGuess.length > 0) {
      this.currentGuess = this.currentGuess.slice(0, -1);
      return true;
    }
    return false;
  }

  submitGuess() {
    if (this.gameOver || this.gameWon) return { success: false, reason: 'Game over' };
    if (this.currentGuess.length !== this.wordLength) {
      return { success: false, reason: 'Word must have exactly 5 letters' };
    }

    const guess = this.currentGuess;
    const secret = this.secretWord;
    const evalResult = Array(this.wordLength).fill('absent');
    const secretRemaining = secret.split('');

    // First pass: Find exact matches (Green / correct)
    for (let i = 0; i < this.wordLength; i++) {
      if (guess[i] === secret[i]) {
        evalResult[i] = 'correct';
        secretRemaining[i] = null;
        this.keyStates[guess[i]] = 'correct';
      }
    }

    // Second pass: Find present matches (Yellow / present)
    for (let i = 0; i < this.wordLength; i++) {
      if (evalResult[i] !== 'correct') {
        const foundIdx = secretRemaining.indexOf(guess[i]);
        if (foundIdx !== -1) {
          evalResult[i] = 'present';
          secretRemaining[foundIdx] = null;
          if (this.keyStates[guess[i]] !== 'correct') {
            this.keyStates[guess[i]] = 'present';
          }
        } else {
          evalResult[i] = 'absent';
          if (!this.keyStates[guess[i]]) {
            this.keyStates[guess[i]] = 'absent';
          }
        }
      }
    }

    this.guesses.push(guess);
    this.evaluations.push(evalResult);
    this.currentGuess = '';

    if (guess === secret) {
      this.gameWon = true;
      this.gameOver = true;
    } else if (this.guesses.length >= this.maxGuesses) {
      this.gameOver = true;
    }

    return {
      success: true,
      guess,
      evaluation: evalResult,
      feedback: evalResult,
      isWin: this.gameWon,
      isOver: this.gameOver,
      secretWord: this.gameOver ? secret : null
    };
  }
}

window.WordleEngine = WordleEngine;
