import Database from "better-sqlite3";
import path from "path";
import { sm2 } from "@/lib/sm2";
import { computeStreak } from "@/lib/utils";
import type {
  LanguageProfile,
  VocabularyItem,
  Session,
  SessionFormat,
  ProgressSummary,
  CEFRLevel,
  Interest,
} from "@/types";

const DB_PATH = path.join(process.cwd(), "data", "tutor.db");

let _db: Database.Database | null = null;


interface ProfileRow {
  id: string;
  language: string;
  level: string;
  interests: string;
  created_at: string;
  last_session_at: string | null;
}

interface ItemRow {
  id: number;
  language_id: string;
  word: string;
  translation: string;
  context: string | null;
  ease_factor: number;
  interval: number;
  repetitions: number;
  score: number;
  next_review: string;
  created_at: string;
}

interface SessionRow {
  id: number;
  language_id: string;
  format: string;
  started_at: string;
  ended_at: string | null;
  items_reviewed: number;
  avg_score: number;
}


const mapProfile = (r: ProfileRow): LanguageProfile => ({
  id: r.id,
  language: r.language,
  level: r.level as CEFRLevel,
  interests: JSON.parse(r.interests) as Interest[],
  createdAt: r.created_at,
  lastSessionAt: r.last_session_at ?? null,
});

const mapItem = (r: ItemRow): VocabularyItem => ({
  id: r.id,
  languageId: r.language_id,
  word: r.word,
  translation: r.translation,
  context: r.context ?? null,
  easeFactor: r.ease_factor,
  interval: r.interval,
  repetitions: r.repetitions,
  score: r.score,
  nextReview: r.next_review,
  createdAt: r.created_at,
});

const mapSession = (r: SessionRow): Session => ({
  id: r.id,
  languageId: r.language_id,
  format: r.format as SessionFormat,
  startedAt: r.started_at,
  endedAt: r.ended_at ?? null,
  itemsReviewed: r.items_reviewed,
  avgScore: r.avg_score,
});


export const getDb = (): Database.Database => {
  if (_db) return _db;

  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  db.exec(`
    CREATE TABLE IF NOT EXISTS language_profiles (
      id           TEXT PRIMARY KEY,
      language     TEXT NOT NULL,
      level        TEXT NOT NULL,
      interests    TEXT NOT NULL,
      created_at   TEXT NOT NULL DEFAULT (datetime('now')),
      last_session_at TEXT
    );

    CREATE TABLE IF NOT EXISTS vocabulary_items (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      language_id  TEXT NOT NULL REFERENCES language_profiles(id) ON DELETE CASCADE,
      word         TEXT NOT NULL,
      translation  TEXT NOT NULL,
      context      TEXT,
      ease_factor  REAL NOT NULL DEFAULT 2.5,
      interval     INTEGER NOT NULL DEFAULT 1,
      repetitions  INTEGER NOT NULL DEFAULT 0,
      score        REAL NOT NULL DEFAULT 0,
      next_review  TEXT NOT NULL DEFAULT (date('now')),
      created_at   TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(language_id, word)
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      language_id    TEXT NOT NULL REFERENCES language_profiles(id) ON DELETE CASCADE,
      format         TEXT NOT NULL,
      started_at     TEXT NOT NULL DEFAULT (datetime('now')),
      ended_at       TEXT,
      items_reviewed INTEGER NOT NULL DEFAULT 0,
      avg_score      REAL NOT NULL DEFAULT 0
    );
  `);

  _db = db;
  return db;
};


export const getAllProfiles = (): LanguageProfile[] => {
  const rows = getDb()
    .prepare("SELECT * FROM language_profiles ORDER BY created_at ASC")
    .all() as any[];
  return rows.map(mapProfile);
};

export const getProfile = (id: string): LanguageProfile | null => {
  const row = getDb()
    .prepare("SELECT * FROM language_profiles WHERE id = ?")
    .get(id) as any;
  return row ? mapProfile(row) : null;
};

export const saveProfile = (
  id: string,
  language: string,
  level: CEFRLevel,
  interests: Interest[]
): LanguageProfile => {
  const db = getDb();
  db.prepare(
    `INSERT INTO language_profiles (id, language, level, interests)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET language=excluded.language, level=excluded.level, interests=excluded.interests`
  ).run(id, language, level, JSON.stringify(interests));
  return getProfile(id)!;
};

export const deleteProfile = (id: string): void => {
  getDb().prepare("DELETE FROM language_profiles WHERE id = ?").run(id);
};

export const touchProfile = (id: string): void => {
  getDb()
    .prepare("UPDATE language_profiles SET last_session_at = datetime('now') WHERE id = ?")
    .run(id);
};


export const getDueItems = (languageId: string, limit = 10): VocabularyItem[] => {
  const rows = getDb()
    .prepare(
      `SELECT * FROM vocabulary_items
       WHERE language_id = ? AND date(next_review) <= date('now')
       ORDER BY score ASC, next_review ASC
       LIMIT ?`
    )
    .all(languageId, limit) as any[];
  return rows.map(mapItem);
};

export const getAllItems = (languageId: string): VocabularyItem[] => {
  const rows = getDb()
    .prepare(
      "SELECT * FROM vocabulary_items WHERE language_id = ? ORDER BY created_at DESC"
    )
    .all(languageId) as ItemRow[];
  return rows.map(mapItem);
};

export const upsertVocabItem = (
  languageId: string,
  word: string,
  translation: string,
  context?: string
): VocabularyItem => {
  const db = getDb();
  db.prepare(
    `INSERT INTO vocabulary_items (language_id, word, translation, context, next_review)
     VALUES (?, ?, ?, ?, date('now', '+1 day'))
     ON CONFLICT(language_id, word) DO NOTHING`
  ).run(languageId, word, translation, context ?? null);

  return mapItem(
    db
      .prepare("SELECT * FROM vocabulary_items WHERE language_id = ? AND word = ?")
      .get(languageId, word) as ItemRow
  );
};

export const getItemById = (id: number): VocabularyItem | null => {
  const row = getDb()
    .prepare("SELECT * FROM vocabulary_items WHERE id = ?")
    .get(id) as ItemRow | undefined;
  return row ? mapItem(row) : null;
};

export const getItemByWord = (languageId: string, word: string): VocabularyItem | null => {
  const row = getDb()
    .prepare("SELECT * FROM vocabulary_items WHERE language_id = ? AND word = ?")
    .get(languageId, word) as ItemRow | undefined;
  return row ? mapItem(row) : null;
};

export const getLatestUnreviewedItem = (
  languageId: string,
  excludeWord?: string
): VocabularyItem | null => {
  const row = excludeWord
    ? (getDb()
        .prepare(
          `SELECT * FROM vocabulary_items
           WHERE language_id = ? AND repetitions = 0 AND word != ?
           ORDER BY created_at DESC LIMIT 1`
        )
        .get(languageId, excludeWord) as ItemRow | undefined)
    : (getDb()
        .prepare(
          `SELECT * FROM vocabulary_items
           WHERE language_id = ? AND repetitions = 0
           ORDER BY created_at DESC LIMIT 1`
        )
        .get(languageId) as ItemRow | undefined);
  return row ? mapItem(row) : null;
};

export const scheduleForToday = (id: number): void => {
  getDb()
    .prepare("UPDATE vocabulary_items SET next_review = date('now') WHERE id = ?")
    .run(id);
};

export const reviewItem = (id: number, score: number): VocabularyItem => {
  const db = getDb();
  const item = db
    .prepare("SELECT * FROM vocabulary_items WHERE id = ?")
    .get(id) as ItemRow | undefined;
  if (!item) throw new Error(`Vocab item ${id} not found`);

  const updated = sm2(item.ease_factor, item.interval, item.repetitions, score);
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + updated.interval);

  db.prepare(
    `UPDATE vocabulary_items
     SET ease_factor=?, interval=?, repetitions=?, score=?, next_review=?
     WHERE id=?`
  ).run(
    updated.easeFactor,
    updated.interval,
    updated.repetitions,
    score,
    nextReview.toISOString().split("T")[0],
    id
  );

  return mapItem(db.prepare("SELECT * FROM vocabulary_items WHERE id = ?").get(id) as ItemRow);
};


export const startSession = (languageId: string, format: SessionFormat): Session => {
  const db = getDb();
  const { lastInsertRowid } = db
    .prepare("INSERT INTO sessions (language_id, format) VALUES (?, ?)")
    .run(languageId, format);
  touchProfile(languageId);
  return mapSession(db.prepare("SELECT * FROM sessions WHERE id = ?").get(lastInsertRowid) as SessionRow);
};

export const endSession = (id: number, itemsReviewed: number, avgScore: number): void => {
  getDb()
    .prepare(
      `UPDATE sessions SET ended_at=datetime('now'), items_reviewed=?, avg_score=? WHERE id=?`
    )
    .run(itemsReviewed, avgScore, id);
};

export const endOpenSessions = (languageId: string): void => {
  getDb()
    .prepare(`UPDATE sessions SET ended_at=datetime('now') WHERE language_id=? AND ended_at IS NULL`)
    .run(languageId);
};

export const incrementSession = (sessionId: number, score: number): void => {
  const db = getDb();
  const row = db
    .prepare("SELECT items_reviewed, avg_score FROM sessions WHERE id=?")
    .get(sessionId) as Pick<SessionRow, "items_reviewed" | "avg_score"> | undefined;
  if (!row) return;
  const newCount = row.items_reviewed + 1;
  const newAvg = (row.avg_score * row.items_reviewed + score) / newCount;
  db.prepare("UPDATE sessions SET items_reviewed=?, avg_score=? WHERE id=?").run(newCount, newAvg, sessionId);
};


export const getProgress = (languageId: string): ProgressSummary => {
  const db = getDb();

  const totalWords = (
    db
      .prepare("SELECT COUNT(*) as c FROM vocabulary_items WHERE language_id=? AND repetitions > 0")
      .get(languageId) as { c: number }
  ).c;

  const dueToday = (
    db
      .prepare(
        `SELECT COUNT(*) as c FROM vocabulary_items
         WHERE language_id=? AND date(next_review) <= date('now')`
      )
      .get(languageId) as { c: number }
  ).c;

  const sessions = db
    .prepare(
      `SELECT started_at, ended_at FROM sessions
       WHERE language_id=? ORDER BY started_at DESC`
    )
    .all(languageId) as Pick<SessionRow, "started_at" | "ended_at">[];

  const totalSessions = sessions.length;
  const streakDays = computeStreak(sessions.map((s) => s.started_at));
  const totalMinutes = sessions.reduce((acc, s) => {
    if (!s.ended_at) return acc;
    const diff =
      new Date(s.ended_at).getTime() - new Date(s.started_at).getTime();
    return acc + Math.round(diff / 60000);
  }, 0);

  const weakItems = db
    .prepare(
      `SELECT * FROM vocabulary_items WHERE language_id=? AND score < 5 AND repetitions > 0
       ORDER BY score ASC LIMIT 6`
    )
    .all(languageId) as ItemRow[];

  const strongItems = db
    .prepare(
      `SELECT * FROM vocabulary_items WHERE language_id=? AND score >= 8 AND repetitions > 0
       ORDER BY score DESC LIMIT 6`
    )
    .all(languageId) as ItemRow[];

  return {
    totalWords,
    dueToday,
    streakDays,
    totalSessions,
    totalMinutes,
    weakItems: weakItems.map(mapItem),
    strongItems: strongItems.map(mapItem),
  };
};
