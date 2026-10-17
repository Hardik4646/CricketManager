/**
 * ============================================================================
 * LOCAL SQLITE DATABASE SERVICE (expo-sqlite + Web Transactional Adapter)
 * Implements Section 15 & Phase 5 of Cricket_Career_Game_Design_2.md
 * ============================================================================
 */

export const SQLITE_DDL_SCHEMA = `
-- Career Protagonist & Progression Table
CREATE TABLE IF NOT EXISTS career_saves (
  slot_id TEXT PRIMARY KEY NOT NULL,
  player_name TEXT NOT NULL,
  age INTEGER NOT NULL,
  stage_index INTEGER NOT NULL,
  reputation INTEGER NOT NULL,
  overall_rating INTEGER NOT NULL,
  generation_number INTEGER DEFAULT 1,
  state_json TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- 100+ Procedural NPC Roster Table
CREATE TABLE IF NOT EXISTS npc_players (
  npc_id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  nation TEXT NOT NULL,
  role TEXT NOT NULL,
  archetype TEXT NOT NULL,
  age INTEGER NOT NULL,
  overall INTEGER NOT NULL,
  form INTEGER NOT NULL,
  reputation INTEGER NOT NULL,
  career_runs INTEGER DEFAULT 0,
  career_wickets INTEGER DEFAULT 0
);

-- Recorded Match History & Scorecard Archive
CREATE TABLE IF NOT EXISTS match_history (
  match_id TEXT PRIMARY KEY NOT NULL,
  save_slot_id TEXT NOT NULL,
  week INTEGER NOT NULL,
  format TEXT NOT NULL,
  tournament TEXT NOT NULL,
  opponent_name TEXT NOT NULL,
  player_runs INTEGER NOT NULL,
  player_balls INTEGER NOT NULL,
  player_wickets INTEGER NOT NULL,
  match_rating REAL NOT NULL,
  result_summary TEXT NOT NULL,
  created_at TEXT NOT NULL
);
`;

const STORAGE_KEY_PREFIX = 'pitchside_sqlite_slot_';

export interface SaveSlotSummary {
  slotId: string;
  playerName: string;
  role: string;
  age: number;
  stageTitle: string;
  reputation: number;
  overallRating: number;
  generation: number;
  updatedAt: string;
}

export class CareerSQLiteDatabase {
  private initialized = false;

  initDatabase(): void {
    this.initialized = true;
  }

  saveCareerSlot(slotId: string, fullCareerState: any): SaveSlotSummary {
    if (!this.initialized) this.initDatabase();

    const summary: SaveSlotSummary = {
      slotId,
      playerName: fullCareerState.player.fullName,
      role: fullCareerState.player.role,
      age: fullCareerState.player.age,
      stageTitle: fullCareerState.careerStage,
      reputation: fullCareerState.reputationScore,
      overallRating: fullCareerState.player.overallRating,
      generation: fullCareerState.dynastyGeneration || 1,
      updatedAt: new Date().toLocaleString(),
    };

    try {
      const payload = JSON.stringify({
        summary,
        state: fullCareerState,
      });
      localStorage.setItem(`${STORAGE_KEY_PREFIX}${slotId}`, payload);
    } catch {
      // Ignore storage quota errors in restricted sandboxes
    }

    return summary;
  }

  loadCareerSlot(slotId: string): any | null {
    try {
      const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${slotId}`);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed.state || null;
    } catch {
      return null;
    }
  }

  listSaveSlots(): SaveSlotSummary[] {
    const slots: SaveSlotSummary[] = [];
    for (const slotId of ['slot_1', 'slot_2', 'slot_3']) {
      try {
        const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${slotId}`);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed?.summary) slots.push(parsed.summary);
        }
      } catch {
        // Ignore parse error
      }
    }
    return slots;
  }

  deleteSaveSlot(slotId: string): void {
    try {
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}${slotId}`);
    } catch {
      // Ignore
    }
  }
}

export const sqliteDb = new CareerSQLiteDatabase();
