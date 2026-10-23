/**
 * ============================================================================
 * BATTLESHIP (FLEET RADAR COMBAT) ENGINE
 * Dual 10x10 Naval Grids, 5 Warships, Tactical Radar & Smart Hunting AI
 * ============================================================================
 */

class BattleshipEngine {
  constructor() {
    this.gridSize = 10;
    this.shipTypes = [
      { name: 'Carrier', size: 5, icon: '🚢' },
      { name: 'Battleship', size: 4, icon: '⚓' },
      { name: 'Cruiser', size: 3, icon: '🛳️' },
      { name: 'Submarine', size: 3, icon: '🌊' },
      { name: 'Destroyer', size: 2, icon: '🚤' }
    ];
    this.init();
  }

  init() {
    this.playerGrid = Array.from({ length: 10 }, () => Array(10).fill(null));
    this.aiGrid = Array.from({ length: 10 }, () => Array(10).fill(null));

    this.playerShots = Array.from({ length: 10 }, () => Array(10).fill(null)); // 'hit' or 'miss'
    this.aiShots = Array.from({ length: 10 }, () => Array(10).fill(null));

    this.playerShips = [];
    this.aiShips = [];

    this.winner = null;
    this.turn = 'player'; // 'player' or 'ai'

    // AI Hunting state
    this.aiTargetQueue = [];

    // Deploy both fleets
    this.deployFleet('player');
    this.deployFleet('ai');
  }

  deployFleet(fleetSide) {
    const grid = (fleetSide === 'player') ? this.playerGrid : this.aiGrid;
    const shipsList = (fleetSide === 'player') ? this.playerShips : this.aiShips;
    shipsList.length = 0;

    // Clear grid
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 10; c++) {
        grid[r][c] = null;
      }
    }

    this.shipTypes.forEach(type => {
      let placed = false;
      let attempts = 0;

      while (!placed && attempts < 200) {
        attempts++;
        const horizontal = Math.random() < 0.5;
        const maxR = horizontal ? 10 : (10 - type.size);
        const maxC = horizontal ? (10 - type.size) : 10;

        const r = Math.floor(Math.random() * maxR);
        const c = Math.floor(Math.random() * maxC);

        // Check clear
        let clear = true;
        for (let i = 0; i < type.size; i++) {
          const checkR = horizontal ? r : (r + i);
          const checkC = horizontal ? (c + i) : c;
          if (grid[checkR][checkC] !== null) {
            clear = false;
            break;
          }
        }

        if (clear) {
          const coordinates = [];
          for (let i = 0; i < type.size; i++) {
            const shipR = horizontal ? r : (r + i);
            const shipC = horizontal ? (c + i) : c;
            grid[shipR][shipC] = type.name;
            coordinates.push({ r: shipR, c: shipC, hit: false });
          }
          shipsList.push({
            name: type.name,
            size: type.size,
            icon: type.icon,
            coordinates
          });
          placed = true;
        }
      }
    });
  }

  fireAtAI(r, c) {
    const res = this.playerFire(r, c);
    return {
      success: !!res.valid,
      hit: res.hit,
      sunkShip: res.sunkShip,
      winner: res.winner,
      ...res
    };
  }

  playerFire(r, c) {
    if (this.winner || this.turn !== 'player') return { valid: false };
    if (this.playerShots[r][c] !== null) return { valid: false, reason: 'Already scanned sector' };

    const hitShipName = this.aiGrid[r][c];
    let isHit = false;
    let sunkShip = null;

    if (hitShipName) {
      isHit = true;
      this.playerShots[r][c] = 'hit';
      const ship = this.aiShips.find(s => s.name === hitShipName);
      if (ship) {
        const coord = ship.coordinates.find(coord => coord.r === r && coord.c === c);
        if (coord) coord.hit = true;
        if (ship.coordinates.every(coord => coord.hit)) {
          sunkShip = ship;
        }
      }
    } else {
      this.playerShots[r][c] = 'miss';
    }

    // Check Win
    const allAiSunk = this.aiShips.every(s => s.coordinates.every(c => c.hit));
    if (allAiSunk) {
      this.winner = 'player';
    }

    this.turn = 'ai';

    return {
      valid: true,
      hit: isHit,
      sunkShip,
      winner: this.winner
    };
  }

  aiTurn() {
    if (this.winner || this.turn !== 'ai') return null;

    let target = null;

    // Pick from target queue if hunting
    while (this.aiTargetQueue.length > 0) {
      const candidate = this.aiTargetQueue.shift();
      if (this.aiShots[candidate.r][candidate.c] === null) {
        target = candidate;
        break;
      }
    }

    // If no queue target, pick random unscanned cell
    if (!target) {
      const unscanned = [];
      for (let r = 0; r < 10; r++) {
        for (let c = 0; c < 10; c++) {
          if (this.aiShots[r][c] === null) {
            unscanned.push({ r, c });
          }
        }
      }
      if (unscanned.length > 0) {
        target = unscanned[Math.floor(Math.random() * unscanned.length)];
      }
    }

    if (!target) return null;

    const { r, c } = target;
    const hitShipName = this.playerGrid[r][c];
    let isHit = false;
    let sunkShip = null;

    if (hitShipName) {
      isHit = true;
      this.aiShots[r][c] = 'hit';
      const ship = this.playerShips.find(s => s.name === hitShipName);
      if (ship) {
        const coord = ship.coordinates.find(coord => coord.r === r && coord.c === c);
        if (coord) coord.hit = true;
        if (ship.coordinates.every(coord => coord.hit)) {
          sunkShip = ship;
        }
      }

      // Add adjacent cells to hunting queue
      const neighbors = [
        { r: r - 1, c },
        { r: r + 1, c },
        { r, c: c - 1 },
        { r, c: c + 1 }
      ];
      neighbors.forEach(n => {
        if (n.r >= 0 && n.r < 10 && n.c >= 0 && n.c < 10 && this.aiShots[n.r][n.c] === null) {
          this.aiTargetQueue.push(n);
        }
      });
    } else {
      this.aiShots[r][c] = 'miss';
    }

    // Check Win
    const allPlayerSunk = this.playerShips.every(s => s.coordinates.every(c => c.hit));
    if (allPlayerSunk) {
      this.winner = 'ai';
    }

    this.turn = 'player';

    return {
      r,
      c,
      hit: isHit,
      sunkShip,
      winner: this.winner
    };
  }
}

window.BattleshipEngine = BattleshipEngine;
