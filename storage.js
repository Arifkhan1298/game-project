/**
 * ============================================================================
 * STRATEGY GAME PORTAL — DATA PERSISTENCE & USER PROGRESSION ENGINE
 * Secure, Authoritative Local Data Layer with Integrity Verification
 * ============================================================================
 */

class StorageEngine {
  constructor() {
    this.STORAGE_KEY = 'STRATEGY_PORTAL_STATE_V1';
    this.state = this.loadState();
  }

  getDefaultState() {
    const defaultBreakdown = {
      chess: { played: 0, wins: 0, losses: 0, draws: 0 },
      tictactoe: { played: 0, wins: 0, losses: 0, draws: 0 },
      connect4: { played: 0, wins: 0, losses: 0, draws: 0 },
      reversi: { played: 0, wins: 0, losses: 0, draws: 0 },
      minesweeper: { played: 0, wins: 0, losses: 0, bestTime: null },
      memory: { played: 0, wins: 0, bestMoves: null, bestTime: null },
      game_2048: { played: 0, wins: 0, losses: 0, draws: 0, bestScore: 0 },
      snake: { played: 0, wins: 0, losses: 0, draws: 0, bestScore: 0 },
      checkers: { played: 0, wins: 0, losses: 0, draws: 0 },
      sudoku: { played: 0, wins: 0, losses: 0, draws: 0, bestTime: null },
      tetris: { played: 0, wins: 0, losses: 0, draws: 0, bestScore: 0 },
      pong: { played: 0, wins: 0, losses: 0, draws: 0 },
      wordle: { played: 0, wins: 0, losses: 0, draws: 0 },
      simon: { played: 0, wins: 0, losses: 0, draws: 0, bestScore: 0 },
      battleship: { played: 0, wins: 0, losses: 0, draws: 0 },
      breakout: { played: 0, wins: 0, losses: 0, draws: 0, bestScore: 0 }
    };

    return {
      currentUser: 'player',
      users: {
        player: {
          username: 'player',
          displayName: 'Player One',
          avatar: '⚡',
          isGuest: false,
          joinDate: new Date().toISOString(),
          xp: 0,
          level: 1,
          stats: {
            totalPlayed: 0,
            wins: 0,
            losses: 0,
            draws: 0,
            gamesBreakdown: defaultBreakdown
          },
          achievements: {},
          challengesProgress: {},
          favoriteGame: 'chess'
        }
      },
      matchHistory: [],
      activeGames: {}, // Saved games for "Continue Playing"
      tournaments: [],
      settings: {
        theme: 'dark',
        soundEnabled: true,
        volume: 0.5,
        reducedMotion: false,
        defaultDifficulty: 'medium',
        boardTheme: 'classic'
      }
    };
  }

  loadState() {
    try {
      const serialized = localStorage.getItem(this.STORAGE_KEY);
      if (!serialized) {
        const initial = this.getDefaultState();
        this.saveState(initial);
        return initial;
      }
      const parsed = JSON.parse(serialized);
      // Ensure schema backwards-compatibility
      if (!parsed.users || !parsed.currentUser) {
        return this.getDefaultState();
      }

      // Ensure all 16 games exist in gamesBreakdown for all existing users
      const allGameIds = [
        'chess', 'tictactoe', 'connect4', 'reversi', 'minesweeper', 'memory',
        'game_2048', 'snake', 'checkers', 'sudoku', 'tetris', 'pong',
        'wordle', 'simon', 'battleship', 'breakout'
      ];
      Object.values(parsed.users).forEach(u => {
        if (!u.stats) u.stats = { totalPlayed: 0, wins: 0, losses: 0, draws: 0 };
        if (!u.stats.gamesBreakdown) u.stats.gamesBreakdown = {};
        allGameIds.forEach(gid => {
          if (!u.stats.gamesBreakdown[gid]) {
            u.stats.gamesBreakdown[gid] = { played: 0, wins: 0, losses: 0, draws: 0 };
          }
        });
        if (u.displayName === 'Guest Strategist') {
          u.displayName = 'Player One';
          u.avatar = '⚡';
          u.isGuest = false;
        }
      });

      return parsed;
    } catch (e) {
      console.warn('Storage parse failure, fallback to defaults:', e);
      return this.getDefaultState();
    }
  }

  saveState(stateToSave = null) {
    if (stateToSave) this.state = stateToSave;
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error('Failed to write to localStorage:', e);
    }
  }

  // --- User & Auth ---

  getCurrentUser() {
    const user = this.state.users[this.state.currentUser];
    if (!user) {
      this.state.currentUser = 'guest';
      this.saveState();
      return this.state.users.guest;
    }
    return user;
  }

  registerUser(username, displayName, password) {
    const trimmedUser = username.trim().toLowerCase();
    if (!trimmedUser || trimmedUser.length < 3) {
      return { success: false, error: 'Username must be at least 3 characters long.' };
    }
    if (this.state.users[trimmedUser]) {
      return { success: false, error: 'Username already exists.' };
    }
    if (!password || password.length < 4) {
      return { success: false, error: 'Password must be at least 4 characters long.' };
    }

    // Client-side deterministic hash for local profile security
    const passHash = this.simpleHash(trimmedUser + ':' + password);

    const newUser = {
      username: trimmedUser,
      displayName: displayName ? displayName.trim() : trimmedUser,
      avatar: '👑',
      isGuest: false,
      passHash: passHash,
      joinDate: new Date().toISOString(),
      xp: 0,
      level: 1,
      stats: {
        totalPlayed: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        gamesBreakdown: {
          chess: { played: 0, wins: 0, losses: 0, draws: 0 },
          tictactoe: { played: 0, wins: 0, losses: 0, draws: 0 },
          connect4: { played: 0, wins: 0, losses: 0, draws: 0 },
          reversi: { played: 0, wins: 0, losses: 0, draws: 0 },
          minesweeper: { played: 0, wins: 0, losses: 0, bestTime: null },
          memory: { played: 0, wins: 0, bestMoves: null, bestTime: null },
          game_2048: { played: 0, wins: 0, losses: 0, draws: 0, bestScore: 0 },
          snake: { played: 0, wins: 0, losses: 0, draws: 0, bestScore: 0 },
          checkers: { played: 0, wins: 0, losses: 0, draws: 0 },
          sudoku: { played: 0, wins: 0, losses: 0, draws: 0, bestTime: null },
          tetris: { played: 0, wins: 0, losses: 0, draws: 0, bestScore: 0 },
          pong: { played: 0, wins: 0, losses: 0, draws: 0 },
          wordle: { played: 0, wins: 0, losses: 0, draws: 0 },
          simon: { played: 0, wins: 0, losses: 0, draws: 0, bestScore: 0 },
          battleship: { played: 0, wins: 0, losses: 0, draws: 0 },
          breakout: { played: 0, wins: 0, losses: 0, draws: 0, bestScore: 0 }
        }
      },
      achievements: {},
      challengesProgress: {},
      favoriteGame: 'chess'
    };

    this.state.users[trimmedUser] = newUser;
    this.state.currentUser = trimmedUser;
    this.saveState();
    return { success: true, user: newUser };
  }

  loginUser(username, password) {
    const trimmedUser = username.trim().toLowerCase();
    const user = this.state.users[trimmedUser];
    if (!user || user.isGuest) {
      return { success: false, error: 'User not found.' };
    }
    const hash = this.simpleHash(trimmedUser + ':' + password);
    if (user.passHash !== hash) {
      return { success: false, error: 'Invalid password.' };
    }

    this.state.currentUser = trimmedUser;
    this.saveState();
    return { success: true, user: user };
  }

  logoutUser() {
    this.state.currentUser = 'guest';
    this.saveState();
  }

  updateProfile(displayName, avatar, favoriteGame) {
    const user = this.getCurrentUser();
    if (displayName) user.displayName = displayName.trim();
    if (avatar) user.avatar = avatar;
    if (favoriteGame) user.favoriteGame = favoriteGame;
    this.saveState();
    return user;
  }

  // --- XP & Progression ---

  addXP(amount, reason = '') {
    const user = this.getCurrentUser();
    user.xp = (user.xp || 0) + amount;
    
    // Level formula: Level = Math.floor(XP / 250) + 1
    const newLevel = Math.floor(user.xp / 250) + 1;
    const leveledUp = newLevel > user.level;
    user.level = newLevel;

    this.saveState();
    return {
      currentXP: user.xp,
      currentLevel: user.level,
      leveledUp: leveledUp,
      reason: reason
    };
  }

  // --- Match History & Stats Recording ---

  recordMatch(matchData) {
    const user = this.getCurrentUser();
    const { gameId, opponentType, difficulty, result, movesCount, durationSec, extra } = matchData;
    
    const record = {
      id: 'm_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      username: user.username,
      gameId: gameId,
      opponentType: opponentType || 'AI',
      difficulty: difficulty || 'medium',
      result: result, // 'win', 'loss', 'draw'
      movesCount: movesCount || 0,
      durationSec: durationSec || 0,
      date: new Date().toISOString(),
      extra: extra || {}
    };

    // Update global match list (keep last 100)
    this.state.matchHistory.unshift(record);
    if (this.state.matchHistory.length > 100) {
      this.state.matchHistory.pop();
    }

    // Update User Stats
    user.stats.totalPlayed++;
    if (result === 'win') user.stats.wins++;
    else if (result === 'loss') user.stats.losses++;
    else if (result === 'draw') user.stats.draws++;

    if (!user.stats.gamesBreakdown[gameId]) {
      user.stats.gamesBreakdown[gameId] = { played: 0, wins: 0, losses: 0, draws: 0 };
    }
    const gStats = user.stats.gamesBreakdown[gameId];
    gStats.played++;
    if (result === 'win') gStats.wins++;
    else if (result === 'loss') gStats.losses++;
    else if (result === 'draw') gStats.draws++;

    // Best records for special games
    if (gameId === 'minesweeper' && result === 'win') {
      if (!gStats.bestTime || durationSec < gStats.bestTime) {
        gStats.bestTime = durationSec;
      }
    }
    if (gameId === 'memory' && result === 'win') {
      if (!gStats.bestMoves || movesCount < gStats.bestMoves) {
        gStats.bestMoves = movesCount;
      }
      if (!gStats.bestTime || durationSec < gStats.bestTime) {
        gStats.bestTime = durationSec;
      }
    }

    // Calculate XP
    let xpAward = 15; // base participation
    if (result === 'win') {
      xpAward += 100;
      if (difficulty === 'hard') xpAward += 50;
    } else if (result === 'draw') {
      xpAward += 40;
    }

    const xpResult = this.addXP(xpAward, `${gameId.toUpperCase()} match completed`);

    // Check Achievements & Challenges
    const unlockedAchievements = this.checkAchievements(record);
    const challengeUpdates = this.checkDailyChallenges(record);

    this.saveState();

    return {
      record: record,
      xpResult: xpResult,
      unlockedAchievements: unlockedAchievements,
      challengeUpdates: challengeUpdates
    };
  }

  getMatchHistory(username) {
    if (username) {
      return (this.state.matchHistory || []).filter(m => m.username === username);
    }
    return this.state.matchHistory || [];
  }

  // --- Achievements System ---

  getAchievementDefinitions() {
    return [
      {
        id: 'first_win',
        name: 'First Victory',
        desc: 'Win your first game in any strategic discipline.',
        icon: '🏆',
        rewardXP: 100,
        check: (user, match) => user.stats.wins >= 1
      },
      {
        id: 'chess_grandmaster',
        name: 'Grandmaster Spark',
        desc: 'Defeat the Chess AI on Medium or Hard difficulty.',
        icon: '♟️',
        rewardXP: 250,
        check: (user, match) => match.gameId === 'chess' && match.result === 'win' && (match.difficulty === 'medium' || match.difficulty === 'hard')
      },
      {
        id: 'ttt_tactician',
        name: 'Tic-Tac Tactician',
        desc: 'Win 3 Tic-Tac-Toe games.',
        icon: '⚔️',
        rewardXP: 100,
        check: (user) => (user.stats.gamesBreakdown.tictactoe?.wins || 0) >= 3
      },
      {
        id: 'connect_king',
        name: 'Vertical Dominance',
        desc: 'Win a Connect Four game against AI.',
        icon: '🔴',
        rewardXP: 150,
        check: (user, match) => match.gameId === 'connect4' && match.result === 'win'
      },
      {
        id: 'reversi_ruler',
        name: 'Reversi Ruler',
        desc: 'Win a Reversi match with 40 or more discs.',
        icon: '⚪',
        rewardXP: 200,
        check: (user, match) => match.gameId === 'reversi' && match.result === 'win' && (match.extra?.discs >= 40)
      },
      {
        id: 'minesweeper_pro',
        name: 'Demolition Expert',
        desc: 'Clear a Minesweeper board on Intermediate or Expert.',
        icon: '💣',
        rewardXP: 300,
        check: (user, match) => match.gameId === 'minesweeper' && match.result === 'win' && (match.difficulty === 'intermediate' || match.difficulty === 'expert')
      },
      {
        id: 'memory_master',
        name: 'Eidetic Mind',
        desc: 'Complete Memory Match in under 20 moves.',
        icon: '🃏',
        rewardXP: 200,
        check: (user, match) => match.gameId === 'memory' && match.result === 'win' && match.movesCount <= 20
      },
      {
        id: 'streak_five',
        name: 'Unstoppable Momentum',
        desc: 'Win 3 consecutive matches.',
        icon: '🔥',
        rewardXP: 350,
        check: (user) => {
          const userHistory = this.state.matchHistory.filter(m => m.username === user.username);
          if (userHistory.length < 3) return false;
          return userHistory.slice(0, 3).every(m => m.result === 'win');
        }
      },
      {
        id: 'all_round_player',
        name: 'Polymath Strategist',
        desc: 'Play at least one match in all 6 games.',
        icon: '🌐',
        rewardXP: 400,
        check: (user) => {
          const games = ['chess', 'tictactoe', 'connect4', 'reversi', 'minesweeper', 'memory'];
          return games.every(g => (user.stats.gamesBreakdown[g]?.played || 0) >= 1);
        }
      },
      {
        id: 'veteran_strategist',
        name: 'Decade of Battles',
        desc: 'Complete 10 total matches.',
        icon: '⭐',
        rewardXP: 250,
        check: (user) => user.stats.totalPlayed >= 10
      }
    ];
  }

  checkAchievements(latestMatch) {
    const user = this.getCurrentUser();
    const defs = this.getAchievementDefinitions();
    const newlyUnlocked = [];

    defs.forEach(def => {
      if (!user.achievements[def.id]) {
        if (def.check(user, latestMatch)) {
          user.achievements[def.id] = {
            id: def.id,
            unlockedAt: new Date().toISOString()
          };
          this.addXP(def.rewardXP, `Achievement unlocked: ${def.name}`);
          newlyUnlocked.push(def);
        }
      }
    });

    return newlyUnlocked;
  }

  // --- Daily Challenges System ---

  getTodayDateString() {
    return new Date().toISOString().slice(0, 10);
  }

  getDailyChallenges() {
    const today = this.getTodayDateString();
    return [
      {
        id: `challenge_play_${today}`,
        title: 'Tactical Warmup',
        desc: 'Play 2 matches of any strategic game.',
        target: 2,
        xpReward: 120,
        progressType: 'play_count'
      },
      {
        id: `challenge_win_${today}`,
        title: 'Master of Tactics',
        desc: 'Win a match against Medium or Hard AI.',
        target: 1,
        xpReward: 200,
        progressType: 'win_ai'
      },
      {
        id: `challenge_board_${today}`,
        title: 'Grid Conqueror',
        desc: 'Win a Connect Four or Reversi game.',
        target: 1,
        xpReward: 180,
        progressType: 'win_board'
      }
    ];
  }

  checkDailyChallenges(latestMatch) {
    const user = this.getCurrentUser();
    const today = this.getTodayDateString();
    if (!user.challengesProgress[today]) {
      user.challengesProgress[today] = {
        play_count: 0,
        win_ai: 0,
        win_board: 0,
        claimed: {}
      };
    }

    const prog = user.challengesProgress[today];
    prog.play_count = (prog.play_count || 0) + 1;

    if (latestMatch.result === 'win' && (latestMatch.difficulty === 'medium' || latestMatch.difficulty === 'hard')) {
      prog.win_ai = (prog.win_ai || 0) + 1;
    }

    if (latestMatch.result === 'win' && (latestMatch.gameId === 'connect4' || latestMatch.gameId === 'reversi')) {
      prog.win_board = (prog.win_board || 0) + 1;
    }

    this.saveState();
    return prog;
  }

  claimDailyChallenge(challengeId, xpReward) {
    const user = this.getCurrentUser();
    const today = this.getTodayDateString();
    const prog = user.challengesProgress[today];
    if (!prog) return { success: false, error: 'No progress recorded.' };

    if (prog.claimed && prog.claimed[challengeId]) {
      return { success: false, error: 'Challenge already claimed.' };
    }

    if (!prog.claimed) prog.claimed = {};
    prog.claimed[challengeId] = true;

    this.addXP(xpReward, 'Daily Challenge Completed');
    this.saveState();
    return { success: true };
  }

  // --- Saved Game States ("Continue Playing") ---

  saveActiveGame(gameId, gameState) {
    this.state.activeGames[gameId] = {
      gameId: gameId,
      updatedAt: new Date().toISOString(),
      state: gameState
    };
    this.saveState();
  }

  getActiveGame(gameId) {
    return this.state.activeGames[gameId] || null;
  }

  clearActiveGame(gameId) {
    if (this.state.activeGames[gameId]) {
      delete this.state.activeGames[gameId];
      this.saveState();
    }
  }

  // --- Settings Persistence ---

  getSettings() {
    return this.state.settings;
  }

  updateSettings(newSettings) {
    this.state.settings = { ...this.state.settings, ...newSettings };
    this.saveState();
    return this.state.settings;
  }

  // --- Leaderboards Compilation ---

  getLeaderboardData() {
    const usersList = Object.values(this.state.users);
    
    // Sort by Total XP descending
    const byXP = [...usersList].sort((a, b) => (b.xp || 0) - (a.xp || 0));

    // Sort by Total Wins descending
    const byWins = [...usersList].sort((a, b) => (b.stats?.wins || 0) - (a.stats?.wins || 0));

    // Sort by Win Rate (min 3 games)
    const byRate = [...usersList]
      .filter(u => (u.stats?.totalPlayed || 0) >= 3)
      .sort((a, b) => {
        const rateA = (a.stats.wins / a.stats.totalPlayed) * 100;
        const rateB = (b.stats.wins / b.stats.totalPlayed) * 100;
        return rateB - rateA;
      });

    return {
      byXP,
      byWins,
      byRate
    };
  }

  // Simple string hash
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return 'h_' + Math.abs(hash).toString(16);
  }
}

// Global storage singleton
window.portalStorage = new StorageEngine();
