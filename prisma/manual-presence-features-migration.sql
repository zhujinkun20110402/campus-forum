-- 每日签到与 24 小时状态
-- PostgreSQL / Supabase SQL Editor

BEGIN;

ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "lastCheckInDay" VARCHAR(10),
  ADD COLUMN IF NOT EXISTS "checkInStreak" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "totalCheckIns" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS "CampusStatus" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "content" VARCHAR(120) NOT NULL,
  "mood" VARCHAR(24) NOT NULL,
  "visibility" VARCHAR(16) NOT NULL DEFAULT 'PUBLIC',
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CampusStatus_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "CampusStatus_userId_key"
  ON "CampusStatus"("userId");

CREATE INDEX IF NOT EXISTS "CampusStatus_expiresAt_updatedAt_idx"
  ON "CampusStatus"("expiresAt", "updatedAt");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CampusStatus_userId_fkey') THEN
    ALTER TABLE "CampusStatus" ADD CONSTRAINT "CampusStatus_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

COMMIT;
