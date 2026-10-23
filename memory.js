/**
 * ============================================================================
 * STRATEGY GAME PORTAL — AUTHORITATIVE MEMORY MATCH ENGINE
 * Shuffled Card Deck, Multi-Theme Icons, Pair Matching Logic, Move Counter, Timer
 * ============================================================================
 */

class MemoryMatchEngine {
  constructor(difficulty = 'standard') {
    this.difficulty = difficulty;
    this.setDifficulty(difficulty);
    this.reset();
  }

  static ICONS_POOL = [
    '⚔️', '🛡️', '👑', '🏹', '🏰', '💎',
    '🔮', '📜', '🧭', '🔥', '⚡', '🌟',
    '🐉', '🦄', '🦅', '🦁', '🐺', '🪙'
  ];

  static PRESETS = {
    casual: { cards: 12, pairs: 6, gridClass: 'grid-12' },
    standard: { cards: 16, pairs: 8, gridClass: 'grid-16' },
    expert: { cards: 24, pairs: 12, gridClass: 'grid-24' }
  };

  setDifficulty(diff) {
    this.difficulty = diff in MemoryMatchEngine.PRESETS ? diff : 'standard';
    const cfg = MemoryMatchEngine.PRESETS[this.difficulty];
    this.totalCards = cfg.cards;
    this.totalPairs = cfg.pairs;
    this.gridClass = cfg.gridClass;
  }

  reset() {
    this.cards = this.generateShuffledDeck();
    this.flippedIndices = [];
    this.matchedPairs = 0;
    this.moves = 0;
    this.gameWon = false;
    this.isLocked = false; // Prevents spam clicking during comparison delay
    this.startTime = null;
    this.elapsedSeconds = 0;
  }

  generateShuffledDeck() {
    // Pick required number of unique icons
    const selectedIcons = MemoryMatchEngine.ICONS_POOL.slice(0, this.totalPairs);
    const deck = [];

    selectedIcons.forEach((icon, pairId) => {
      deck.push({ id: `${pairId}_a`, pairId, icon, flipped: false, matched: false });
      deck.push({ id: `${pairId}_b`, pairId, icon, flipped: false, matched: false });
    });

    // Fisher-Yates shuffle
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    return deck;
  }

  flipCard(index) {
    if (this.gameWon || this.isLocked) return { success: false, error: 'Interaction locked' };
    if (index < 0 || index >= this.cards.length) return { success: false, error: 'Invalid index' };

    const card = this.cards[index];
    if (card.flipped || card.matched) return { success: false, error: 'Card already revealed' };

    if (!this.startTime) {
      this.startTime = Date.now();
    }

    card.flipped = true;
    this.flippedIndices.push(index);

    // If 1 card flipped so far
    if (this.flippedIndices.length === 1) {
      return {
        success: true,
        action: 'first_flip',
        index: index,
        icon: card.icon
      };
    }

    // 2 cards flipped: Check match
    this.moves++;
    const [idx1, idx2] = this.flippedIndices;
    const card1 = this.cards[idx1];
    const card2 = this.cards[idx2];

    if (card1.pairId === card2.pairId) {
      // Match found!
      card1.matched = true;
      card2.matched = true;
      this.matchedPairs++;
      this.flippedIndices = [];

      if (this.matchedPairs === this.totalPairs) {
        this.gameWon = true;
      }

      return {
        success: true,
        action: 'match',
        indices: [idx1, idx2],
        matchedPairs: this.matchedPairs,
        totalPairs: this.totalPairs,
        gameWon: this.gameWon,
        moves: this.moves
      };
    } else {
      // No match: lock briefly to let player view
      this.isLocked = true;
      return {
        success: true,
        action: 'mismatch',
        indices: [idx1, idx2],
        moves: this.moves
      };
    }
  }

  unflipMismatched() {
    if (this.flippedIndices.length === 2) {
      const [idx1, idx2] = this.flippedIndices;
      if (!this.cards[idx1].matched) this.cards[idx1].flipped = false;
      if (!this.cards[idx2].matched) this.cards[idx2].flipped = false;
      this.flippedIndices = [];
    }
    this.isLocked = false;
  }

  exportState() {
    return {
      difficulty: this.difficulty,
      totalCards: this.totalCards,
      totalPairs: this.totalPairs,
      matchedPairs: this.matchedPairs,
      moves: this.moves,
      gameWon: this.gameWon,
      elapsedSeconds: this.elapsedSeconds,
      cards: this.cards.map(c => ({ ...c }))
    };
  }

  loadState(saved) {
    if (!saved || !saved.cards) return false;
    this.difficulty = saved.difficulty || 'standard';
    this.totalCards = saved.totalCards;
    this.totalPairs = saved.totalPairs;
    this.matchedPairs = saved.matchedPairs || 0;
    this.moves = saved.moves || 0;
    this.gameWon = saved.gameWon || false;
    this.elapsedSeconds = saved.elapsedSeconds || 0;
    this.cards = saved.cards.map(c => ({ ...c }));
    this.flippedIndices = [];
    this.isLocked = false;
    return true;
  }
}

// Global engine export
window.MemoryMatchEngine = MemoryMatchEngine;
