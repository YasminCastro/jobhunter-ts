import { DatabaseSync } from "node:sqlite";
import { createHash } from "node:crypto";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

const DB_PATH = "data/sent-jobs.db";

mkdirSync(dirname(DB_PATH), { recursive: true });

const db = new DatabaseSync(DB_PATH);
db.exec("PRAGMA journal_mode = WAL");
db.exec(`
  CREATE TABLE IF NOT EXISTS sent_jobs (
    hash TEXT PRIMARY KEY,
    company TEXT,
    position TEXT,
    location TEXT,
    job_url TEXT,
    created_at INTEGER NOT NULL
  )
`);

const existsStmt = db.prepare("SELECT 1 FROM sent_jobs WHERE hash = ?");
const insertStmt = db.prepare(`
  INSERT OR IGNORE INTO sent_jobs (hash, company, position, location, job_url, created_at)
  VALUES (?, ?, ?, ?, ?, ?)
`);

function normalize(value: unknown): string {
  return (value ?? "").toString().trim().toLowerCase();
}

export function buildJobKey(job: {
  company?: string;
  position?: string;
  location?: string;
  jobUrl?: string;
}): string {
  const fingerprint = [job.company, job.position, job.location, job.jobUrl]
    .map(normalize)
    .join("|");
  return createHash("sha256").update(fingerprint).digest("hex");
}

export function isJobSent(hash: string): boolean {
  return existsStmt.get(hash) !== undefined;
}

export function markJobAsSent(
  hash: string,
  job: {
    company?: string;
    position?: string;
    location?: string;
    jobUrl?: string;
  },
): void {
  insertStmt.run(
    hash,
    job.company ?? null,
    job.position ?? null,
    job.location ?? null,
    job.jobUrl ?? null,
    Date.now(),
  );
}

const listStmt = db.prepare(`
  SELECT hash, company, position, location, job_url, created_at
  FROM sent_jobs
  WHERE created_at >= ? AND created_at <= ?
  ORDER BY created_at DESC
`);

type SentJobRow = {
  hash: string;
  company: string | null;
  position: string | null;
  location: string | null;
  job_url: string | null;
  created_at: number;
};

export function listSentJobs(filter: { startDate?: number; endDate?: number }) {
  const rows = listStmt.all(
    filter.startDate ?? 0,
    filter.endDate ?? Number.MAX_SAFE_INTEGER,
  ) as SentJobRow[];

  return rows.map((row) => ({
    hash: row.hash,
    company: row.company,
    position: row.position,
    location: row.location,
    jobUrl: row.job_url,
    createdAt: new Date(row.created_at).toISOString(),
  }));
}
