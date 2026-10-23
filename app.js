/**
 * ============================================================================
 * STRATEGY GAME PORTAL — CENTRAL APPLICATION CONTROLLER
 * Single Page Architecture, Game Shell Manager, AI Arena, Tournament Engine,
 * Progression, Real-time Audio Cues, and Local Persistence
 * ============================================================================
 */

class StrategyPortalApp {
  constructor() {
    this.currentView = 'home';
    this.activeGameId = null;
    this.activeEngine = null;
    this.gameMode = 'ai'; // 'ai' or 'local' (2-player)
    this.difficulty = 'medium'; // 'easy', 'medium', 'hard'
    this.userColor = 'w'; // For chess ('w' or 'b')
    this.selectedSquare = null; // For chess { r, c }
    this.legalMovesForSelected = [];
    this.turnTimer = null;
    this.userClockSec = 300;
    this.oppClockSec = 300;
    this.activeClockSide = 'w';
    this.pendingPromotionMove = null;
    this.tournamentState = null;
    this.libraryFilter = 'all';
    this.snakeInterval = null;
    this.tetrisInterval = null;
    this.pongAnimFrame = null;
    this.breakoutAnimFrame = null;

    // Game Definitions (All 16 Authoritative Games)
    this.gamesCatalog = {
      chess: {
        id: 'chess',
        name: 'Standard Chess',
        icon: '♟️',
        desc: 'Complete classical chess with full legal move validation, castling, en passant, promotion, and checkmate detection.',
        category: 'Strategy',
        players: '1 - 2 Players',
        difficulty: 'Medium - Hard'
      },
      tictactoe: {
        id: 'tictactoe',
        name: 'Tic-Tac-Toe',
        icon: '✕',
        desc: 'Quick 3×3 tactical grid. Test your wits against an optimal unyielding Minimax agent or play casual pass & play.',
        category: 'Puzzle',
        players: '1 - 2 Players',
        difficulty: 'Easy - Hard'
      },
      connect4: {
        id: 'connect4',
        name: 'Connect Four',
        icon: '🔴',
        desc: 'Gravity-based 7×6 grid. Drop strategic checkers and connect four in a row horizontally, vertically, or diagonally.',
        category: 'Strategy',
        players: '1 - 2 Players',
        difficulty: 'Medium - Hard'
      },
      reversi: {
        id: 'reversi',
        name: 'Reversi / Othello',
        icon: '⚪',
        desc: 'A minute to learn, a lifetime to master. Trap opponent discs between your pieces and flip the board in an 8×8 battlefield.',
        category: 'Strategy',
        players: '1 - 2 Players',
        difficulty: 'Medium - Hard'
      },
      minesweeper: {
        id: 'minesweeper',
        name: 'Minesweeper',
        icon: '💣',
        desc: 'Clear hazardous minefields using numerical deduction. Features guaranteed safe first click and Beginner to Expert grids.',
        category: 'Puzzle',
        players: 'Single Player',
        difficulty: 'Beginner - Expert'
      },
      memory: {
        id: 'memory',
        name: 'Memory Match',
        icon: '🃏',
        desc: 'Sharpen your recall by uncovering matching pairs of ancient tactical relics in the fewest moves and quickest time.',
        category: 'Word',
        players: 'Single Player',
        difficulty: 'Casual - Expert'
      },
      game_2048: {
        id: 'game_2048',
        name: '2048 Number Merge',
        icon: '🔢',
        desc: 'Slide and merge identical numbered tiles on a 4×4 grid. Reach the legendary 2048 tile to achieve triumph!',
        category: 'Puzzle',
        players: 'Single Player',
        difficulty: 'Casual - Hard'
      },
      snake: {
        id: 'snake',
        name: 'Cyber Retro Snake',
        icon: '🐍',
        desc: 'Classic neon arcade snake. Eat regular nutrients and golden bonus orbs, ramp up speed, and smash high scores.',
        category: 'Arcade',
        players: 'Single Player',
        difficulty: 'Easy - Hard'
      },
      checkers: {
        id: 'checkers',
        name: 'Checkers (Draughts)',
        icon: '👑',
        desc: 'Official 8×8 draughts. Diagonal steps, multi-jump captures, King promotions, and smart tactical AI opponent.',
        category: 'Strategy',
        players: '1 - 2 Players',
        difficulty: 'Easy - Hard'
      },
      sudoku: {
        id: 'sudoku',
        name: 'Sudoku Master',
        icon: '🧩',
        desc: 'Authoritative 9×9 Sudoku with multiple difficulty tiers, note pencil mode, hints, and error validation.',
        category: 'Puzzle',
        players: 'Single Player',
        difficulty: 'Easy - Hard'
      },
      tetris: {
        id: 'tetris',
        name: 'Neon Tetris',
        icon: '🧱',
        desc: 'The timeless falling tetromino arcade classic with ghost projection, hold piece queue, and speed acceleration.',
        category: 'Arcade',
        players: 'Single Player',
        difficulty: 'Casual - Expert'
      },
      pong: {
        id: 'pong',
        name: 'Cyber Pong',
        icon: '🏓',
        desc: 'High-speed neon table tennis on 60fps canvas. Dynamic ball spin, angular velocity, and reactive AI paddle.',
        category: 'Arcade',
        players: 'vs AI',
        difficulty: 'Easy - Hard'
      },
      wordle: {
        id: 'wordle',
        name: 'Wordle Guess',
        icon: '🔤',
        desc: '6 attempts to deduce the secret 5-letter tactical word. Instant tile flip animations and interactive keyboard.',
        category: 'Word',
        players: 'Single Player',
        difficulty: 'Medium - Hard'
      },
      simon: {
        id: 'simon',
        name: 'Simon Says Memory',
        icon: '💡',
        desc: 'Four glowing neon quadrants with synthesized audio tones. Replicate increasingly complex light sequences.',
        category: 'Puzzle',
        players: 'Single Player',
        difficulty: 'Casual - Hard'
      },
      battleship: {
        id: 'battleship',
        name: 'Battleship Fleet',
        icon: '🚢',
        desc: '10×10 naval radar combat. Deploy 5 warships and launch tactical missile strikes against intelligent hunting AI.',
        category: 'Strategy',
        players: 'vs AI',
        difficulty: 'Medium - Hard'
      },
      breakout: {
        id: 'breakout',
        name: 'Arcade Breakout',
        icon: '🕹️',
        desc: 'Break colorful brick walls, catch falling powerups (Wide Paddle, Laser Cannons, Multi-Ball), and preserve 3 lives.',
        category: 'Arcade',
        players: 'Single Player',
        difficulty: 'Casual - Hard'
      }
    };

    this.init();
  }

  init() {
    try { this.bindNavigation(); } catch (e) { console.error('bindNavigation error:', e); }
    try { this.bindGlobalControls(); } catch (e) { console.error('bindGlobalControls error:', e); }
    try { this.bindAuthAndProfile(); } catch (e) { console.error('bindAuthAndProfile error:', e); }
    try { this.bindSettings(); } catch (e) { console.error('bindSettings error:', e); }
    try { this.bindModals(); } catch (e) { console.error('bindModals error:', e); }
    try { this.renderFeaturedGames(); } catch (e) { console.error('renderFeaturedGames error:', e); }
    try { this.renderLibrary(); } catch (e) { console.error('renderLibrary error:', e); }
    try { this.renderDashboard(); } catch (e) { console.error('renderDashboard error:', e); }
    try { this.renderAchievements(); } catch (e) { console.error('renderAchievements error:', e); }
    try { this.renderLeaderboard(); } catch (e) { console.error('renderLeaderboard error:', e); }
    try { this.renderDailyChallenges(); } catch (e) { console.error('renderDailyChallenges error:', e); }
    try { this.renderMatchHistory(); } catch (e) { console.error('renderMatchHistory error:', e); }
    try { this.initTournamentSystem(); } catch (e) { console.error('initTournamentSystem error:', e); }
    try { this.updateUserDisplay(); } catch (e) { console.error('updateUserDisplay error:', e); }
    try { this.applyLoadedSettings(); } catch (e) { console.error('applyLoadedSettings error:', e); }

    // Check URL Hash for deep linking
    try {
      const hash = window.location.hash.replace('#', '');
      if (hash && document.getElementById(`view-${hash}`)) {
        if (hash === 'game' && !this.activeEngine) {
          this.launchGame('chess');
        } else {
          this.switchView(hash);
        }
      } else {
        this.switchView('home');
      }
    } catch (e) {
      console.error('View switch error:', e);
      this.switchView('home');
    }
  }

  // --- Toast Notification System ---
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast-item';
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'gold') icon = '🏆';
    if (type === 'error') icon = '❌';

    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // --- SPA View Routing ---
  switchView(viewName) {
    const target = document.getElementById(`view-${viewName}`);
    if (!target) return;

    // Save active game state before navigating away from game view
    if (this.currentView === 'game' && this.activeGameId && this.activeEngine) {
      this.saveActiveGameProgress();
    }

    document.querySelectorAll('.view-panel').forEach(panel => {
      panel.classList.remove('active-view');
    });
    target.classList.add('active-view');

    document.querySelectorAll('.nav-item').forEach(nav => {
      if (nav.dataset.view === viewName) {
        nav.classList.add('active');
      } else {
        nav.classList.remove('active');
      }
    });

    this.currentView = viewName;
    window.location.hash = viewName;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Update specific views on enter
    if (viewName === 'dashboard') this.renderDashboard();
    if (viewName === 'continue') this.renderContinueView();
    if (viewName === 'leaderboard') this.renderLeaderboard();
    if (viewName === 'achievements') this.renderAchievements();
    if (viewName === 'history') this.renderMatchHistory();
    if (viewName === 'profile') this.renderProfileView();
    if (viewName === 'challenges') this.renderDailyChallenges();

    // Close mobile sidebar if open
    const sidebar = document.getElementById('app-sidebar');
    if (sidebar && sidebar.classList.contains('mobile-open')) {
      sidebar.classList.remove('mobile-open');
    }
  }

  bindNavigation() {
    document.querySelectorAll('.nav-item').forEach(nav => {
      nav.addEventListener('click', (e) => {
        e.preventDefault();
        const view = nav.dataset.view;
        if (view) this.switchView(view);
      });
    });

    document.getElementById('brand-home-btn')?.addEventListener('click', () => {
      this.switchView('home');
    });

    document.getElementById('menu-toggle')?.addEventListener('click', () => {
      const sidebar = document.getElementById('app-sidebar');
      if (window.innerWidth <= 768) {
        sidebar.classList.toggle('mobile-open');
      } else {
        sidebar.classList.toggle('collapsed');
      }
    });

    document.getElementById('hero-play-chess-btn')?.addEventListener('click', () => {
      this.launchGame('chess');
    });

    document.getElementById('hero-explore-btn')?.addEventListener('click', () => {
      this.switchView('library');
    });

    document.getElementById('home-view-all-games-btn')?.addEventListener('click', () => {
      this.switchView('library');
    });

    document.getElementById('dash-quick-chess-btn')?.addEventListener('click', () => {
      this.launchGame('chess');
    });

    document.getElementById('dash-view-history-link')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.switchView('history');
    });

    document.getElementById('game-back-to-library-btn')?.addEventListener('click', () => {
      this.switchView('library');
    });

    // AI Arena buttons
    document.getElementById('arena-launch-match-btn')?.addEventListener('click', () => {
      const g = document.getElementById('arena-game-select').value;
      const d = document.getElementById('arena-difficulty-select').value;
      this.difficulty = d;
      this.gameMode = 'ai';
      this.launchGame(g);
    });

    // Multiplayer room join/create
    document.getElementById('multiplayer-create-room-btn')?.addEventListener('click', () => {
      const code = 'RM-' + Math.floor(100 + Math.random() * 900);
      document.getElementById('multiplayer-room-input').value = code;
      document.getElementById('room-status-output').innerHTML = `
        <span style="color: var(--color-success);">Room ${code} created!</span> Share code with a friend. Host ready as White/Player 1.
      `;
      this.showToast(`Room ${code} established!`, 'success');
      window.portalAudio?.playClick();
    });

    document.getElementById('multiplayer-join-btn')?.addEventListener('click', () => {
      const code = document.getElementById('multiplayer-room-input').value.trim();
      if (!code) {
        this.showToast('Please enter a room code.', 'error');
        return;
      }
      this.showToast(`Joined session ${code.toUpperCase()}! Launching Chess...`, 'success');
      this.gameMode = 'local';
      this.launchGame('chess');
    });
  }

  bindGlobalControls() {
    // Header Sound button
    const soundBtn = document.getElementById('header-sound-btn');
    soundBtn?.addEventListener('click', () => {
      const audio = window.portalAudio;
      const newEnabled = !audio.enabled;
      audio.setEnabled(newEnabled);
      window.portalStorage.updateSettings({ soundEnabled: newEnabled });
      document.getElementById('sound-icon').textContent = newEnabled ? '🔊' : '🔇';
      document.getElementById('setting-sound-enabled').checked = newEnabled;
      this.showToast(newEnabled ? 'Audio Sound FX Enabled' : 'Audio Muted', 'info');
    });

    // Header Theme button
    const themeBtn = document.getElementById('header-theme-btn');
    themeBtn?.addEventListener('click', () => {
      const isLight = document.body.classList.toggle('light-theme');
      const themeName = isLight ? 'light' : 'dark';
      document.getElementById('theme-icon').textContent = isLight ? '☀️' : '🌙';
      document.getElementById('setting-theme-select').value = themeName;
      window.portalStorage.updateSettings({ theme: themeName });
      this.showToast(`Theme switched to ${themeName}`, 'info');
    });

    // Game Shell Controls
    document.getElementById('shell-restart-btn')?.addEventListener('click', () => {
      if (this.activeGameId) {
        this.launchGame(this.activeGameId, true);
        window.portalAudio?.playClick();
      }
    });

    document.getElementById('shell-undo-btn')?.addEventListener('click', () => {
      this.handleUndo();
    });

    document.getElementById('shell-difficulty-select')?.addEventListener('change', (e) => {
      this.difficulty = e.target.value;
      this.showToast(`AI difficulty set to ${this.difficulty.toUpperCase()}`, 'info');
      this.updateGameShellHeader();
    });

    document.getElementById('shell-mode-select')?.addEventListener('change', (e) => {
      this.gameMode = e.target.value;
      this.showToast(this.gameMode === 'ai' ? '1-Player vs AI Mode' : '2-Player Local Mode', 'info');
      this.updateGameShellHeader();
    });

    document.getElementById('shell-flip-btn')?.addEventListener('click', () => {
      this.isBoardFlipped = !this.isBoardFlipped;
      if (this.activeGameId === 'chess') this.renderChessBoard();
      this.showToast(this.isBoardFlipped ? 'Board flipped: Black orientation' : 'Board flipped: White orientation', 'info');
      window.portalAudio?.playClick();
    });

    // In-App Test Suite Runner
    document.getElementById('run-app-tests-btn')?.addEventListener('click', async () => {
      const runner = window.portalTestSuite;
      if (!runner) return;
      const btn = document.getElementById('run-app-tests-btn');
      btn.textContent = 'Running Tests...';
      btn.disabled = true;

      const res = await runner.runAllTests();

      document.getElementById('app-test-total').textContent = res.total;
      document.getElementById('app-test-passed').textContent = res.passed;
      document.getElementById('app-test-failed').textContent = res.failed;
      const rate = res.total > 0 ? Math.round((res.passed / res.total) * 100) : 0;
      document.getElementById('app-test-rate').textContent = `${rate}%`;
      btn.textContent = '▶ Run All 60 Tests';
      btn.disabled = false;

      const container = document.getElementById('app-test-results-container');
      if (container) {
        container.innerHTML = res.results.map(item => `
          <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); padding: 0.75rem 1rem; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; border-left: 4px solid ${item.passed ? 'var(--color-success)' : 'var(--color-error)'}; font-size: 0.85rem;">
            <span>${item.name}</span>
            <span style="font-weight: 700; color: ${item.passed ? 'var(--color-success)' : 'var(--color-error)'};">${item.passed ? 'PASS ✓' : 'FAIL ✕'}</span>
          </div>
        `).join('');
      }

      this.showToast(`Automated Tests Complete: ${res.passed} Passed, ${res.failed} Failed.`, res.failed === 0 ? 'success' : 'error');
    });

    // Keyboard shortcuts for accessibility
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAllModals();
      }
    });
  }

  // --- Settings Bindings ---
  bindSettings() {
    document.getElementById('setting-sound-enabled')?.addEventListener('change', (e) => {
      window.portalAudio.setEnabled(e.target.checked);
      document.getElementById('sound-icon').textContent = e.target.checked ? '🔊' : '🔇';
      window.portalStorage.updateSettings({ soundEnabled: e.target.checked });
    });

    document.getElementById('setting-volume-slider')?.addEventListener('input', (e) => {
      const vol = parseFloat(e.target.value);
      window.portalAudio.setVolume(vol);
      window.portalStorage.updateSettings({ volume: vol });
    });

    document.getElementById('setting-theme-select')?.addEventListener('change', (e) => {
      const theme = e.target.value;
      if (theme === 'light') {
        document.body.classList.add('light-theme');
        document.getElementById('theme-icon').textContent = '☀️';
      } else {
        document.body.classList.remove('light-theme');
        document.getElementById('theme-icon').textContent = '🌙';
      }
      window.portalStorage.updateSettings({ theme });
    });

    document.getElementById('setting-reduced-motion')?.addEventListener('change', (e) => {
      if (e.target.checked) {
        document.body.classList.add('reduced-motion');
      } else {
        document.body.classList.remove('reduced-motion');
      }
      window.portalStorage.updateSettings({ reducedMotion: e.target.checked });
    });

    document.getElementById('setting-default-difficulty')?.addEventListener('change', (e) => {
      this.difficulty = e.target.value;
      window.portalStorage.updateSettings({ defaultDifficulty: e.target.value });
      this.showToast(`Default AI difficulty updated: ${e.target.value}`, 'info');
    });

    document.getElementById('setting-reset-data-btn')?.addEventListener('click', () => {
      if (confirm('Are you certain you want to reset all portal data, scores, and match records? This cannot be undone.')) {
        localStorage.removeItem('STRATEGY_PORTAL_STATE_V1');
        window.location.reload();
      }
    });
  }

  applyLoadedSettings() {
    const settings = window.portalStorage.getSettings();
    if (!settings) return;

    if (settings.theme === 'light') {
      document.body.classList.add('light-theme');
      document.getElementById('theme-icon').textContent = '☀️';
      const themeSelect = document.getElementById('setting-theme-select');
      if (themeSelect) themeSelect.value = 'light';
    }

    if (settings.soundEnabled !== undefined) {
      window.portalAudio.setEnabled(settings.soundEnabled);
      const icon = document.getElementById('sound-icon');
      if (icon) icon.textContent = settings.soundEnabled ? '🔊' : '🔇';
      const soundCheck = document.getElementById('setting-sound-enabled');
      if (soundCheck) soundCheck.checked = settings.soundEnabled;
    }

    if (settings.volume !== undefined) {
      window.portalAudio.setVolume(settings.volume);
      const volSlider = document.getElementById('setting-volume-slider');
      if (volSlider) volSlider.value = settings.volume;
    }

    if (settings.reducedMotion) {
      document.body.classList.add('reduced-motion');
      const redCheck = document.getElementById('setting-reduced-motion');
      if (redCheck) redCheck.checked = true;
    }

    if (settings.defaultDifficulty) {
      this.difficulty = settings.defaultDifficulty;
      const diffSel = document.getElementById('setting-default-difficulty');
      if (diffSel) diffSel.value = settings.defaultDifficulty;
    }
  }

  // --- Profile Management (Direct - No Login / Sign-up Barrier) ---
  bindAuthAndProfile() {
    document.getElementById('header-user-pill')?.addEventListener('click', () => {
      this.openProfileEditModal();
    });

    document.getElementById('profile-edit-btn')?.addEventListener('click', () => {
      this.openProfileEditModal();
    });

    // Profile Avatar Selector
    document.querySelectorAll('.avatar-pick').forEach(item => {
      item.addEventListener('click', () => {
        document.querySelectorAll('.avatar-pick').forEach(i => i.classList.remove('btn-primary'));
        item.classList.add('btn-primary');
        this.selectedAvatar = item.dataset.avatar;
      });
    });

    document.getElementById('profile-save-btn')?.addEventListener('click', () => {
      const name = document.getElementById('profile-input-name').value.trim() || 'Player One';
      const fav = document.getElementById('profile-select-favorite').value;
      window.portalStorage.updateProfile(name, this.selectedAvatar, fav);
      this.updateUserDisplay();
      this.renderProfileView();
      this.closeAllModals();
      this.showToast('Profile updated successfully!', 'success');
      window.portalAudio?.playAchievement();
    });
  }

  updateUserDisplay() {
    const user = window.portalStorage.getCurrentUser();
    if (!user) return;

    const hAvatar = document.getElementById('header-avatar');
    if (hAvatar) hAvatar.textContent = user.avatar || '👑';
    const hUser = document.getElementById('header-username');
    if (hUser) hUser.textContent = user.displayName || user.username;
    const hLvl = document.getElementById('header-level');
    if (hLvl) hLvl.textContent = `LVL ${user.level || 1}`;

    const dashAvatar = document.getElementById('dash-avatar');
    if (dashAvatar) dashAvatar.textContent = user.avatar || '👑';

    const dashGreeting = document.getElementById('dash-greeting');
    if (dashGreeting) dashGreeting.textContent = `Welcome, ${user.displayName || user.username}`;

    const guestTag = document.getElementById('dash-guest-tag');
    if (guestTag) guestTag.textContent = user.isGuest ? 'Guest Session' : 'Verified Strategist';

    // XP Progress
    const xp = user.xp || 0;
    const currentLvlXP = (user.level - 1) * 250;
    const progressInLvl = xp - currentLvlXP;
    const pct = Math.min(100, Math.max(0, (progressInLvl / 250) * 100));

    const lvlText = document.getElementById('dash-level-text');
    if (lvlText) lvlText.textContent = `Level ${user.level} Strategist`;

    const xpText = document.getElementById('dash-xp-text');
    if (xpText) xpText.textContent = `${progressInLvl} / 250 XP (${xp} Total)`;

    const xpFill = document.getElementById('dash-xp-fill');
    if (xpFill) xpFill.style.width = `${pct}%`;
  }

  // --- Modals Management ---
  bindModals() {
    document.getElementById('auth-modal-close')?.addEventListener('click', () => {
      this.closeAllModals();
    });

    document.getElementById('profile-edit-modal-close')?.addEventListener('click', () => {
      this.closeAllModals();
    });

    document.getElementById('gameover-rematch-btn')?.addEventListener('click', () => {
      this.closeAllModals();
      if (this.activeGameId) {
        this.launchGame(this.activeGameId, true);
      }
    });

    document.getElementById('gameover-library-btn')?.addEventListener('click', () => {
      this.closeAllModals();
      this.switchView('library');
    });

    // Chess Promotion handlers
    document.querySelectorAll('.promotion-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const piece = btn.dataset.piece;
        this.resolveChessPromotion(piece);
      });
    });
  }

  openAuthModal() {
    this.openProfileEditModal();
  }

  openProfileEditModal() {
    const user = window.portalStorage.getCurrentUser();
    document.getElementById('profile-input-name').value = user.displayName || 'Player One';
    document.getElementById('profile-select-favorite').value = user.favoriteGame || 'chess';
    this.selectedAvatar = user.avatar || '⚡';
    document.querySelectorAll('.avatar-pick').forEach(item => {
      if (item.dataset.avatar === this.selectedAvatar) item.classList.add('btn-primary');
      else item.classList.remove('btn-primary');
    });
    document.getElementById('profile-edit-modal').classList.add('active');
  }

  closeAllModals() {
    document.querySelectorAll('.modal-backdrop').forEach(modal => {
      modal.classList.remove('active');
    });
  }

  // --- Render Views Content ---

  renderFeaturedGames() {
    const grid = document.getElementById('home-featured-games-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const featured = ['chess', 'tetris', 'snake', 'game_2048', 'checkers', 'breakout'];
    featured.forEach(id => {
      const g = this.gamesCatalog[id];
      if (g) {
        const card = this.createGameCardElement(g);
        grid.appendChild(card);
      }
    });
  }

  renderLibrary() {
    const grid = document.getElementById('full-library-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const filter = this.libraryFilter || 'all';
    const games = Object.values(this.gamesCatalog).filter(g => {
      if (filter === 'all') return true;
      return g.category === filter;
    });

    games.forEach(g => {
      const card = this.createGameCardElement(g);
      grid.appendChild(card);
    });

    // Bind category filter pills
    document.querySelectorAll('#library-filter-bar .filter-pill').forEach(pill => {
      pill.onclick = () => {
        document.querySelectorAll('#library-filter-bar .filter-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this.libraryFilter = pill.dataset.filter;
        this.renderLibrary();
      };
    });
  }

  createGameCardElement(g) {
    const card = document.createElement('div');
    card.className = 'portal-card game-card card-interactive';
    card.style.cursor = 'pointer';
    card.innerHTML = `
      <div class="game-card-banner">
        <span class="game-banner-icon">${g.icon}</span>
        <span class="game-badge-category">${g.category}</span>
      </div>
      <div class="game-card-content">
        <h3 class="game-card-title">${g.name}</h3>
        <p class="game-card-desc">${g.desc}</p>
        <div class="game-card-meta">
          <span>👥 ${g.players}</span>
          <span>⚡ ${g.difficulty}</span>
        </div>
        <div class="game-card-actions">
          <button class="btn btn-primary btn-sm play-game-btn" data-id="${g.id}">Play Game</button>
          <button class="btn btn-secondary btn-sm rules-game-btn" data-id="${g.id}">Rules</button>
        </div>
      </div>
    `;

    // Click anywhere on card to launch game, except on Rules button
    card.addEventListener('click', (e) => {
      if (e.target.closest('.rules-game-btn')) {
        this.switchView('rules');
        return;
      }
      this.launchGame(g.id);
    });

    return card;
  }

  renderDashboard() {
    const user = window.portalStorage.getCurrentUser();
    if (!user) return;

    this.updateUserDisplay();

    // Stats
    const playedEl = document.getElementById('dash-stat-played');
    if (playedEl) playedEl.textContent = user.stats.totalPlayed || 0;
    const winsEl = document.getElementById('dash-stat-wins');
    if (winsEl) winsEl.textContent = user.stats.wins || 0;
    const rate = user.stats.totalPlayed > 0 
      ? Math.round((user.stats.wins / user.stats.totalPlayed) * 100) 
      : 0;
    const winrateEl = document.getElementById('dash-stat-winrate');
    if (winrateEl) winrateEl.textContent = `${rate}%`;

    const unlockedCount = Object.keys(user.achievements || {}).length;
    const achieveEl = document.getElementById('dash-stat-achieve');
    if (achieveEl) achieveEl.textContent = `${unlockedCount} / 10`;

    // Active Games ("Continue Playing")
    const activeEntries = Object.values(window.portalStorage.state.activeGames || {});
    const activeCard = document.getElementById('dash-active-game-card');
    const continueBadge = document.getElementById('continue-count-badge');

    if (activeEntries.length > 0) {
      const latest = activeEntries[0];
      const g = this.gamesCatalog[latest.gameId];
      if (activeCard && g) {
        activeCard.style.display = 'block';
        document.getElementById('dash-active-game-desc').textContent = 
          `Unfinished ${g.name} match in progress from ${new Date(latest.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`;
        
        document.getElementById('dash-resume-active-btn').onclick = () => {
          this.resumeGame(latest.gameId);
        };
        document.getElementById('dash-discard-active-btn').onclick = () => {
          window.portalStorage.clearActiveGame(latest.gameId);
          this.renderDashboard();
          this.showToast('Saved game discarded.', 'info');
        };
      }
      if (continueBadge) {
        continueBadge.textContent = activeEntries.length;
        continueBadge.style.display = 'inline-block';
      }
    } else {
      if (activeCard) activeCard.style.display = 'none';
      if (continueBadge) continueBadge.style.display = 'none';
    }

    // Daily Challenges in Dashboard
    const challengesList = document.getElementById('dash-challenges-list');
    if (challengesList) {
      const challenges = window.portalStorage.getDailyChallenges();
      const today = window.portalStorage.getTodayDateString();
      const prog = user.challengesProgress[today] || {};

      challengesList.innerHTML = challenges.map(ch => {
        let current = 0;
        if (ch.progressType === 'play_count') current = prog.play_count || 0;
        if (ch.progressType === 'win_ai') current = prog.win_ai || 0;
        if (ch.progressType === 'win_board') current = prog.win_board || 0;

        const isComplete = current >= ch.target;
        const isClaimed = prog.claimed && prog.claimed[ch.id];
        const pct = Math.min(100, Math.round((current / ch.target) * 100));

        return `
          <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 0.85rem;">
            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 700; margin-bottom: 0.35rem;">
              <span>${ch.title}</span>
              <span style="color: var(--accent-gold);">+${ch.xpReward} XP</span>
            </div>
            <div style="font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 0.5rem;">${ch.desc}</div>
            <div class="progress-track" style="margin-bottom: 0.5rem;">
              <div class="progress-fill" style="width: ${pct}%;"></div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem;">
              <span>${current} / ${ch.target}</span>
              ${isClaimed 
                ? '<span style="color: var(--color-success); font-weight: 700;">Claimed ✓</span>'
                : (isComplete 
                  ? `<button class="btn btn-primary btn-sm claim-challenge-btn" data-id="${ch.id}" data-xp="${ch.xpReward}" style="padding: 2px 8px; font-size: 0.75rem;">Claim</button>`
                  : '<span style="color: var(--text-muted);">In Progress</span>')
              }
            </div>
          </div>
        `;
      }).join('');

      challengesList.querySelectorAll('.claim-challenge-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.dataset.id;
          const xp = parseInt(btn.dataset.xp, 10);
          const res = window.portalStorage.claimDailyChallenge(id, xp);
          if (res.success) {
            this.showToast(`Challenge claimed! +${xp} XP`, 'gold');
            window.portalAudio?.playAchievement();
            this.renderDashboard();
          }
        });
      });
    }

    // Recent Matches Snippet
    const historyList = document.getElementById('dash-recent-history-list');
    if (historyList) {
      const matches = window.portalStorage.getMatchHistory().slice(0, 4);
      if (matches.length === 0) {
        historyList.innerHTML = '<p style="color: var(--text-muted); font-size: 0.85rem;">No games completed yet. Start your first game in the Game Library!</p>';
      } else {
        historyList.innerHTML = matches.map(m => {
          const g = this.gamesCatalog[m.gameId];
          const badgeClass = m.result === 'win' ? 'color-success' : (m.result === 'loss' ? 'color-error' : 'color-warning');
          const outcomeText = m.result.toUpperCase();
          return `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.65rem 0; border-bottom: 1px solid var(--border-subtle); font-size: 0.85rem;">
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span>${g ? g.icon : '🎮'}</span>
                <span style="font-weight: 600;">${g ? g.name : m.gameId}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 1rem;">
                <span style="font-size: 0.75rem; color: var(--text-muted);">${m.movesCount} moves</span>
                <span style="font-weight: 700; color: var(--${badgeClass});">${outcomeText}</span>
              </div>
            </div>
          `;
        }).join('');
      }
    }
  }

  renderContinueView() {
    const list = document.getElementById('continue-games-list');
    if (!list) return;

    const entries = Object.values(window.portalStorage.state.activeGames || {});
    if (entries.length === 0) {
      list.innerHTML = `
        <div class="portal-card" style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
          <div style="font-size: 3rem; margin-bottom: 1rem;">⏯️</div>
          <h3>No Saved Games In Progress</h3>
          <p style="color: var(--text-secondary); margin-top: 0.5rem; margin-bottom: 1.5rem;">
            Matches you start and leave will automatically be saved here so you can resume them at any time.
          </p>
          <button class="btn btn-primary" onclick="window.portalApp.switchView('library')">Explore Game Library</button>
        </div>
      `;
      return;
    }

    list.innerHTML = entries.map(item => {
      const g = this.gamesCatalog[item.gameId];
      if (!g) return '';
      return `
        <div class="portal-card game-card">
          <div class="game-card-banner">
            <span class="game-banner-icon">${g.icon}</span>
            <span class="game-badge-category">Active Save</span>
          </div>
          <div class="game-card-content">
            <h3 class="game-card-title">${g.name}</h3>
            <p class="game-card-desc">Last move made: ${new Date(item.updatedAt).toLocaleString()}</p>
            <div class="game-card-actions" style="margin-top: 1rem;">
              <button class="btn btn-primary btn-sm resume-btn" data-id="${item.gameId}">Resume Match</button>
              <button class="btn btn-danger btn-sm discard-btn" data-id="${item.gameId}">Discard</button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    list.querySelectorAll('.resume-btn').forEach(btn => {
      btn.addEventListener('click', () => this.resumeGame(btn.dataset.id));
    });

    list.querySelectorAll('.discard-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        window.portalStorage.clearActiveGame(btn.dataset.id);
        this.renderContinueView();
        this.showToast('Saved match discarded.', 'info');
      });
    });
  }

  renderDailyChallenges() {
    const grid = document.getElementById('full-challenges-grid');
    if (!grid) return;

    const user = window.portalStorage.getCurrentUser();
    const challenges = window.portalStorage.getDailyChallenges();
    const today = window.portalStorage.getTodayDateString();
    const prog = user.challengesProgress[today] || {};

    grid.innerHTML = challenges.map(ch => {
      let current = 0;
      if (ch.progressType === 'play_count') current = prog.play_count || 0;
      if (ch.progressType === 'win_ai') current = prog.win_ai || 0;
      if (ch.progressType === 'win_board') current = prog.win_board || 0;

      const isComplete = current >= ch.target;
      const isClaimed = prog.claimed && prog.claimed[ch.id];
      const pct = Math.min(100, Math.round((current / ch.target) * 100));

      return `
        <div class="portal-card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
            <h3 style="font-size: 1.15rem;">${ch.title}</h3>
            <span class="brand-badge">+${ch.xpReward} XP</span>
          </div>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1.25rem;">${ch.desc}</p>
          <div class="progress-track" style="margin-bottom: 0.75rem;">
            <div class="progress-fill" style="width: ${pct}%;"></div>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 0.85rem; font-weight: 700;">${current} / ${ch.target} Completed</span>
            ${isClaimed 
              ? '<span style="color: var(--color-success); font-weight: 700;">Claimed ✓</span>'
              : (isComplete 
                ? `<button class="btn btn-primary btn-sm full-claim-btn" data-id="${ch.id}" data-xp="${ch.xpReward}">Claim Reward</button>`
                : '<span class="game-status-chip">In Progress</span>')
            }
          </div>
        </div>
      `;
    }).join('');

    grid.querySelectorAll('.full-claim-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const xp = parseInt(btn.dataset.xp, 10);
        const res = window.portalStorage.claimDailyChallenge(id, xp);
        if (res.success) {
          this.showToast(`Daily challenge reward claimed! +${xp} XP`, 'gold');
          window.portalAudio?.playAchievement();
          this.renderDailyChallenges();
          this.updateUserDisplay();
        }
      });
    });
  }

  renderAchievements() {
    const grid = document.getElementById('achievements-full-grid');
    if (!grid) return;

    const user = window.portalStorage.getCurrentUser();
    const defs = window.portalStorage.getAchievementDefinitions();
    const userAchieve = user.achievements || {};
    const unlockedCount = Object.keys(userAchieve).length;

    const summaryChip = document.getElementById('achievements-summary-chip');
    if (summaryChip) summaryChip.textContent = `${unlockedCount} / ${defs.length} Unlocked`;

    grid.innerHTML = defs.map(ach => {
      const isUnlocked = !!userAchieve[ach.id];
      const unlockData = userAchieve[ach.id];

      return `
        <div class="achievement-card ${isUnlocked ? 'unlocked' : 'locked'}">
          <div class="achievement-badge-icon">${ach.icon}</div>
          <div class="achievement-content">
            <span class="achievement-name">${ach.name}</span>
            <span class="achievement-desc">${ach.desc}</span>
            <span class="achievement-reward">Reward: +${ach.rewardXP} XP</span>
            ${isUnlocked && unlockData?.unlockedAt 
              ? `<span style="font-size: 0.7rem; color: var(--color-success); margin-top: 2px;">Unlocked ${new Date(unlockData.unlockedAt).toLocaleDateString()}</span>` 
              : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  renderLeaderboard(tab = 'xp') {
    const tbody = document.getElementById('leaderboard-tbody');
    if (!tbody) return;

    const data = window.portalStorage.getLeaderboardData();
    let list = data.byXP;
    if (tab === 'wins') list = data.byWins;
    if (tab === 'rate') list = data.byRate;

    // Highlight active tab button
    ['xp', 'wins', 'rate'].forEach(t => {
      const btn = document.getElementById(`lb-tab-${t}`);
      if (btn) {
        if (t === tab) btn.classList.add('active');
        else btn.classList.remove('active');
      }
    });

    if (list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 2rem;">No verified leaderboard entries found.</td></tr>';
      return;
    }

    tbody.innerHTML = list.map((u, idx) => {
      const rank = idx + 1;
      let rankBadge = `<span class="rank-badge">${rank}</span>`;
      if (rank === 1) rankBadge = `<span class="rank-badge rank-1">🥇</span>`;
      if (rank === 2) rankBadge = `<span class="rank-badge rank-2">🥈</span>`;
      if (rank === 3) rankBadge = `<span class="rank-badge rank-3">🥉</span>`;

      const scoreVal = tab === 'xp' 
        ? `${u.xp || 0} XP` 
        : (tab === 'wins' 
          ? `${u.stats?.wins || 0} Wins` 
          : `${Math.round(((u.stats?.wins || 0) / (u.stats?.totalPlayed || 1)) * 100)}%`);

      return `
        <tr>
          <td>${rankBadge}</td>
          <td>
            <div style="display: flex; align-items: center; gap: 0.6rem;">
              <span style="font-size: 1.25rem;">${u.avatar || '👑'}</span>
              <span style="font-weight: 700;">${u.displayName || u.username}</span>
              ${u.isGuest ? '<span style="font-size: 0.7rem; color: var(--text-muted);">(Guest)</span>' : ''}
            </div>
          </td>
          <td>LVL ${u.level || 1}</td>
          <td>${u.stats?.totalPlayed || 0}</td>
          <td style="color: var(--color-success); font-weight: 700;">${u.stats?.wins || 0}</td>
          <td style="color: var(--accent-gold); font-weight: 800;">${scoreVal}</td>
        </tr>
      `;
    }).join('');

    // Tab bindings
    document.getElementById('lb-tab-xp').onclick = () => this.renderLeaderboard('xp');
    document.getElementById('lb-tab-wins').onclick = () => this.renderLeaderboard('wins');
    document.getElementById('lb-tab-rate').onclick = () => this.renderLeaderboard('rate');
  }

  renderMatchHistory() {
    const tbody = document.getElementById('history-full-tbody');
    if (!tbody) return;

    const matches = window.portalStorage.getMatchHistory();
    if (matches.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 2.5rem;">No match records recorded yet. Complete games to verify history!</td></tr>';
      return;
    }

    tbody.innerHTML = matches.map(m => {
      const g = this.gamesCatalog[m.gameId];
      const outcomeClass = m.result === 'win' ? 'color-success' : (m.result === 'loss' ? 'color-error' : 'color-warning');
      const dateStr = new Date(m.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
      const durationStr = `${m.durationSec || 0}s`;

      return `
        <tr>
          <td style="color: var(--text-muted); font-size: 0.8rem;">${dateStr}</td>
          <td>
            <span style="font-weight: 600;">${g ? g.icon : '🎮'} ${g ? g.name : m.gameId}</span>
          </td>
          <td>${m.opponentType}</td>
          <td><span class="game-status-chip">${m.difficulty.toUpperCase()}</span></td>
          <td style="color: var(--${outcomeClass}); font-weight: 800;">${m.result.toUpperCase()}</td>
          <td>${m.movesCount}</td>
          <td>${durationStr}</td>
        </tr>
      `;
    }).join('');
  }

  renderProfileView() {
    const user = window.portalStorage.getCurrentUser();
    if (!user) return;

    document.getElementById('profile-avatar-display').textContent = user.avatar || '👑';
    document.getElementById('profile-display-name').textContent = user.displayName || user.username;
    document.getElementById('profile-role-badge').textContent = user.isGuest ? 'Guest Session' : 'Registered Strategist';
    document.getElementById('profile-joined-text').textContent = `Member since ${new Date(user.joinDate).toLocaleDateString()}`;
    document.getElementById('profile-total-xp').textContent = `${user.xp || 0} XP (LVL ${user.level || 1})`;

    // Breakdown Grid
    const breakdownGrid = document.getElementById('profile-breakdown-grid');
    if (!breakdownGrid) return;

    breakdownGrid.innerHTML = Object.entries(this.gamesCatalog).map(([gid, g]) => {
      const stats = (user.stats?.gamesBreakdown && user.stats.gamesBreakdown[gid]) 
        ? user.stats.gamesBreakdown[gid] 
        : { played: 0, wins: 0, losses: 0, draws: 0 };

      return `
        <div class="stat-box">
          <div class="stat-icon-wrapper">${g.icon}</div>
          <div class="stat-info-col">
            <span style="font-weight: 700; font-size: 0.95rem;">${g.name}</span>
            <span style="font-size: 0.8rem; color: var(--text-secondary);">Played: ${stats.played || 0} | Wins: ${stats.wins || 0}</span>
            ${stats.bestTime ? `<span style="font-size: 0.75rem; color: var(--accent-gold);">Best Time: ${stats.bestTime}s</span>` : ''}
            ${stats.bestMoves ? `<span style="font-size: 0.75rem; color: var(--accent-gold);">Best Moves: ${stats.bestMoves}</span>` : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  // --- Tournament System ---
  initTournamentSystem() {
    this.tournamentState = {
      title: 'Grandmasters Autumn Championship',
      game: 'chess',
      round: 1, // 1 (Quarterfinals), 2 (Semifinals), 3 (Finals)
      matches: [
        { id: 'm1', p1: 'Strategist (You)', p2: 'Tactician Bot', winner: null },
        { id: 'm2', p1: 'Bishop Hunter', p2: 'Deep Gambit', winner: 'Deep Gambit' },
        { id: 'm3', p1: 'Knight Rider', p2: 'Queen Vanguard', winner: 'Knight Rider' },
        { id: 'm4', p1: 'Alpha Pawn', p2: 'Iron Castle', winner: 'Alpha Pawn' }
      ]
    };

    document.getElementById('sim-tournament-round-btn')?.addEventListener('click', () => {
      this.advanceTournamentRound();
    });

    document.getElementById('create-tournament-btn')?.addEventListener('click', () => {
      this.showToast('Tournament format regenerated!', 'success');
      this.initTournamentSystem();
      this.renderTournamentBracket();
    });

    this.renderTournamentBracket();
  }

  renderTournamentBracket() {
    const display = document.getElementById('tournament-bracket-display');
    if (!display || !this.tournamentState) return;

    display.innerHTML = `
      <div class="bracket-round">
        <span class="sidebar-section-title">Quarterfinals</span>
        ${this.tournamentState.matches.map(m => `
          <div class="bracket-match-node">
            <div class="bracket-participant ${m.winner === m.p1 ? 'winner' : ''}">
              <span>${m.p1}</span>
              ${m.winner === m.p1 ? '<span>👑</span>' : ''}
            </div>
            <div class="bracket-participant ${m.winner === m.p2 ? 'winner' : ''}">
              <span>${m.p2}</span>
              ${m.winner === m.p2 ? '<span>👑</span>' : ''}
            </div>
          </div>
        `).join('')}
      </div>

      <div class="bracket-round">
        <span class="sidebar-section-title">Semifinals</span>
        <div class="bracket-match-node">
          <div class="bracket-participant ${this.tournamentState.round > 1 ? 'winner' : ''}">
            <span>${this.tournamentState.matches[0].winner || 'TBD'}</span>
          </div>
          <div class="bracket-participant ${this.tournamentState.round > 1 ? 'winner' : ''}">
            <span>${this.tournamentState.matches[1].winner || 'TBD'}</span>
          </div>
        </div>
        <div class="bracket-match-node">
          <div class="bracket-participant ${this.tournamentState.round > 1 ? 'winner' : ''}">
            <span>${this.tournamentState.matches[2].winner || 'TBD'}</span>
          </div>
          <div class="bracket-participant ${this.tournamentState.round > 1 ? 'winner' : ''}">
            <span>${this.tournamentState.matches[3].winner || 'TBD'}</span>
          </div>
        </div>
      </div>

      <div class="bracket-round">
        <span class="sidebar-section-title">Championship Finals</span>
        <div class="bracket-match-node" style="border-color: var(--border-gold);">
          <div class="bracket-participant ${this.tournamentState.round >= 3 ? 'winner' : ''}">
            <span>${this.tournamentState.round >= 3 ? 'Strategist (You)' : 'TBD'}</span>
          </div>
          <div class="bracket-participant">
            <span>${this.tournamentState.round >= 3 ? 'Deep Gambit' : 'TBD'}</span>
          </div>
        </div>
      </div>
    `;
  }

  advanceTournamentRound() {
    if (!this.tournamentState) return;
    if (this.tournamentState.round === 1) {
      this.tournamentState.matches[0].winner = 'Strategist (You)';
      this.tournamentState.round = 2;
      this.showToast('You advanced to the Semifinals!', 'gold');
    } else if (this.tournamentState.round === 2) {
      this.tournamentState.round = 3;
      this.showToast('You reached the Championship Finals!', 'gold');
    } else if (this.tournamentState.round === 3) {
      this.showToast('Tournament Champion! Trophy awarded.', 'gold');
      window.portalAudio?.playAchievement();
    }
    this.renderTournamentBracket();
  }

  // ==========================================================================
  // GAME SHELL ENGINE ORCHESTRATOR
  // ==========================================================================

  stopAllGameLoops() {
    this.stopClocks();
    this.stopMinesweeperTimer();
    this.stopMemoryTimer();
    if (this.snakeInterval) { clearInterval(this.snakeInterval); this.snakeInterval = null; }
    if (this.tetrisInterval) { clearInterval(this.tetrisInterval); this.tetrisInterval = null; }
    if (this.pongAnimFrame) { cancelAnimationFrame(this.pongAnimFrame); this.pongAnimFrame = null; }
    if (this.breakoutAnimFrame) { cancelAnimationFrame(this.breakoutAnimFrame); this.breakoutAnimFrame = null; }
    if (this.activeEngine && (this.activeGameId === 'pong' || this.activeGameId === 'breakout')) {
      this.activeEngine.paused = true;
    }
  }

  launchGame(gameId, isRestart = false) {
    if (!this.gamesCatalog[gameId]) return;

    this.stopAllGameLoops();

    this.activeGameId = gameId;
    this.selectedSquare = null;
    this.legalMovesForSelected = [];
    this.matchStartTime = Date.now();

    // Reset Clocks
    this.userClockSec = 300;
    this.oppClockSec = 300;
    this.activeClockSide = 'w';

    // Update Header
    this.updateGameShellHeader();

    // Initialize Move History Table with informative status
    const tbody = document.getElementById('move-history-tbody');
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="3" class="placeholder-row" style="text-align: center; color: var(--text-muted); font-size: 0.8rem; padding: 0.75rem 0.5rem; font-style: italic;">⚡ Tactical match initialized. Awaiting opening move...</td></tr>`;
    }
    const moveIndicator = document.getElementById('move-count-indicator');
    if (moveIndicator) moveIndicator.textContent = '0 Moves';

    // Clear any previous draw banners
    document.getElementById('in-game-draw-banner')?.remove();

    // Instantiate appropriate game engine
    switch (gameId) {
      case 'chess':
        this.activeEngine = new window.ChessEngine();
        this.renderChessBoard();
        this.startClocks();
        break;
      case 'tictactoe':
        this.activeEngine = new window.TicTacToeEngine();
        this.renderTicTacToeBoard();
        break;
      case 'connect4':
        this.activeEngine = new window.Connect4Engine();
        this.renderConnect4Board();
        break;
      case 'reversi':
        this.activeEngine = new window.ReversiEngine();
        this.renderReversiBoard();
        break;
      case 'minesweeper':
        this.activeEngine = new window.MinesweeperEngine(this.difficulty === 'hard' ? 'expert' : (this.difficulty === 'medium' ? 'intermediate' : 'beginner'));
        this.renderMinesweeperBoard();
        this.startMinesweeperTimer();
        break;
      case 'memory':
        this.activeEngine = new window.MemoryMatchEngine(this.difficulty === 'hard' ? 'expert' : (this.difficulty === 'medium' ? 'standard' : 'casual'));
        this.renderMemoryBoard();
        this.startMemoryTimer();
        break;
      case 'game_2048':
        this.activeEngine = new window.Game2048Engine();
        this.render2048Board();
        break;
      case 'snake':
        this.activeEngine = new window.SnakeEngine();
        this.renderSnakeBoard();
        break;
      case 'checkers':
        this.activeEngine = new window.CheckersEngine();
        this.renderCheckersBoard();
        break;
      case 'sudoku':
        this.activeEngine = new window.SudokuEngine(this.difficulty);
        this.renderSudokuBoard();
        break;
      case 'tetris':
        this.activeEngine = new window.TetrisEngine();
        this.renderTetrisBoard();
        break;
      case 'pong':
        this.activeEngine = new window.PongEngine(this.difficulty);
        this.renderPongBoard();
        break;
      case 'wordle':
        this.activeEngine = new window.WordleEngine();
        this.renderWordleBoard();
        break;
      case 'simon':
        this.activeEngine = new window.SimonEngine();
        this.renderSimonBoard();
        break;
      case 'battleship':
        this.activeEngine = new window.BattleshipEngine();
        this.renderBattleshipBoard();
        break;
      case 'breakout':
        this.activeEngine = new window.BreakoutEngine();
        this.renderBreakoutBoard();
        break;
    }

    const flipBtn = document.getElementById('shell-flip-btn');
    if (flipBtn) {
      flipBtn.style.display = (gameId === 'chess') ? 'inline-flex' : 'none';
    }

    this.switchView('game');
  }

  startMinesweeperTimer() {
    this.stopMinesweeperTimer();
    this.msInterval = setInterval(() => {
      if (this.activeEngine && this.activeGameId === 'minesweeper' && this.activeEngine.firstClickMade && !this.activeEngine.gameOver) {
        this.activeEngine.elapsedSeconds = Math.floor((Date.now() - this.activeEngine.startTime) / 1000);
        const timerEl = document.getElementById('ms-timer-val');
        if (timerEl) {
          timerEl.textContent = String(Math.min(999, this.activeEngine.elapsedSeconds)).padStart(3, '0');
        }
      }
    }, 1000);
  }

  stopMinesweeperTimer() {
    if (this.msInterval) {
      clearInterval(this.msInterval);
      this.msInterval = null;
    }
  }

  startMemoryTimer() {
    this.stopMemoryTimer();
    this.memInterval = setInterval(() => {
      if (this.activeEngine && this.activeGameId === 'memory' && this.activeEngine.startTime && !this.activeEngine.gameWon) {
        this.activeEngine.elapsedSeconds = Math.floor((Date.now() - this.activeEngine.startTime) / 1000);
        const widget = document.getElementById('game-widget-content');
        if (widget) {
          widget.innerHTML = `
            <div style="display: flex; justify-content: space-around; font-size: 0.95rem; font-weight: 700;">
              <span>Moves: ${this.activeEngine.moves}</span>
              <span>Matched: ${this.activeEngine.matchedPairs} / ${this.activeEngine.totalPairs}</span>
              <span style="color: var(--accent-gold);">⏱️ ${this.activeEngine.elapsedSeconds}s</span>
            </div>
          `;
        }
      }
    }, 1000);
  }

  stopMemoryTimer() {
    if (this.memInterval) {
      clearInterval(this.memInterval);
      this.memInterval = null;
    }
  }

  startLocalGame(gameId) {
    this.gameMode = 'local';
    this.launchGame(gameId);
  }

  resumeGame(gameId) {
    const saved = window.portalStorage.getActiveGame(gameId);
    if (!saved) {
      this.launchGame(gameId);
      return;
    }

    this.launchGame(gameId);
    if (this.activeEngine && this.activeEngine.loadState) {
      this.activeEngine.loadState(saved.state);
      // Re-render
      if (gameId === 'chess') this.renderChessBoard();
      if (gameId === 'tictactoe') this.renderTicTacToeBoard();
      if (gameId === 'connect4') this.renderConnect4Board();
      if (gameId === 'reversi') this.renderReversiBoard();
      if (gameId === 'minesweeper') this.renderMinesweeperBoard();
      if (gameId === 'memory') this.renderMemoryBoard();
      this.showToast(`Resumed in-progress ${this.gamesCatalog[gameId].name} match.`, 'info');
    }
  }

  saveActiveGameProgress() {
    if (this.activeEngine && this.activeEngine.exportState && this.activeGameId) {
      const state = this.activeEngine.exportState();
      window.portalStorage.saveActiveGame(this.activeGameId, state);
    }
  }

  updateGameShellHeader() {
    const g = this.gamesCatalog[this.activeGameId];
    if (!g) return;

    const iconEl = document.getElementById('shell-game-icon');
    if (iconEl) iconEl.textContent = g.icon;
    const nameEl = document.getElementById('shell-game-name');
    if (nameEl) nameEl.textContent = g.name;

    const modeChip = document.getElementById('shell-game-mode-chip');
    if (modeChip) {
      modeChip.textContent = this.gameMode === 'ai' 
        ? `vs ${this.difficulty.toUpperCase()} AI` 
        : 'Pass & Play (2P)';
    }

    // Update Player Names
    const user = window.portalStorage.getCurrentUser();
    const userPlayName = document.getElementById('user-play-name');
    if (userPlayName) userPlayName.textContent = `${user.displayName || user.username} (You)`;
    const oppName = document.getElementById('opponent-name');
    if (oppName) oppName.textContent = this.gameMode === 'ai' ? `Computer (${this.difficulty.toUpperCase()})` : 'Player 2';
  }

  handleUndo() {
    if (!this.activeEngine || !this.activeEngine.undo) {
      this.showToast('Undo not available for this mode.', 'info');
      return;
    }

    // In AI mode, undo twice to step back before AI's move
    let success = this.activeEngine.undo();
    if (this.gameMode === 'ai' && success) {
      this.activeEngine.undo();
    }

    if (success) {
      window.portalAudio?.playMove();
      if (this.activeGameId === 'chess') this.renderChessBoard();
      if (this.activeGameId === 'tictactoe') this.renderTicTacToeBoard();
      if (this.activeGameId === 'connect4') this.renderConnect4Board();
      if (this.activeGameId === 'reversi') this.renderReversiBoard();
      this.showToast('Previous move undone.', 'info');
    }
  }

  // Clocks
  startClocks() {
    this.stopClocks();
    this.turnTimer = setInterval(() => {
      if (this.activeClockSide === 'w') {
        this.userClockSec = Math.max(0, this.userClockSec - 1);
        document.getElementById('user-clock').textContent = this.formatTime(this.userClockSec);
        if (this.userClockSec === 0) this.handleTimeout('b_win');
      } else {
        this.oppClockSec = Math.max(0, this.oppClockSec - 1);
        document.getElementById('opponent-clock').textContent = this.formatTime(this.oppClockSec);
        if (this.oppClockSec === 0) this.handleTimeout('w_win');
      }
    }, 1000);
  }

  stopClocks() {
    if (this.turnTimer) {
      clearInterval(this.turnTimer);
      this.turnTimer = null;
    }
  }

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  handleTimeout(winnerResult) {
    this.stopClocks();
    const isWin = winnerResult === 'w_win';
    this.concludeMatch(isWin ? 'win' : 'loss', 'Time forfeit: Clock reached zero.');
  }

  // --- Match Conclusion & Rewards ---
  concludeMatch(result, reasonText, extra = {}) {
    this.stopAllGameLoops();
    window.portalStorage.clearActiveGame(this.activeGameId);

    const movesCount = this.activeEngine.moveCount || (this.activeEngine.history ? this.activeEngine.history.length : 0);
    const durationSec = Math.round((Date.now() - (this.matchStartTime || Date.now())) / 1000);

    const recordedDifficulty = (this.activeEngine && this.activeEngine.difficulty) ? this.activeEngine.difficulty : this.difficulty;

    const outcome = window.portalStorage.recordMatch({
      gameId: this.activeGameId,
      opponentType: this.gameMode === 'ai' ? 'AI' : 'Local Player',
      difficulty: recordedDifficulty,
      result: result,
      movesCount: movesCount,
      durationSec: durationSec,
      extra: extra
    });

    // Sound and Modal
    if (result === 'win') {
      window.portalAudio?.playVictory();
    } else if (result === 'loss') {
      window.portalAudio?.playDefeat();
    } else {
      window.portalAudio?.playDraw();
    }

    // Show Game Over Modal
    const modal = document.getElementById('gameover-modal');
    const icon = document.getElementById('gameover-icon');
    const title = document.getElementById('gameover-title');
    const reason = document.getElementById('gameover-reason');
    const xpText = document.getElementById('gameover-xp-text');
    const rematchBtn = document.getElementById('gameover-rematch-btn');

    if (rematchBtn) {
      rematchBtn.textContent = '🔄 Play Again';
    }

    if (result === 'win') {
      icon.textContent = '🏆';
      title.textContent = 'Victory!';
      title.style.color = 'var(--accent-gold)';
    } else if (result === 'loss') {
      icon.textContent = '💔';
      title.textContent = 'Defeat';
      title.style.color = 'var(--color-error)';
    } else {
      icon.textContent = '🤝';
      title.textContent = 'Match Ended in a Draw!';
      title.style.color = 'var(--accent-gold)';
    }

    reason.textContent = reasonText || 'Match concluded.';
    xpText.textContent = `+${outcome.xpResult.leveledUp ? 'LEVEL UP! ' : ''}${result === 'win' ? '115' : (result === 'draw' ? '40' : '15')} XP Awarded`;

    modal.classList.add('active');

    // In-game Banner / Status button for Draw (and Game Over)
    const statusMsg = document.getElementById('game-status-message');
    if (statusMsg) {
      const outcomeLabel = result === 'draw' ? '🤝 Draw Game!' : (result === 'win' ? '🏆 Victory!' : 'Match Finished');
      statusMsg.innerHTML = `<span style="color: var(--accent-gold); font-weight: 700;">${outcomeLabel}</span> <button class="btn btn-primary btn-sm" id="status-quick-rematch-btn" style="margin-left: 8px; padding: 2px 8px; font-size: 0.75rem;">🔄 Play Again</button>`;
      document.getElementById('status-quick-rematch-btn')?.addEventListener('click', () => {
        this.closeAllModals();
        this.launchGame(this.activeGameId, true);
      });
    }

    if (result === 'draw') {
      const mount = document.getElementById('active-game-board-mount');
      if (mount && !document.getElementById('in-game-draw-banner')) {
        const banner = document.createElement('div');
        banner.className = 'game-draw-banner';
        banner.id = 'in-game-draw-banner';
        banner.innerHTML = `
          <div class="draw-banner-text"><span>🤝</span> <span>Game Drawn! Rematch available.</span></div>
          <button class="draw-play-again-btn" id="board-draw-rematch-btn">🔄 Play Again</button>
        `;
        mount.prepend(banner);
        document.getElementById('board-draw-rematch-btn')?.addEventListener('click', () => {
          this.closeAllModals();
          this.launchGame(this.activeGameId, true);
        });
      }
    }

    // Notify Achievements Unlocked
    if (outcome.unlockedAchievements && outcome.unlockedAchievements.length > 0) {
      outcome.unlockedAchievements.forEach(ach => {
        this.showToast(`Achievement Unlocked: ${ach.name}!`, 'gold');
        window.portalAudio?.playAchievement();
      });
    }

    this.updateUserDisplay();
    this.renderDashboard();
  }

  // ==========================================================================
  // GAME A: CHESS BOARD RENDERING & INTERACTION
  // ==========================================================================

  renderChessBoard() {
    const mount = document.getElementById('active-game-board-mount');
    if (!mount || !this.activeEngine) return;

    mount.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'chess-wrapper';

    const boardEl = document.createElement('div');
    boardEl.className = 'chess-board';

    const unicodePieces = {
      w: { k: '♔', q: '♕', r: '♖', b: '♗', n: '♘', p: '♙' },
      b: { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' }
    };

    const status = this.activeEngine.getGameStatus();
    const inCheck = status.check;

    // Check King Position
    let kingInCheckPos = null;
    if (inCheck) {
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const p = this.activeEngine.board[r][c];
          if (p && p.type === 'k' && p.color === this.activeEngine.turn) {
            kingInCheckPos = { r, c };
          }
        }
      }
    }

    // 8x8 squares (supports board flipping)
    const rowIndices = this.isBoardFlipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];
    const colIndices = this.isBoardFlipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];

    for (const r of rowIndices) {
      for (const c of colIndices) {
        const sq = document.createElement('div');
        const isLight = (r + c) % 2 === 0;
        sq.className = `chess-square ${isLight ? 'light' : 'dark'}`;
        sq.dataset.r = r;
        sq.dataset.c = c;

        // Highlight selected square
        if (this.selectedSquare && this.selectedSquare.r === r && this.selectedSquare.c === c) {
          sq.classList.add('selected');
        }

        // Highlight King in check
        if (kingInCheckPos && kingInCheckPos.r === r && kingInCheckPos.c === c) {
          sq.classList.add('in-check');
        }

        // Highlight valid target moves
        const validMove = this.legalMovesForSelected.find(m => m.to.r === r && m.to.c === c);
        if (validMove) {
          if (validMove.isCapture) {
            sq.classList.add('valid-capture');
          } else {
            sq.classList.add('valid-target');
          }
        }

        // Piece
        const piece = this.activeEngine.getPiece(r, c);
        if (piece) {
          const pieceSpan = document.createElement('span');
          pieceSpan.className = `chess-piece ${piece.color === 'w' ? 'white-piece' : 'black-piece'}`;
          pieceSpan.textContent = unicodePieces[piece.color][piece.type];
          sq.appendChild(pieceSpan);
        }

        // Click Handler
        sq.addEventListener('click', () => this.handleChessSquareClick(r, c));

        boardEl.appendChild(sq);
      }
    }

    wrapper.appendChild(boardEl);
    mount.appendChild(wrapper);

    // Update Turn Indicator & Status
    const turn = this.activeEngine.turn;
    this.activeClockSide = turn;
    const userCard = document.getElementById('player-user-card');
    const oppCard = document.getElementById('player-opponent-card');

    if (turn === 'w') {
      userCard?.classList.add('active-turn');
      oppCard?.classList.remove('active-turn');
      document.getElementById('game-status-message').textContent = "White's Turn";
    } else {
      oppCard?.classList.add('active-turn');
      userCard?.classList.remove('active-turn');
      document.getElementById('game-status-message').textContent = "Black's Turn";
    }

    if (inCheck) {
      document.getElementById('game-substatus-message').textContent = '⚠️ Check! Defend your King.';
    } else {
      document.getElementById('game-substatus-message').textContent = 'Select a piece to move.';
    }

    // Update Match Stats Widget for Chess
    const widget = document.getElementById('game-widget-content');
    if (widget) {
      let whiteCount = 0;
      let blackCount = 0;
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const p = this.activeEngine.board[r][c];
          if (p) {
            if (p.color === 'w') whiteCount++;
            else blackCount++;
          }
        }
      }
      widget.innerHTML = `
        <div style="display: flex; justify-content: space-around; font-size: 0.95rem; font-weight: 700;">
          <span style="color: #cbd5e1;">⚪ White: ${whiteCount} pcs</span>
          <span style="color: var(--accent-gold);">⚖️ Material: ${whiteCount === blackCount ? 'Even' : (whiteCount > blackCount ? '+' + (whiteCount - blackCount) + ' W' : '+' + (blackCount - whiteCount) + ' B')}</span>
          <span style="color: #94a3b8;">⚫ Black: ${blackCount} pcs</span>
        </div>
      `;
    }
  }

  async handleChessSquareClick(r, c) {
    // If not player's turn in AI mode, block
    if (this.gameMode === 'ai' && this.activeEngine.turn !== 'w') return;

    const clickedPiece = this.activeEngine.getPiece(r, c);

    // If clicking on existing selected piece or friendly piece
    if (clickedPiece && clickedPiece.color === this.activeEngine.turn) {
      this.selectedSquare = { r, c };
      this.legalMovesForSelected = this.activeEngine.getLegalMovesForSquare(r, c);
      this.renderChessBoard();
      window.portalAudio?.playClick();
      return;
    }

    // If moving selected piece to target square
    if (this.selectedSquare) {
      const move = this.legalMovesForSelected.find(m => m.to.r === r && m.to.c === c);
      if (move) {
        // Check for pawn promotion
        if (move.promotion) {
          this.pendingPromotionMove = move;
          document.getElementById('promotion-modal').classList.add('active');
          return;
        }

        this.executeChessMove(move);
        return;
      }
    }

    // Clicked outside or empty: deselect
    this.selectedSquare = null;
    this.legalMovesForSelected = [];
    this.renderChessBoard();
  }

  resolveChessPromotion(pieceType) {
    document.getElementById('promotion-modal').classList.remove('active');
    if (this.pendingPromotionMove) {
      this.pendingPromotionMove.promotion = pieceType;
      this.executeChessMove(this.pendingPromotionMove);
      this.pendingPromotionMove = null;
    }
  }

  async executeChessMove(move) {
    const movingPiece = this.activeEngine.getPiece(move.from.r, move.from.c);
    const san = this.activeEngine.moveToSAN(move, movingPiece);

    this.activeEngine.makeMove(move);
    this.selectedSquare = null;
    this.legalMovesForSelected = [];

    // Audio Cue
    if (move.isCapture) {
      window.portalAudio?.playCapture();
    } else {
      window.portalAudio?.playMove();
    }

    // Notation table update
    this.appendChessNotation(san);

    // Render updated board
    this.renderChessBoard();

    // Check game ending condition
    const status = this.activeEngine.getGameStatus();
    if (status.over) {
      if (status.result === 'w_win') {
        this.concludeMatch('win', status.reason);
      } else if (status.result === 'b_win') {
        this.concludeMatch(this.gameMode === 'ai' ? 'loss' : 'win', status.reason);
      } else {
        this.concludeMatch('draw', status.reason);
      }
      return;
    }

    if (status.check) {
      window.portalAudio?.playCheck();
    }

    // Trigger AI Move if single player mode
    if (this.gameMode === 'ai' && this.activeEngine.turn === 'b') {
      document.getElementById('game-status-message').textContent = 'Computer is thinking...';
      const aiMove = await window.portalAI.getChessAIMove(this.activeEngine, this.difficulty, 'b');
      if (aiMove) {
        const aiPiece = this.activeEngine.getPiece(aiMove.from.r, aiMove.from.c);
        const aiSAN = this.activeEngine.moveToSAN(aiMove, aiPiece);
        this.activeEngine.makeMove(aiMove);

        if (aiMove.isCapture) window.portalAudio?.playCapture();
        else window.portalAudio?.playMove();

        this.appendChessNotation(aiSAN);
        this.renderChessBoard();

        const postAIStatus = this.activeEngine.getGameStatus();
        if (postAIStatus.over) {
          if (postAIStatus.result === 'b_win') {
            this.concludeMatch('loss', postAIStatus.reason);
          } else if (postAIStatus.result === 'w_win') {
            this.concludeMatch('win', postAIStatus.reason);
          } else {
            this.concludeMatch('draw', postAIStatus.reason);
          }
        } else if (postAIStatus.check) {
          window.portalAudio?.playCheck();
        }
      }
    }
  }

  appendChessNotation(san) {
    const tbody = document.getElementById('move-history-tbody');
    if (!tbody) return;

    // Remove placeholder row if present
    const placeholder = tbody.querySelector('.placeholder-row');
    if (placeholder) placeholder.remove();

    const fullmoves = this.activeEngine.fullmoveNumber;
    const isWhiteTurnJustEnded = this.activeEngine.turn === 'b';

    if (isWhiteTurnJustEnded) {
      const tr = document.createElement('tr');
      tr.id = `move-row-${fullmoves}`;
      tr.innerHTML = `<td>${fullmoves}.</td><td id="m-w-${fullmoves}">${san}</td><td id="m-b-${fullmoves}">-</td>`;
      tbody.appendChild(tr);
    } else {
      const cell = document.getElementById(`m-b-${fullmoves - 1}`);
      if (cell) cell.textContent = san;
    }

    document.getElementById('move-count-indicator').textContent = `${this.activeEngine.history.length} Plies`;
    const box = document.getElementById('game-move-history-box');
    if (box) box.scrollTop = box.scrollHeight;
  }

  // ==========================================================================
  // GAME B: TIC-TAC-TOE
  // ==========================================================================

  renderTicTacToeBoard() {
    const mount = document.getElementById('active-game-board-mount');
    if (!mount || !this.activeEngine) return;

    mount.innerHTML = '';
    const container = document.createElement('div');
    container.className = 'ttt-container';

    const board = document.createElement('div');
    board.className = 'ttt-board';

    for (let i = 0; i < 9; i++) {
      const cell = document.createElement('div');
      cell.className = 'ttt-cell';
      cell.dataset.index = i;

      const val = this.activeEngine.board[i];
      if (val === 'X') {
        cell.textContent = '✕';
        cell.classList.add('x-mark');
      } else if (val === 'O') {
        cell.textContent = '○';
        cell.classList.add('o-mark');
      }

      if (this.activeEngine.winningLine && this.activeEngine.winningLine.includes(i)) {
        cell.classList.add('winning-cell');
      }

      cell.addEventListener('click', () => this.handleTicTacToeCellClick(i));
      board.appendChild(cell);
    }

    container.appendChild(board);
    mount.appendChild(container);

    // Status & Widget
    document.getElementById('game-status-message').textContent = 
      this.activeEngine.winner ? `Game Over: ${this.activeEngine.winner}` : `Turn: Player ${this.activeEngine.turn}`;

    const widget = document.getElementById('game-widget-content');
    if (widget) {
      const xCount = this.activeEngine.board.filter(c => c === 'X').length;
      const oCount = this.activeEngine.board.filter(c => c === 'O').length;
      const openCount = 9 - (xCount + oCount);
      widget.innerHTML = `
        <div style="display: flex; justify-content: space-around; font-size: 0.95rem; font-weight: 700;">
          <span style="color: var(--accent-blue);">✕ (X): ${xCount}</span>
          <span style="color: var(--accent-gold);">Open: ${openCount}</span>
          <span style="color: #ef4444;">○ (O): ${oCount}</span>
        </div>
      `;
    }
  }

  async handleTicTacToeCellClick(index) {
    if (this.gameMode === 'ai' && this.activeEngine.turn !== 'X') return;
    if (this.activeEngine.winner !== null) return;

    const res = this.activeEngine.makeMove(index);
    if (!res.success) return;

    window.portalAudio?.playMove();
    this.renderTicTacToeBoard();

    if (res.isOver) {
      if (res.winner === 'X') this.concludeMatch('win', 'Tic-Tac-Toe Victory!');
      else if (res.winner === 'O') this.concludeMatch(this.gameMode === 'ai' ? 'loss' : 'win', 'Tic-Tac-Toe Defeat');
      else this.concludeMatch('draw', 'Tic-Tac-Toe Draw');
      return;
    }

    // AI Turn
    if (this.gameMode === 'ai' && this.activeEngine.turn === 'O') {
      await new Promise(r => setTimeout(r, 200));
      const aiMove = this.activeEngine.getAIMove(this.difficulty, 'O');
      if (aiMove !== null) {
        const aiRes = this.activeEngine.makeMove(aiMove);
        window.portalAudio?.playMove();
        this.renderTicTacToeBoard();

        if (aiRes.isOver) {
          if (aiRes.winner === 'O') this.concludeMatch('loss', 'AI achieved three-in-a-row.');
          else if (aiRes.winner === 'draw') this.concludeMatch('draw', 'Scratch game / Draw.');
        }
      }
    }
  }

  // ==========================================================================
  // GAME C: CONNECT FOUR
  // ==========================================================================

  renderConnect4Board() {
    const mount = document.getElementById('active-game-board-mount');
    if (!mount || !this.activeEngine) return;

    mount.innerHTML = '';
    const container = document.createElement('div');
    container.className = 'c4-container';

    const boardEl = document.createElement('div');
    boardEl.className = 'c4-board';

    for (let c = 0; c < 7; c++) {
      const colBtn = document.createElement('div');
      colBtn.className = 'c4-col-btn';
      colBtn.dataset.col = c;

      for (let r = 0; r < 6; r++) {
        const slot = document.createElement('div');
        slot.className = 'c4-slot';

        const piece = this.activeEngine.board[r][c];
        if (piece === 'red') slot.classList.add('red-disc');
        if (piece === 'yellow') slot.classList.add('yellow-disc');

        if (this.activeEngine.winningCells && this.activeEngine.winningCells.some(pt => pt.r === r && pt.c === c)) {
          slot.classList.add('winning-disc');
        }

        colBtn.appendChild(slot);
      }

      colBtn.addEventListener('click', () => this.handleConnect4ColumnClick(c));
      boardEl.appendChild(colBtn);
    }

    container.appendChild(boardEl);
    mount.appendChild(container);

    document.getElementById('game-status-message').textContent = 
      this.activeEngine.winner ? `Game Over: ${this.activeEngine.winner.toUpperCase()} Wins!` : `Turn: ${this.activeEngine.turn.toUpperCase()}`;

    const widget = document.getElementById('game-widget-content');
    if (widget) {
      let redCount = 0;
      let yellowCount = 0;
      for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 7; c++) {
          if (this.activeEngine.board[r][c] === 'red') redCount++;
          if (this.activeEngine.board[r][c] === 'yellow') yellowCount++;
        }
      }
      const openSlots = 42 - (redCount + yellowCount);
      widget.innerHTML = `
        <div style="display: flex; justify-content: space-around; font-size: 0.95rem; font-weight: 700;">
          <span style="color: #ef4444;">🔴 Red: ${redCount}</span>
          <span style="color: var(--accent-gold);">Open: ${openSlots}</span>
          <span style="color: #eab308;">🟡 Yellow: ${yellowCount}</span>
        </div>
      `;
    }
  }

  async handleConnect4ColumnClick(col) {
    if (this.gameMode === 'ai' && this.activeEngine.turn !== 'red') return;
    if (this.activeEngine.winner !== null) return;

    const res = this.activeEngine.makeMove(col);
    if (!res.success) return;

    window.portalAudio?.playMove();
    this.renderConnect4Board();

    if (res.isOver) {
      if (res.winner === 'red') this.concludeMatch('win', 'Four in a row achieved!');
      else if (res.winner === 'yellow') this.concludeMatch(this.gameMode === 'ai' ? 'loss' : 'win', 'Opponent made four in a row.');
      else this.concludeMatch('draw', 'Board full: Draw.');
      return;
    }

    // AI Turn
    if (this.gameMode === 'ai' && this.activeEngine.turn === 'yellow') {
      await new Promise(r => setTimeout(r, 220));
      const aiCol = this.activeEngine.getAIMove(this.difficulty, 'yellow');
      if (aiCol !== null) {
        const aiRes = this.activeEngine.makeMove(aiCol);
        window.portalAudio?.playMove();
        this.renderConnect4Board();

        if (aiRes.isOver) {
          if (aiRes.winner === 'yellow') this.concludeMatch('loss', 'Computer connected four.');
          else if (aiRes.winner === 'draw') this.concludeMatch('draw', 'Draw game.');
        }
      }
    }
  }

  // ==========================================================================
  // GAME D: REVERSI / OTHELLO
  // ==========================================================================

  renderReversiBoard() {
    const mount = document.getElementById('active-game-board-mount');
    if (!mount || !this.activeEngine) return;

    mount.innerHTML = '';
    const container = document.createElement('div');
    container.className = 'reversi-container';

    const boardEl = document.createElement('div');
    boardEl.className = 'reversi-board';

    const legalMoves = this.activeEngine.getLegalMoves();
    const scores = this.activeEngine.getScores();

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const cell = document.createElement('div');
        cell.className = 'reversi-cell';
        cell.dataset.r = r;
        cell.dataset.c = c;

        const disc = this.activeEngine.board[r][c];
        if (disc) {
          const discDiv = document.createElement('div');
          discDiv.className = `reversi-disc ${disc}`;
          cell.appendChild(discDiv);
        } else if (legalMoves.some(m => m.r === r && m.c === c)) {
          cell.classList.add('valid-move');
        }

        cell.addEventListener('click', () => this.handleReversiCellClick(r, c));
        boardEl.appendChild(cell);
      }
    }

    container.appendChild(boardEl);
    mount.appendChild(container);

    // Update Widget Scores
    const widget = document.getElementById('game-widget-content');
    if (widget) {
      widget.innerHTML = `
        <div style="display: flex; justify-content: space-around; font-size: 1rem; font-weight: 700;">
          <span style="color: #cbd5e1;">⚫ Black: ${scores.black}</span>
          <span style="color: #ffffff;">⚪ White: ${scores.white}</span>
        </div>
      `;
    }

    document.getElementById('game-status-message').textContent = 
      this.activeEngine.winner ? `Game Over: ${this.activeEngine.winner.toUpperCase()} Wins!` : `Turn: ${this.activeEngine.turn.toUpperCase()}`;
  }

  async handleReversiCellClick(r, c) {
    if (this.gameMode === 'ai' && this.activeEngine.turn !== 'black') return;
    if (this.activeEngine.winner !== null) return;

    const res = this.activeEngine.makeMove(r, c);
    if (!res.success) return;

    window.portalAudio?.playFlip();
    this.renderReversiBoard();

    if (res.passed) {
      this.showToast('Opponent has no legal moves. Turn passed!', 'info');
    }

    if (res.isOver) {
      const finalScores = this.activeEngine.getScores();
      if (res.winner === 'black') this.concludeMatch('win', 'Reversi Victory by disc superiority!', { discs: finalScores.black });
      else if (res.winner === 'white') this.concludeMatch(this.gameMode === 'ai' ? 'loss' : 'win', 'Opponent holds majority of discs.', { discs: finalScores.white });
      else this.concludeMatch('draw', 'Perfect disc tie!', { discs: finalScores.black });
      return;
    }

    // AI Turn (White)
    if (this.gameMode === 'ai' && this.activeEngine.turn === 'white') {
      await new Promise(r => setTimeout(r, 250));
      const aiMove = this.activeEngine.getAIMove(this.difficulty, 'white');
      if (aiMove) {
        const aiRes = this.activeEngine.makeMove(aiMove.r, aiMove.c);
        window.portalAudio?.playFlip();
        this.renderReversiBoard();

        if (aiRes.passed) {
          this.showToast('You had no legal moves. Turn returned to AI!', 'info');
        }

        if (aiRes.isOver) {
          const finalScores = this.activeEngine.getScores();
          if (aiRes.winner === 'white') this.concludeMatch('loss', 'Computer secured majority of board.', { discs: finalScores.white });
          else if (aiRes.winner === 'black') this.concludeMatch('win', 'Victory over Master AI!', { discs: finalScores.black });
          else this.concludeMatch('draw', 'Match concluded in tie.', { discs: finalScores.black });
        }
      }
    }
  }

  // ==========================================================================
  // GAME E: MINESWEEPER
  // ==========================================================================

  renderMinesweeperBoard() {
    const mount = document.getElementById('active-game-board-mount');
    if (!mount || !this.activeEngine) return;

    mount.innerHTML = '';
    const container = document.createElement('div');
    container.className = 'ms-container';

    const shell = document.createElement('div');
    shell.className = 'ms-shell';

    // Top control bar
    const topBar = document.createElement('div');
    topBar.className = 'ms-top-bar';

    const minesLeft = String(this.activeEngine.getRemainingMines()).padStart(3, '0');
    const timerVal = String(this.activeEngine.elapsedSeconds || 0).padStart(3, '0');

    topBar.innerHTML = `
      <div class="ms-counter" id="ms-mines-count">${minesLeft}</div>
      <button class="ms-face-btn" id="ms-reset-face-btn">${this.activeEngine.gameOver ? (this.activeEngine.gameWon ? '😎' : '😵') : '🙂'}</button>
      <div class="ms-counter" id="ms-timer-val">${timerVal}</div>
    `;

    topBar.querySelector('#ms-reset-face-btn').addEventListener('click', () => {
      this.launchGame('minesweeper', true);
    });

    shell.appendChild(topBar);

    // Grid board
    const grid = document.createElement('div');
    grid.className = 'ms-grid-board';
    grid.style.gridTemplateColumns = `repeat(${this.activeEngine.cols}, 32px)`;
    grid.style.gridTemplateRows = `repeat(${this.activeEngine.rows}, 32px)`;

    for (let r = 0; r < this.activeEngine.rows; r++) {
      for (let c = 0; c < this.activeEngine.cols; c++) {
        const cellData = this.activeEngine.board[r][c];
        const cellEl = document.createElement('div');
        cellEl.className = 'ms-cell';
        cellEl.dataset.r = r;
        cellEl.dataset.c = c;

        if (cellData.isRevealed) {
          cellEl.classList.add('revealed');
          if (cellData.isMine) {
            cellEl.classList.add('mine');
            cellEl.textContent = '💣';
          } else if (cellData.neighborCount > 0) {
            cellEl.dataset.count = cellData.neighborCount;
            cellEl.textContent = cellData.neighborCount;
          }
        } else if (cellData.isFlagged) {
          cellEl.textContent = '🚩';
        }

        // Left Click
        cellEl.addEventListener('click', () => this.handleMinesweeperClick(r, c));

        // Right Click (Flagging)
        cellEl.addEventListener('contextmenu', (e) => {
          e.preventDefault();
          this.handleMinesweeperRightClick(r, c);
        });

        grid.appendChild(cellEl);
      }
    }

    shell.appendChild(grid);
    container.appendChild(shell);
    mount.appendChild(container);

    document.getElementById('game-status-message').textContent = 
      this.activeEngine.gameOver 
        ? (this.activeEngine.gameWon ? 'Cleared! Field secured.' : 'Detonation! Mine tripped.')
        : 'Carefully uncover safe sectors.';
  }

  handleMinesweeperClick(r, c) {
    if (this.activeEngine.gameOver) return;

    const res = this.activeEngine.revealCell(r, c);
    if (!res.success) return;

    if (res.isMine) {
      window.portalAudio?.playExplosion();
      this.renderMinesweeperBoard();
      this.concludeMatch('loss', 'Detonated hidden mine.');
      return;
    }

    window.portalAudio?.playClick();
    this.renderMinesweeperBoard();

    if (res.gameWon) {
      window.portalAudio?.playVictory();
      this.concludeMatch('win', 'All hazard zones cleared successfully!');
    }
  }

  handleMinesweeperRightClick(r, c) {
    const res = this.activeEngine.toggleFlag(r, c);
    if (res.success) {
      window.portalAudio?.playFlag();
      this.renderMinesweeperBoard();
    }
  }

  // ==========================================================================
  // GAME F: MEMORY MATCH
  // ==========================================================================

  renderMemoryBoard() {
    const mount = document.getElementById('active-game-board-mount');
    if (!mount || !this.activeEngine) return;

    mount.innerHTML = '';
    const container = document.createElement('div');
    container.className = 'memory-container';

    const grid = document.createElement('div');
    grid.className = `memory-grid ${this.activeEngine.gridClass}`;

    this.activeEngine.cards.forEach((card, idx) => {
      const cardEl = document.createElement('div');
      cardEl.className = `memory-card ${card.flipped ? 'flipped' : ''} ${card.matched ? 'matched' : ''}`;
      cardEl.dataset.index = idx;

      cardEl.innerHTML = `
        <div class="memory-card-inner">
          <div class="memory-card-front">?</div>
          <div class="memory-card-back">${card.icon}</div>
        </div>
      `;

      cardEl.addEventListener('click', () => this.handleMemoryCardClick(idx));
      grid.appendChild(cardEl);
    });

    container.appendChild(grid);
    mount.appendChild(container);

    // Update Widget
    const widget = document.getElementById('game-widget-content');
    if (widget) {
      widget.innerHTML = `
        <div style="display: flex; justify-content: space-around; font-size: 0.95rem; font-weight: 700;">
          <span>Moves: ${this.activeEngine.moves}</span>
          <span>Matched: ${this.activeEngine.matchedPairs} / ${this.activeEngine.totalPairs}</span>
        </div>
      `;
    }

    document.getElementById('game-status-message').textContent = 
      this.activeEngine.gameWon ? 'All Relics Harmonized!' : 'Flip cards to discover identical relics.';
  }

  async handleMemoryCardClick(idx) {
    const res = this.activeEngine.flipCard(idx);
    if (!res.success) return;

    window.portalAudio?.playFlip();
    this.renderMemoryBoard();

    if (res.action === 'match') {
      window.portalAudio?.playMatch();
      this.renderMemoryBoard();

      if (res.gameWon) {
        this.concludeMatch('win', `Memory Match cleared in ${res.moves} turns!`);
      }
    } else if (res.action === 'mismatch') {
      // Delay before flipping back
      setTimeout(() => {
        this.activeEngine.unflipMismatched();
        this.renderMemoryBoard();
      }, 900);
    }
  }

  // ==========================================================================
  // GAME G: 2048 NUMBER MERGE PUZZLE
  // ==========================================================================

  render2048Board() {
    const mount = document.getElementById('active-game-board-mount');
    if (!mount || !this.activeEngine) return;

    mount.innerHTML = '';
    const container = document.createElement('div');
    container.className = 'g2048-container';

    // Header scores
    const header = document.createElement('div');
    header.className = 'g2048-header';
    header.innerHTML = `
      <div style="font-weight: 700; font-size: 1.1rem; color: var(--accent-gold);">2048</div>
      <div class="g2048-scores">
        <div class="g2048-score-box">
          <div class="g2048-score-lbl">Score</div>
          <div class="g2048-score-val" id="g2048-score">${this.activeEngine.score}</div>
        </div>
        <div class="g2048-score-box">
          <div class="g2048-score-lbl">Best</div>
          <div class="g2048-score-val">${this.activeEngine.bestScore}</div>
        </div>
      </div>
    `;
    container.appendChild(header);

    // Grid
    const grid = document.createElement('div');
    grid.className = 'g2048-grid';

    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const val = this.activeEngine.grid[r][c];
        const cell = document.createElement('div');
        cell.className = `g2048-cell ${val > 0 ? `tile-${val}` : ''}`;
        cell.textContent = val > 0 ? val : '';
        grid.appendChild(cell);
      }
    }
    container.appendChild(grid);

    // On-screen arrows
    const controls = document.createElement('div');
    controls.className = 'g2048-controls';
    controls.innerHTML = `
      <div></div>
      <button class="g2048-arrow-btn" id="btn-2048-up" title="Up">▲</button>
      <div></div>
      <button class="g2048-arrow-btn" id="btn-2048-left" title="Left">◀</button>
      <button class="g2048-arrow-btn" id="btn-2048-down" title="Down">▼</button>
      <button class="g2048-arrow-btn" id="btn-2048-right" title="Right">▶</button>
    `;
    container.appendChild(controls);
    mount.appendChild(container);

    // Attach button listeners
    document.getElementById('btn-2048-up')?.addEventListener('click', () => this.handle2048Move(0));
    document.getElementById('btn-2048-right')?.addEventListener('click', () => this.handle2048Move(1));
    document.getElementById('btn-2048-down')?.addEventListener('click', () => this.handle2048Move(2));
    document.getElementById('btn-2048-left')?.addEventListener('click', () => this.handle2048Move(3));

    // Global Key Listener for 2048
    if (!this.bound2048Key) {
      this.bound2048Key = (e) => {
        if (this.activeGameId !== 'game_2048' || this.currentView !== 'game') return;
        if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') { e.preventDefault(); this.handle2048Move(0); }
        if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') { e.preventDefault(); this.handle2048Move(1); }
        if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') { e.preventDefault(); this.handle2048Move(2); }
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') { e.preventDefault(); this.handle2048Move(3); }
      };
      window.addEventListener('keydown', this.bound2048Key);
    }

    // Update Widget
    const widget = document.getElementById('game-widget-content');
    if (widget) {
      widget.innerHTML = `
        <div style="display: flex; justify-content: space-around; font-size: 0.95rem; font-weight: 700;">
          <span>Current Score: ${this.activeEngine.score}</span>
          <span style="color: var(--accent-gold);">Best: ${this.activeEngine.bestScore}</span>
        </div>
      `;
    }

    document.getElementById('game-status-message').textContent = 
      this.activeEngine.over ? 'No more moves possible!' : 'Slide tiles to merge matching numbers.';
  }

  handle2048Move(dir) {
    if (!this.activeEngine || this.activeGameId !== 'game_2048') return;
    const res = this.activeEngine.move(dir);
    if (!res.moved) return;

    window.portalAudio?.playMove();
    this.render2048Board();

    if (res.won) {
      this.concludeMatch('win', 'Congratulations! You reached the 2048 tile!');
    } else if (res.over) {
      this.concludeMatch('loss', `Game over! Final Score: ${this.activeEngine.score}`);
    }
  }

  // ==========================================================================
  // GAME H: CYBER RETRO SNAKE
  // ==========================================================================

  renderSnakeBoard() {
    const mount = document.getElementById('active-game-board-mount');
    if (!mount || !this.activeEngine) return;

    mount.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'snake-wrapper';

    const canvas = document.createElement('canvas');
    canvas.className = 'snake-canvas';
    canvas.width = 380;
    canvas.height = 380;
    canvas.id = 'snake-canvas';
    wrapper.appendChild(canvas);

    // On-screen D-pad
    const dpad = document.createElement('div');
    dpad.className = 'dpad-container';
    dpad.innerHTML = `
      <div></div>
      <button class="dpad-btn" id="snake-dpad-up">▲</button>
      <div></div>
      <button class="dpad-btn" id="snake-dpad-left">◀</button>
      <button class="dpad-btn" id="snake-dpad-down">▼</button>
      <button class="dpad-btn" id="snake-dpad-right">▶</button>
    `;
    wrapper.appendChild(dpad);
    mount.appendChild(wrapper);

    // D-pad clicks
    document.getElementById('snake-dpad-up')?.addEventListener('click', () => this.activeEngine?.setDirection({ x: 0, y: -1 }));
    document.getElementById('snake-dpad-right')?.addEventListener('click', () => this.activeEngine?.setDirection({ x: 1, y: 0 }));
    document.getElementById('snake-dpad-down')?.addEventListener('click', () => this.activeEngine?.setDirection({ x: 0, y: 1 }));
    document.getElementById('snake-dpad-left')?.addEventListener('click', () => this.activeEngine?.setDirection({ x: -1, y: 0 }));

    // Global Key Listener for Snake
    if (!this.boundSnakeKey) {
      this.boundSnakeKey = (e) => {
        if (this.activeGameId !== 'snake' || this.currentView !== 'game') return;
        if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') { e.preventDefault(); this.activeEngine?.setDirection({ x: 0, y: -1 }); }
        if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') { e.preventDefault(); this.activeEngine?.setDirection({ x: 1, y: 0 }); }
        if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') { e.preventDefault(); this.activeEngine?.setDirection({ x: 0, y: 1 }); }
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') { e.preventDefault(); this.activeEngine?.setDirection({ x: -1, y: 0 }); }
      };
      window.addEventListener('keydown', this.boundSnakeKey);
    }

    this.startSnakeLoop();
  }

  startSnakeLoop() {
    if (this.snakeInterval) clearInterval(this.snakeInterval);

    const drawSnake = () => {
      const canvas = document.getElementById('snake-canvas');
      if (!canvas || !this.activeEngine) return;
      const ctx = canvas.getContext('2d');
      const cellSize = canvas.width / this.activeEngine.cols;

      // Clear background
      ctx.fillStyle = '#080b12';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      for (let x = 0; x <= canvas.width; x += cellSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = 0; y <= canvas.height; y += cellSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }

      // Draw Normal Food
      if (this.activeEngine.food) {
        ctx.fillStyle = '#10b981';
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(
          (this.activeEngine.food.x + 0.5) * cellSize,
          (this.activeEngine.food.y + 0.5) * cellSize,
          cellSize * 0.38,
          0, Math.PI * 2
        );
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Draw Golden Bonus Food
      if (this.activeEngine.goldenFood) {
        ctx.fillStyle = '#f59e0b';
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(
          (this.activeEngine.goldenFood.x + 0.5) * cellSize,
          (this.activeEngine.goldenFood.y + 0.5) * cellSize,
          cellSize * 0.45,
          0, Math.PI * 2
        );
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Draw Snake
      this.activeEngine.snake.forEach((seg, idx) => {
        if (idx === 0) {
          // Head
          ctx.fillStyle = '#00d2ff';
          ctx.shadowColor = '#00d2ff';
          ctx.shadowBlur = 12;
        } else {
          ctx.fillStyle = '#0284c7';
          ctx.shadowBlur = 0;
        }
        ctx.beginPath();
        ctx.roundRect(seg.x * cellSize + 1, seg.y * cellSize + 1, cellSize - 2, cellSize - 2, 4);
        ctx.fill();
        ctx.shadowBlur = 0;
      });
    };

    drawSnake();

    this.snakeInterval = setInterval(() => {
      if (!this.activeEngine || this.activeGameId !== 'snake' || this.currentView !== 'game') {
        clearInterval(this.snakeInterval);
        return;
      }

      const res = this.activeEngine.step();
      if (!res.active) return;

      if (res.ateFood) {
        window.portalAudio?.playClick?.();
      }
      if (res.ateGolden) {
        window.portalAudio?.playAchievement?.();
      }

      drawSnake();

      // Update match stats
      const widget = document.getElementById('game-widget-content');
      if (widget) {
        widget.innerHTML = `
          <div style="display: flex; justify-content: space-around; font-size: 0.95rem; font-weight: 700;">
            <span>Score: ${this.activeEngine.score}</span>
            <span style="color: var(--accent-gold);">Best: ${this.activeEngine.bestScore}</span>
            <span>Speed: ${Math.round(1000 / this.activeEngine.speed)} ticks/s</span>
          </div>
        `;
      }

      if (res.over) {
        clearInterval(this.snakeInterval);
        window.portalAudio?.playExplosion?.();
        this.concludeMatch('loss', res.reason || 'Collision tripped.');
      }
    }, this.activeEngine.speed);
  }

  // ==========================================================================
  // GAME I: CLASSICAL CHECKERS (DRAUGHTS)
  // ==========================================================================

  renderCheckersBoard() {
    const mount = document.getElementById('active-game-board-mount');
    if (!mount || !this.activeEngine) return;

    mount.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'checkers-wrapper';

    const boardEl = document.createElement('div');
    boardEl.className = 'checkers-board';

    const legalMoves = this.activeEngine.getAllLegalMoves(this.activeEngine.turn);
    const validDestinations = (this.selectedCheckersPiece) 
      ? this.activeEngine.getLegalMovesForPiece(this.selectedCheckersPiece.r, this.selectedCheckersPiece.c)
      : [];

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const cell = document.createElement('div');
        const isDark = (r + c) % 2 === 1;
        cell.className = `checkers-cell ${isDark ? 'dark' : 'light'}`;
        cell.dataset.r = r;
        cell.dataset.c = c;

        if (this.selectedCheckersPiece && this.selectedCheckersPiece.r === r && this.selectedCheckersPiece.c === c) {
          cell.classList.add('selected');
        }

        if (validDestinations.some(m => m.to.r === r && m.to.c === c)) {
          cell.classList.add('valid-move');
        }

        const piece = this.activeEngine.board[r][c];
        if (piece) {
          const disc = document.createElement('div');
          disc.className = `checker-disc ${piece.color === 'r' ? 'red' : 'black'} ${piece.isKing ? 'is-king' : ''}`;
          cell.appendChild(disc);
        }

        cell.addEventListener('click', () => this.handleCheckersCellClick(r, c));
        boardEl.appendChild(cell);
      }
    }

    wrapper.appendChild(boardEl);
    mount.appendChild(wrapper);

    // Update Widget
    let redCount = 0;
    let blackCount = 0;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = this.activeEngine.board[r][c];
        if (p) {
          if (p.color === 'r') redCount++;
          if (p.color === 'b') blackCount++;
        }
      }
    }

    const widget = document.getElementById('game-widget-content');
    if (widget) {
      widget.innerHTML = `
        <div style="display: flex; justify-content: space-around; font-size: 0.95rem; font-weight: 700;">
          <span style="color: #ef4444;">🔴 Red: ${redCount}</span>
          <span style="color: #cbd5e1;">⚫ Black: ${blackCount}</span>
        </div>
      `;
    }

    document.getElementById('game-status-message').textContent = 
      this.activeEngine.winner 
        ? `Match Ended: ${this.activeEngine.winner.toUpperCase()}`
        : `Turn: ${this.activeEngine.turn === 'r' ? 'Red (You)' : 'Black (Opponent)'}`;
  }

  async handleCheckersCellClick(r, c) {
    if (this.activeEngine.winner) return;
    if (this.gameMode === 'ai' && this.activeEngine.turn !== 'r') return;

    const piece = this.activeEngine.board[r][c];

    // Select piece
    if (piece && piece.color === this.activeEngine.turn) {
      this.selectedCheckersPiece = { r, c };
      this.renderCheckersBoard();
      return;
    }

    // Try move to empty cell
    if (this.selectedCheckersPiece && !piece) {
      const legalMoves = this.activeEngine.getLegalMovesForPiece(this.selectedCheckersPiece.r, this.selectedCheckersPiece.c);
      const targetMove = legalMoves.find(m => m.to.r === r && m.to.c === c);

      if (targetMove) {
        const res = this.activeEngine.makeMove(targetMove);
        if (res.success) {
          window.portalAudio?.playMove?.();
          if (targetMove.isJump) window.portalAudio?.playCapture?.();
          if (res.promoted) window.portalAudio?.playAchievement?.();

          if (res.mustContinueJump) {
            this.selectedCheckersPiece = { r, c };
            this.showToast('Multi-jump capture available!', 'info');
          } else {
            this.selectedCheckersPiece = null;
          }

          this.renderCheckersBoard();

          if (res.isOver) {
            if (res.winner === 'r') this.concludeMatch('win', res.reason || 'Checkers Victory!');
            else if (res.winner === 'b') this.concludeMatch(this.gameMode === 'ai' ? 'loss' : 'win', res.reason || 'Checkers Defeat');
            else this.concludeMatch('draw', res.reason || 'Checkers Draw');
            return;
          }

          // AI Move
          if (this.gameMode === 'ai' && this.activeEngine.turn === 'b') {
            await new Promise(resolve => setTimeout(resolve, 300));
            this.executeCheckersAIMove();
          }
        }
      }
    }
  }

  async executeCheckersAIMove() {
    if (this.activeEngine.turn !== 'b' || this.activeEngine.winner) return;
    const aiMove = this.activeEngine.getAIMove(this.difficulty);
    if (!aiMove) return;

    const res = this.activeEngine.makeMove(aiMove);
    window.portalAudio?.playMove?.();
    if (aiMove.isJump) window.portalAudio?.playCapture?.();
    this.renderCheckersBoard();

    if (res.mustContinueJump) {
      await new Promise(resolve => setTimeout(resolve, 250));
      this.executeCheckersAIMove();
      return;
    }

    if (res.isOver) {
      if (res.winner === 'b') this.concludeMatch('loss', res.reason || 'AI won the match.');
      else if (res.winner === 'r') this.concludeMatch('win', res.reason || 'Victory!');
      else this.concludeMatch('draw', res.reason || 'Checkers Draw');
    }
  }

  // ==========================================================================
  // GAME J: SUDOKU MASTER PUZZLE
  // ==========================================================================

  renderSudokuBoard() {
    const mount = document.getElementById('active-game-board-mount');
    if (!mount || !this.activeEngine) return;

    mount.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'sudoku-wrapper';

    const grid = document.createElement('div');
    grid.className = 'sudoku-grid';

    const sel = this.selectedSudokuCell;
    const selectedVal = (sel && this.activeEngine.board[sel.r][sel.c]) ? this.activeEngine.board[sel.r][sel.c] : null;

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const cell = document.createElement('div');
        cell.className = 'sudoku-cell';
        if (r === 2 || r === 5) cell.classList.add('sudoku-row-border');

        const val = this.activeEngine.board[r][c];
        const isInit = this.activeEngine.initial[r][c];

        if (isInit) cell.classList.add('initial');
        else if (val > 0) cell.classList.add('user-val');

        if (sel && sel.r === r && sel.c === c) {
          cell.classList.add('selected');
        } else if (selectedVal && val === selectedVal) {
          cell.classList.add('highlight-same');
        }

        if (val > 0) {
          cell.textContent = val;
        } else {
          // Render Notes if any
          const notesSet = this.activeEngine.notes[r][c];
          if (notesSet && notesSet.size > 0) {
            const notesGrid = document.createElement('div');
            notesGrid.className = 'sudoku-notes';
            for (let n = 1; n <= 9; n++) {
              const noteSpan = document.createElement('span');
              noteSpan.textContent = notesSet.has(n) ? n : '';
              notesGrid.appendChild(noteSpan);
            }
            cell.appendChild(notesGrid);
          }
        }

        cell.addEventListener('click', () => {
          this.selectedSudokuCell = { r, c };
          this.renderSudokuBoard();
        });

        grid.appendChild(cell);
      }
    }
    wrapper.appendChild(grid);

    // Numpad & Controls
    const numpad = document.createElement('div');
    numpad.className = 'sudoku-numpad';
    for (let num = 1; num <= 9; num++) {
      const btn = document.createElement('button');
      btn.className = 'sudoku-btn';
      btn.textContent = num;
      btn.addEventListener('click', () => this.handleSudokuInput(num));
      numpad.appendChild(btn);
    }

    const eraseBtn = document.createElement('button');
    eraseBtn.className = 'sudoku-btn';
    eraseBtn.textContent = '⌫';
    eraseBtn.title = 'Erase Cell';
    eraseBtn.addEventListener('click', () => this.handleSudokuErase());
    numpad.appendChild(eraseBtn);

    const hintBtn = document.createElement('button');
    hintBtn.className = 'sudoku-btn';
    hintBtn.textContent = '💡 Hint';
    hintBtn.title = 'Get Hint';
    hintBtn.style.gridColumn = 'span 2';
    hintBtn.addEventListener('click', () => this.handleSudokuHint());
    numpad.appendChild(hintBtn);

    const noteToggleBtn = document.createElement('button');
    noteToggleBtn.className = `sudoku-btn ${this.sudokuNoteMode ? 'active-tool' : ''}`;
    noteToggleBtn.textContent = '✏️ Notes';
    noteToggleBtn.style.gridColumn = 'span 3';
    noteToggleBtn.addEventListener('click', () => {
      this.sudokuNoteMode = !this.sudokuNoteMode;
      this.renderSudokuBoard();
    });
    numpad.appendChild(noteToggleBtn);

    wrapper.appendChild(numpad);
    mount.appendChild(wrapper);

    // Global Key Listener for Sudoku
    if (!this.boundSudokuKey) {
      this.boundSudokuKey = (e) => {
        if (this.activeGameId !== 'sudoku' || this.currentView !== 'game') return;
        const num = parseInt(e.key, 10);
        if (num >= 1 && num <= 9) {
          this.handleSudokuInput(num);
        } else if (e.key === 'Backspace' || e.key === 'Delete') {
          this.handleSudokuErase();
        }
      };
      window.addEventListener('keydown', this.boundSudokuKey);
    }

    // Update Widget
    const widget = document.getElementById('game-widget-content');
    if (widget) {
      widget.innerHTML = `
        <div style="display: flex; justify-content: space-around; font-size: 0.95rem; font-weight: 700;">
          <span style="color: ${this.activeEngine.mistakes > 0 ? 'var(--color-error)' : 'inherit'};">Mistakes: ${this.activeEngine.mistakes} / ${this.activeEngine.maxMistakes}</span>
          <span>Difficulty: ${this.activeEngine.difficulty.toUpperCase()}</span>
        </div>
      `;
    }

    document.getElementById('game-status-message').textContent = 
      this.activeEngine.gameWon ? 'Sudoku Solved!' : 'Select a square and enter 1–9 digits.';
  }

  handleSudokuInput(num) {
    if (!this.selectedSudokuCell || !this.activeEngine || this.activeGameId !== 'sudoku') return;
    const { r, c } = this.selectedSudokuCell;

    if (this.sudokuNoteMode) {
      this.activeEngine.toggleNote(r, c, num);
      window.portalAudio?.playClick?.();
      this.renderSudokuBoard();
      return;
    }

    const res = this.activeEngine.setCellValue(r, c, num);
    if (!res.success) return;

    if (res.mistake) {
      window.portalAudio?.playDefeat?.();
      this.renderSudokuBoard();
      if (res.gameOver) {
        this.concludeMatch('loss', '3 mistakes reached! Sudoku puzzle unsolved.');
      }
    } else {
      window.portalAudio?.playMove?.();
      this.renderSudokuBoard();
      if (res.gameWon) {
        this.concludeMatch('win', 'Sudoku solved successfully with zero remaining errors!');
      }
    }
  }

  handleSudokuErase() {
    if (!this.selectedSudokuCell || !this.activeEngine) return;
    this.activeEngine.eraseCell(this.selectedSudokuCell.r, this.selectedSudokuCell.c);
    this.renderSudokuBoard();
  }

  handleSudokuHint() {
    if (!this.activeEngine) return;
    const cell = this.activeEngine.getHint(
      this.selectedSudokuCell ? this.selectedSudokuCell.r : null,
      this.selectedSudokuCell ? this.selectedSudokuCell.c : null
    );
    if (cell) {
      this.selectedSudokuCell = cell;
      window.portalAudio?.playAchievement?.();
      this.showToast('Hint revealed and locked!', 'gold');
      this.renderSudokuBoard();
      if (this.activeEngine.gameWon) {
        this.concludeMatch('win', 'Sudoku solved with tactical hints!');
      }
    }
  }

  // ==========================================================================
  // GAME K: NEON TETRIS
  // ==========================================================================

  renderTetrisBoard() {
    const mount = document.getElementById('active-game-board-mount');
    if (!mount || !this.activeEngine) return;

    mount.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'tetris-wrapper';

    // Main 10x20 Canvas
    const canvas = document.createElement('canvas');
    canvas.className = 'tetris-canvas';
    canvas.width = 200;
    canvas.height = 400;
    canvas.id = 'tetris-main-canvas';
    wrapper.appendChild(canvas);

    // Sidebar side column (Hold + Next)
    const side = document.createElement('div');
    side.className = 'tetris-side';

    // Next Piece Box
    const nextBox = document.createElement('div');
    nextBox.className = 'tetris-box';
    nextBox.innerHTML = `
      <div class="tetris-box-title">Next Piece</div>
      <canvas id="tetris-next-canvas" class="tetris-mini-canvas" width="70" height="70"></canvas>
    `;
    side.appendChild(nextBox);

    // Hold Piece Box
    const holdBox = document.createElement('div');
    holdBox.className = 'tetris-box';
    holdBox.innerHTML = `
      <div class="tetris-box-title">Hold (C)</div>
      <canvas id="tetris-hold-canvas" class="tetris-mini-canvas" width="70" height="70"></canvas>
    `;
    side.appendChild(holdBox);

    wrapper.appendChild(side);
    mount.appendChild(wrapper);

    // Global Key Listener for Tetris
    if (!this.boundTetrisKey) {
      this.boundTetrisKey = (e) => {
        if (this.activeGameId !== 'tetris' || this.currentView !== 'game') return;
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
          e.preventDefault();
          this.activeEngine?.moveLeft();
          this.drawTetris();
        } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
          e.preventDefault();
          this.activeEngine?.moveRight();
          this.drawTetris();
        } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
          e.preventDefault();
          this.activeEngine?.rotate();
          window.portalAudio?.playFlip?.();
          this.drawTetris();
        } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
          e.preventDefault();
          this.activeEngine?.stepDown();
          this.drawTetris();
        } else if (e.key === ' ' || e.code === 'Space') {
          e.preventDefault();
          this.activeEngine?.hardDrop();
          window.portalAudio?.playMove?.();
          this.drawTetris();
        } else if (e.key === 'c' || e.key === 'C') {
          e.preventDefault();
          this.activeEngine?.hold();
          this.drawTetris();
        }
      };
      window.addEventListener('keydown', this.boundTetrisKey);
    }

    this.startTetrisLoop();
  }

  drawTetris() {
    const canvas = document.getElementById('tetris-main-canvas');
    if (!canvas || !this.activeEngine) return;
    const ctx = canvas.getContext('2d');
    const cellSize = 20;

    // Background
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Grid
    for (let y = 0; y < this.activeEngine.rows; y++) {
      for (let x = 0; x < this.activeEngine.cols; x++) {
        const color = this.activeEngine.grid[y][x];
        if (color) {
          ctx.fillStyle = color;
          ctx.fillRect(x * cellSize, y * cellSize, cellSize - 1, cellSize - 1);
        }
      }
    }

    // Draw Ghost Piece
    if (this.activeEngine.currentPiece && !this.activeEngine.gameOver) {
      const ghost = this.activeEngine.getGhostPosition();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1;
      for (let r = 0; r < this.activeEngine.currentPiece.length; r++) {
        for (let c = 0; c < this.activeEngine.currentPiece[r].length; c++) {
          if (this.activeEngine.currentPiece[r][c]) {
            const gx = (ghost.x + c) * cellSize;
            const gy = (ghost.y + r) * cellSize;
            ctx.fillRect(gx, gy, cellSize - 1, cellSize - 1);
            ctx.strokeRect(gx, gy, cellSize - 1, cellSize - 1);
          }
        }
      }

      // Draw Active Piece
      ctx.fillStyle = this.activeEngine.currentColor;
      ctx.shadowColor = this.activeEngine.currentColor;
      ctx.shadowBlur = 8;
      for (let r = 0; r < this.activeEngine.currentPiece.length; r++) {
        for (let c = 0; c < this.activeEngine.currentPiece[r].length; c++) {
          if (this.activeEngine.currentPiece[r][c]) {
            const px = (this.activeEngine.currentPos.x + c) * cellSize;
            const py = (this.activeEngine.currentPos.y + r) * cellSize;
            ctx.fillRect(px, py, cellSize - 1, cellSize - 1);
          }
        }
      }
      ctx.shadowBlur = 0;
    }

    // Draw Mini Canvas: Next Piece
    const nextCanvas = document.getElementById('tetris-next-canvas');
    if (nextCanvas && this.activeEngine.nextPieceType) {
      const nCtx = nextCanvas.getContext('2d');
      nCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
      const pieceData = this.activeEngine.shapes[this.activeEngine.nextPieceType];
      const shape = pieceData.shape;
      const sSize = 14;
      const offX = (nextCanvas.width - shape[0].length * sSize) / 2;
      const offY = (nextCanvas.height - shape.length * sSize) / 2;
      nCtx.fillStyle = pieceData.color;
      for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
          if (shape[r][c]) {
            nCtx.fillRect(offX + c * sSize, offY + r * sSize, sSize - 1, sSize - 1);
          }
        }
      }
    }

    // Draw Mini Canvas: Hold Piece
    const holdCanvas = document.getElementById('tetris-hold-canvas');
    if (holdCanvas && this.activeEngine.holdPiece) {
      const hCtx = holdCanvas.getContext('2d');
      hCtx.clearRect(0, 0, holdCanvas.width, holdCanvas.height);
      const pieceData = this.activeEngine.shapes[this.activeEngine.holdPiece];
      const shape = pieceData.shape;
      const sSize = 14;
      const offX = (holdCanvas.width - shape[0].length * sSize) / 2;
      const offY = (holdCanvas.height - shape.length * sSize) / 2;
      hCtx.fillStyle = pieceData.color;
      for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
          if (shape[r][c]) {
            hCtx.fillRect(offX + c * sSize, offY + r * sSize, sSize - 1, sSize - 1);
          }
        }
      }
    }

    // Update Widget
    const widget = document.getElementById('game-widget-content');
    if (widget) {
      widget.innerHTML = `
        <div style="display: flex; justify-content: space-around; font-size: 0.95rem; font-weight: 700;">
          <span>Score: ${this.activeEngine.score}</span>
          <span>Lines: ${this.activeEngine.lines}</span>
          <span style="color: var(--accent-gold);">Level: ${this.activeEngine.level}</span>
        </div>
      `;
    }
  }

  startTetrisLoop() {
    if (this.tetrisInterval) clearInterval(this.tetrisInterval);

    this.drawTetris();

    const tick = () => {
      if (!this.activeEngine || this.activeGameId !== 'tetris' || this.currentView !== 'game') {
        clearInterval(this.tetrisInterval);
        return;
      }

      const res = this.activeEngine.stepDown();
      if (res && res.cleared > 0) {
        window.portalAudio?.playCapture?.();
      }

      this.drawTetris();

      if (this.activeEngine.gameOver) {
        clearInterval(this.tetrisInterval);
        window.portalAudio?.playDefeat?.();
        this.concludeMatch('loss', `Tetris Matrix Filled! Final Score: ${this.activeEngine.score}`);
      }
    };

    this.tetrisInterval = setInterval(tick, this.activeEngine.getDropInterval());
  }

  // ==========================================================================
  // GAME L: CYBER PONG (PADDLE VS AI)
  // ==========================================================================

  renderPongBoard() {
    const mount = document.getElementById('active-game-board-mount');
    if (!mount || !this.activeEngine) return;

    mount.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'pong-wrapper';

    const canvas = document.createElement('canvas');
    canvas.className = 'pong-canvas';
    canvas.width = 600;
    canvas.height = 400;
    canvas.id = 'pong-canvas';
    wrapper.appendChild(canvas);

    mount.appendChild(wrapper);

    // Mouse / Touch paddle tracking
    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleY = canvas.height / rect.height;
      this.pongTargetY = (e.clientY - rect.top) * scaleY;
    });

    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const scaleY = canvas.height / rect.height;
      this.pongTargetY = (touch.clientY - rect.top) * scaleY;
    }, { passive: false });

    // Arrow keys support
    if (!this.boundPongKey) {
      this.boundPongKey = (e) => {
        if (this.activeGameId !== 'pong' || this.currentView !== 'game') return;
        if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
          e.preventDefault();
          this.pongTargetY = Math.max(20, (this.pongTargetY || 200) - 30);
        } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
          e.preventDefault();
          this.pongTargetY = Math.min(380, (this.pongTargetY || 200) + 30);
        }
      };
      window.addEventListener('keydown', this.boundPongKey);
    }

    this.startPongLoop();
  }

  startPongLoop() {
    if (this.pongAnimFrame) cancelAnimationFrame(this.pongAnimFrame);

    const canvas = document.getElementById('pong-canvas');
    if (!canvas || !this.activeEngine) return;
    const ctx = canvas.getContext('2d');

    const loop = () => {
      if (!this.activeEngine || this.activeGameId !== 'pong' || this.currentView !== 'game') {
        cancelAnimationFrame(this.pongAnimFrame);
        return;
      }

      const res = this.activeEngine.update(this.pongTargetY);

      // Render Pong frame
      ctx.fillStyle = '#080d1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Center dashed net
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 3;
      ctx.setLineDash([10, 10]);
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, 0);
      ctx.lineTo(canvas.width / 2, canvas.height);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw Scores on Canvas
      ctx.font = '800 3rem Outfit, sans-serif';
      ctx.fillStyle = 'rgba(0, 210, 255, 0.4)';
      ctx.textAlign = 'right';
      ctx.fillText(this.activeEngine.playerScore, canvas.width / 2 - 30, 60);

      ctx.fillStyle = 'rgba(245, 158, 11, 0.4)';
      ctx.textAlign = 'left';
      ctx.fillText(this.activeEngine.aiScore, canvas.width / 2 + 30, 60);

      // Draw Player Paddle (Left)
      ctx.fillStyle = '#00d2ff';
      ctx.shadowColor = '#00d2ff';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.roundRect(20, this.activeEngine.playerY, this.activeEngine.paddleWidth, this.activeEngine.paddleHeight, 4);
      ctx.fill();

      // Draw AI Paddle (Right)
      ctx.fillStyle = '#f59e0b';
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.roundRect(canvas.width - 20 - this.activeEngine.paddleWidth, this.activeEngine.aiY, this.activeEngine.paddleWidth, this.activeEngine.paddleHeight, 4);
      ctx.fill();

      // Draw Ball
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(this.activeEngine.ball.x, this.activeEngine.ball.y, this.activeEngine.ball.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Draw Particles
      this.activeEngine.particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;

      // Update Widget
      const widget = document.getElementById('game-widget-content');
      if (widget) {
        widget.innerHTML = `
          <div style="display: flex; justify-content: space-around; font-size: 0.95rem; font-weight: 700;">
            <span style="color: #00d2ff;">You: ${this.activeEngine.playerScore}</span>
            <span style="color: #f59e0b;">AI: ${this.activeEngine.aiScore}</span>
            <span>Target: ${this.activeEngine.targetScore} Pts</span>
          </div>
        `;
      }

      if (res.winner) {
        if (res.winner === 'player') {
          this.concludeMatch('win', `Victory! Defeated AI in Cyber Pong ${this.activeEngine.playerScore} - ${this.activeEngine.aiScore}`);
        } else {
          this.concludeMatch('loss', `AI achieved victory ${this.activeEngine.aiScore} - ${this.activeEngine.playerScore}`);
        }
        return;
      }

      this.pongAnimFrame = requestAnimationFrame(loop);
    };

    this.pongAnimFrame = requestAnimationFrame(loop);
  }

  // ==========================================================================
  // GAME M: WORDLE TACTICAL GUESS
  // ==========================================================================

  renderWordleBoard() {
    const mount = document.getElementById('active-game-board-mount');
    if (!mount || !this.activeEngine) return;

    mount.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'wordle-wrapper';

    // 6-row Guess Grid
    const grid = document.createElement('div');
    grid.className = 'wordle-grid';

    for (let row = 0; row < 6; row++) {
      const rowDiv = document.createElement('div');
      rowDiv.className = 'wordle-row';

      const pastGuess = this.activeEngine.guesses[row];
      const evaluation = this.activeEngine.evaluations[row];

      for (let col = 0; col < 5; col++) {
        const tile = document.createElement('div');
        tile.className = 'wordle-tile';

        if (pastGuess) {
          tile.textContent = pastGuess[col];
          const status = evaluation[col];
          if (status === 'correct') tile.classList.add('tile-correct');
          else if (status === 'present') tile.classList.add('tile-present');
          else if (status === 'absent') tile.classList.add('tile-absent');
        } else if (row === this.activeEngine.guesses.length) {
          const letter = this.activeEngine.currentGuess[col] || '';
          tile.textContent = letter;
          if (letter) tile.classList.add('pop');
        }

        rowDiv.appendChild(tile);
      }
      grid.appendChild(rowDiv);
    }
    wrapper.appendChild(grid);

    // QWERTY Virtual Keyboard
    const kb = document.createElement('div');
    kb.className = 'wordle-keyboard';
    const rows = [
      ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
      ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
      ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫']
    ];

    rows.forEach(rKeys => {
      const kbRow = document.createElement('div');
      kbRow.className = 'wordle-kb-row';

      rKeys.forEach(k => {
        const keyBtn = document.createElement('button');
        keyBtn.className = 'wordle-key';
        keyBtn.textContent = k;

        if (k === 'ENTER' || k === '⌫') {
          keyBtn.classList.add('wide');
        } else {
          const status = this.activeEngine.keyStates[k];
          if (status === 'correct') keyBtn.classList.add('key-correct');
          else if (status === 'present') keyBtn.classList.add('key-present');
          else if (status === 'absent') keyBtn.classList.add('key-absent');
        }

        keyBtn.addEventListener('click', () => {
          if (k === 'ENTER') this.handleWordleSubmit();
          else if (k === '⌫') this.handleWordleBackspace();
          else this.handleWordleLetter(k);
        });

        kbRow.appendChild(keyBtn);
      });
      kb.appendChild(kbRow);
    });

    wrapper.appendChild(kb);
    mount.appendChild(wrapper);

    // Global Key Listener for Wordle
    if (!this.boundWordleKey) {
      this.boundWordleKey = (e) => {
        if (this.activeGameId !== 'wordle' || this.currentView !== 'game') return;
        if (e.key === 'Enter') {
          this.handleWordleSubmit();
        } else if (e.key === 'Backspace') {
          this.handleWordleBackspace();
        } else if (/^[a-zA-Z]$/.test(e.key)) {
          this.handleWordleLetter(e.key.toUpperCase());
        }
      };
      window.addEventListener('keydown', this.boundWordleKey);
    }

    // Update Widget
    const widget = document.getElementById('game-widget-content');
    if (widget) {
      widget.innerHTML = `
        <div style="display: flex; justify-content: space-around; font-size: 0.95rem; font-weight: 700;">
          <span>Attempt: ${this.activeEngine.guesses.length + 1} / 6</span>
          <span style="color: var(--accent-gold);">5-Letter Mystery</span>
        </div>
      `;
    }

    document.getElementById('game-status-message').textContent = 
      this.activeEngine.gameOver 
        ? (this.activeEngine.gameWon ? 'Word Cleared!' : `Secret Word: ${this.activeEngine.secretWord}`)
        : 'Type or tap letters and press ENTER to test your guess.';
  }

  handleWordleLetter(ch) {
    if (this.activeEngine.addLetter(ch)) {
      window.portalAudio?.playClick?.();
      this.renderWordleBoard();
    }
  }

  handleWordleBackspace() {
    if (this.activeEngine.removeLetter()) {
      this.renderWordleBoard();
    }
  }

  handleWordleSubmit() {
    const res = this.activeEngine.submitGuess();
    if (!res.success) {
      this.showToast(res.reason || 'Invalid attempt', 'error');
      return;
    }

    window.portalAudio?.playFlip?.();
    this.renderWordleBoard();

    if (res.isWin) {
      this.concludeMatch('win', `Wordle Master! Word correctly identified in ${this.activeEngine.guesses.length} attempts!`);
    } else if (res.isOver) {
      this.concludeMatch('loss', `Out of attempts! The secret word was: ${this.activeEngine.secretWord}`);
    }
  }

  // ==========================================================================
  // GAME N: SIMON SAYS MEMORY SEQUENCE
  // ==========================================================================

  renderSimonBoard() {
    const mount = document.getElementById('active-game-board-mount');
    if (!mount || !this.activeEngine) return;

    mount.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'simon-wrapper';

    const wheel = document.createElement('div');
    wheel.className = 'simon-wheel';

    const colors = ['emerald', 'crimson', 'amber', 'cyan'];
    colors.forEach((col, idx) => {
      const pad = document.createElement('button');
      pad.className = `simon-pad pad-${col}`;
      pad.id = `simon-pad-${idx}`;
      pad.addEventListener('click', () => this.handleSimonPadPress(idx));
      wheel.appendChild(pad);
    });

    const center = document.createElement('div');
    center.className = 'simon-center';
    center.innerHTML = `
      <div style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase;">Score</div>
      <div style="font-size: 1.4rem; font-weight: 800; color: var(--accent-gold);">${this.activeEngine.score}</div>
      <button class="btn btn-primary btn-sm" id="simon-start-btn" style="margin-top: 4px; padding: 2px 8px; font-size: 0.7rem;">${this.activeEngine.sequence.length === 0 ? 'Start' : 'Next'}</button>
    `;
    wheel.appendChild(center);
    wrapper.appendChild(wheel);
    mount.appendChild(wrapper);

    document.getElementById('simon-start-btn')?.addEventListener('click', () => {
      this.playSimonNextRound();
    });

    // Update Widget
    const widget = document.getElementById('game-widget-content');
    if (widget) {
      widget.innerHTML = `
        <div style="display: flex; justify-content: space-around; font-size: 0.95rem; font-weight: 700;">
          <span>Current Streak: ${this.activeEngine.score}</span>
          <span style="color: var(--accent-gold);">Best Streak: ${this.activeEngine.bestScore}</span>
        </div>
      `;
    }

    document.getElementById('game-status-message').textContent = 
      this.activeEngine.sequence.length === 0 ? 'Click Start to begin the memory sequence.' : 'Repeat the sequence in order!';
  }

  async playSimonNextRound() {
    if (!this.activeEngine) return;
    const { sequence } = this.activeEngine.nextRound();
    this.renderSimonBoard();

    this.activeEngine.isPlayingSequence = true;
    for (let i = 0; i < sequence.length; i++) {
      await new Promise(r => setTimeout(r, 450));
      this.flashSimonPad(sequence[i]);
    }
    this.activeEngine.isPlayingSequence = false;
  }

  flashSimonPad(idx) {
    const pad = document.getElementById(`simon-pad-${idx}`);
    if (!pad) return;
    pad.classList.add('active');
    const freq = this.activeEngine.padFrequencies[idx];
    window.portalAudio?.playTone?.(freq, 0.2);
    setTimeout(() => {
      pad.classList.remove('active');
    }, 250);
  }

  async handleSimonPadPress(idx) {
    if (!this.activeEngine || this.activeEngine.isPlayingSequence) return;
    const res = this.activeEngine.pressPad(idx);
    if (!res.valid) return;

    this.flashSimonPad(idx);

    if (res.correct) {
      if (res.roundComplete) {
        window.portalAudio?.playAchievement?.();
        this.renderSimonBoard();
        this.showToast(`Round ${res.score} Complete!`, 'gold');
        await new Promise(r => setTimeout(r, 600));
        this.playSimonNextRound();
      }
    } else {
      window.portalAudio?.playDefeat?.();
      this.renderSimonBoard();
      this.concludeMatch('loss', `Mistake! Memory streak concluded at ${res.score} steps.`);
    }
  }

  // ==========================================================================
  // GAME O: BATTLESHIP FLEET RADAR COMBAT
  // ==========================================================================

  renderBattleshipBoard() {
    const mount = document.getElementById('active-game-board-mount');
    if (!mount || !this.activeEngine) return;

    mount.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'battleship-wrapper';

    const gridsRow = document.createElement('div');
    gridsRow.className = 'battleship-grids-row';

    // Left Grid: Player Fleet
    const playerCol = document.createElement('div');
    playerCol.className = 'battleship-col';
    playerCol.innerHTML = `<div class="battleship-col-title">Allied Fleet</div>`;

    const playerGrid = document.createElement('div');
    playerGrid.className = 'navy-grid';
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 10; c++) {
        const cell = document.createElement('div');
        cell.className = 'navy-cell';
        const ship = this.activeEngine.playerGrid[r][c];
        const shot = this.activeEngine.aiShots[r][c];

        if (shot === 'hit') {
          cell.classList.add('hit');
          cell.textContent = '💥';
        } else if (shot === 'miss') {
          cell.classList.add('miss');
          cell.textContent = '⚪';
        } else if (ship) {
          cell.classList.add('ship');
        }

        playerGrid.appendChild(cell);
      }
    }
    playerCol.appendChild(playerGrid);
    gridsRow.appendChild(playerCol);

    // Right Grid: Enemy Radar
    const aiCol = document.createElement('div');
    aiCol.className = 'battleship-col';
    aiCol.innerHTML = `<div class="battleship-col-title">Tactical Radar Scan (Target Here)</div>`;

    const aiGrid = document.createElement('div');
    aiGrid.className = 'navy-grid';
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 10; c++) {
        const cell = document.createElement('div');
        cell.className = 'navy-cell enemy-cell';
        const shot = this.activeEngine.playerShots[r][c];

        if (shot === 'hit') {
          cell.classList.add('hit');
          cell.textContent = '💥';
        } else if (shot === 'miss') {
          cell.classList.add('miss');
          cell.textContent = '⚪';
        }

        cell.addEventListener('click', () => this.handleBattleshipCellClick(r, c));
        aiGrid.appendChild(cell);
      }
    }
    aiCol.appendChild(aiGrid);
    gridsRow.appendChild(aiCol);

    wrapper.appendChild(gridsRow);

    // Re-deploy fleet button
    const actionRow = document.createElement('div');
    actionRow.style.display = 'flex';
    actionRow.style.justifyContent = 'center';
    actionRow.style.gap = '0.75rem';
    actionRow.innerHTML = `
      <button class="btn btn-secondary btn-sm" id="btn-redeploy-fleet">⚡ Auto Re-deploy Fleet</button>
    `;
    wrapper.appendChild(actionRow);

    mount.appendChild(wrapper);

    document.getElementById('btn-redeploy-fleet')?.addEventListener('click', () => {
      this.activeEngine.deployFleet('player');
      this.activeEngine.deployFleet('ai');
      this.renderBattleshipBoard();
      this.showToast('Fleets repositioned tactically.', 'info');
    });

    // Update Widget
    const pSunk = this.activeEngine.playerShips.filter(s => s.coordinates.every(c => c.hit)).length;
    const aiSunk = this.activeEngine.aiShips.filter(s => s.coordinates.every(c => c.hit)).length;

    const widget = document.getElementById('game-widget-content');
    if (widget) {
      widget.innerHTML = `
        <div style="display: flex; justify-content: space-around; font-size: 0.95rem; font-weight: 700;">
          <span style="color: var(--accent-gold);">Enemy Sunk: ${aiSunk} / 5</span>
          <span style="color: var(--color-error);">Allied Lost: ${pSunk} / 5</span>
        </div>
      `;
    }

    document.getElementById('game-status-message').textContent = 
      this.activeEngine.winner 
        ? (this.activeEngine.winner === 'player' ? 'Enemy Fleet Annihilated!' : 'Allied Fleet Destroyed.')
        : 'Click coordinates on the Radar Scan grid to fire artillery.';
  }

  async handleBattleshipCellClick(r, c) {
    if (this.activeEngine.winner || this.activeEngine.turn !== 'player') return;

    const res = this.activeEngine.playerFire(r, c);
    if (!res.valid) return;

    if (res.hit) {
      window.portalAudio?.playExplosion?.();
      if (res.sunkShip) {
        this.showToast(`Enemy ${res.sunkShip.name} sunk!`, 'gold');
        window.portalAudio?.playAchievement?.();
      }
    } else {
      window.portalAudio?.playClick?.();
    }

    this.renderBattleshipBoard();

    if (res.winner === 'player') {
      this.concludeMatch('win', 'Naval Victory! All 5 enemy warships sunk.');
      return;
    }

    // AI Turn
    await new Promise(resolve => setTimeout(resolve, 350));
    const aiRes = this.activeEngine.aiTurn();
    if (aiRes) {
      if (aiRes.hit) {
        window.portalAudio?.playExplosion?.();
        if (aiRes.sunkShip) {
          this.showToast(`Allied ${aiRes.sunkShip.name} was sunk!`, 'error');
        }
      }
      this.renderBattleshipBoard();

      if (aiRes.winner === 'ai') {
        this.concludeMatch('loss', 'Defeat! All allied warships were destroyed.');
      }
    }
  }

  // ==========================================================================
  // GAME P: ARCADE BREAKOUT BRICK BREAKER
  // ==========================================================================

  renderBreakoutBoard() {
    const mount = document.getElementById('active-game-board-mount');
    if (!mount || !this.activeEngine) return;

    mount.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'breakout-wrapper';

    const canvas = document.createElement('canvas');
    canvas.className = 'breakout-canvas';
    canvas.width = 600;
    canvas.height = 420;
    canvas.id = 'breakout-canvas';
    wrapper.appendChild(canvas);

    mount.appendChild(wrapper);

    // Mouse / Touch tracking
    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      this.breakoutTargetX = (e.clientX - rect.left) * scaleX;
    });

    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      this.breakoutTargetX = (touch.clientX - rect.left) * scaleX;
    }, { passive: false });

    // Click to shoot laser
    canvas.addEventListener('click', () => {
      this.activeEngine?.fireLaser();
    });

    // Arrow keys support
    if (!this.boundBreakoutKey) {
      this.boundBreakoutKey = (e) => {
        if (this.activeGameId !== 'breakout' || this.currentView !== 'game') return;
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
          e.preventDefault();
          this.breakoutTargetX = Math.max(30, (this.breakoutTargetX || 300) - 25);
        } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
          e.preventDefault();
          this.breakoutTargetX = Math.min(570, (this.breakoutTargetX || 300) + 25);
        } else if (e.key === ' ' || e.code === 'Space') {
          e.preventDefault();
          this.activeEngine?.fireLaser();
        }
      };
      window.addEventListener('keydown', this.boundBreakoutKey);
    }

    this.startBreakoutLoop();
  }

  startBreakoutLoop() {
    if (this.breakoutAnimFrame) cancelAnimationFrame(this.breakoutAnimFrame);

    const canvas = document.getElementById('breakout-canvas');
    if (!canvas || !this.activeEngine) return;
    const ctx = canvas.getContext('2d');

    const loop = () => {
      if (!this.activeEngine || this.activeGameId !== 'breakout' || this.currentView !== 'game') {
        cancelAnimationFrame(this.breakoutAnimFrame);
        return;
      }

      const res = this.activeEngine.update(this.breakoutTargetX);

      // Render Breakout Frame
      ctx.fillStyle = '#070a14';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Bricks
      this.activeEngine.bricks.forEach(b => {
        if (b.alive) {
          ctx.fillStyle = b.color;
          ctx.shadowColor = b.color;
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.roundRect(b.x, b.y, b.w, b.h, 4);
          ctx.fill();
        }
      });
      ctx.shadowBlur = 0;

      // Draw Paddle
      ctx.fillStyle = '#d4af37';
      ctx.shadowColor = '#d4af37';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.roundRect(this.activeEngine.paddleX, this.activeEngine.paddleY, this.activeEngine.paddleWidth, this.activeEngine.paddleHeight, 6);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Draw Balls
      ctx.fillStyle = '#ffffff';
      this.activeEngine.balls.forEach(ball => {
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw Lasers
      ctx.fillStyle = '#ef4444';
      this.activeEngine.lasers.forEach(laser => {
        ctx.fillRect(laser.x, laser.y, laser.w, laser.h);
      });

      // Draw Powerups
      this.activeEngine.powerups.forEach(p => {
        ctx.fillStyle = p.type === 'wide' ? '#00d2ff' : (p.type === 'multi' ? '#a855f7' : '#ef4444');
        ctx.beginPath();
        ctx.roundRect(p.x, p.y, p.w, p.h, 6);
        ctx.fill();
        ctx.font = '12px Outfit, sans-serif';
        ctx.fillStyle = '#000';
        ctx.textAlign = 'center';
        ctx.fillText(p.type === 'wide' ? '↔' : (p.type === 'multi' ? '3x' : '⚡'), p.x + p.w / 2, p.y + p.h / 2 + 4);
      });

      // Draw Particles
      this.activeEngine.particles.forEach(part => {
        ctx.fillStyle = part.color;
        ctx.globalAlpha = part.life;
        ctx.beginPath();
        ctx.arc(part.x, part.y, 2, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;

      // Update Widget
      const widget = document.getElementById('game-widget-content');
      if (widget) {
        widget.innerHTML = `
          <div style="display: flex; justify-content: space-around; font-size: 0.95rem; font-weight: 700;">
            <span>Score: ${this.activeEngine.score}</span>
            <span style="color: #ef4444;">Lives: ${'❤️ '.repeat(Math.max(0, this.activeEngine.lives))}</span>
            <span style="color: var(--accent-gold);">Best: ${this.activeEngine.bestScore}</span>
          </div>
        `;
      }

      if (res.gameWon) {
        this.concludeMatch('win', `Sector cleared! Breakout Score: ${this.activeEngine.score}`);
        return;
      }

      if (res.gameOver) {
        this.concludeMatch('loss', `All lives lost! Final Score: ${this.activeEngine.score}`);
        return;
      }

      this.breakoutAnimFrame = requestAnimationFrame(loop);
    };

    this.breakoutAnimFrame = requestAnimationFrame(loop);
  }
}

// Keyboard Rematch Accessibility
window.addEventListener('keydown', (e) => {
  if (e.key === ' ' || e.key === 'Enter') {
    const modal = document.getElementById('gameover-modal');
    if (modal && modal.classList.contains('active')) {
      e.preventDefault();
      modal.classList.remove('active');
      if (window.portalApp && window.portalApp.activeGameId) {
        window.portalApp.launchGame(window.portalApp.activeGameId, true);
      }
    }
  }
});

// Global Application Initialization (Robust Loading)
function initStrategyPortal() {
  if (!window.portalApp) {
    try {
      window.portalApp = new StrategyPortalApp();
      console.log('Strategy Portal Initialized Successfully');
    } catch (err) {
      console.error('Failed to initialize Strategy Portal:', err);
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initStrategyPortal);
  window.addEventListener('load', initStrategyPortal);
} else {
  initStrategyPortal();
}
