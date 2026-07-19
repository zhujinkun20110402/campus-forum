-- Feedback category, comment replies, and user follows
-- PostgreSQL / Supabase SQL Editor

BEGIN;

ALTER TABLE "Comment"
  ADD COLUMN IF NOT EXISTS "parentId" TEXT;

CREATE INDEX IF NOT EXISTS "Comment_parentId_idx"
  ON "Comment"("parentId");

DO $$
BEGIN
  ALTER TABLE "Comment"
    ADD CONSTRAINT "Comment_parentId_fkey"
    FOREIGN KEY ("parentId") REFERENCES "Comment"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "Follow" (
  "followerId" TEXT NOT NULL,
  "followingId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Follow_pkey" PRIMARY KEY ("followerId", "followingId"),
  CONSTRAINT "Follow_no_self_check" CHECK ("followerId" <> "followingId")
);

CREATE INDEX IF NOT EXISTS "Follow_followingId_idx"
  ON "Follow"("followingId");

DO $$
BEGIN
  ALTER TABLE "Follow"
    ADD CONSTRAINT "Follow_followerId_fkey"
    FOREIGN KEY ("followerId") REFERENCES "User"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "Follow"
    ADD CONSTRAINT "Follow_followingId_fkey"
    FOREIGN KEY ("followingId") REFERENCES "User"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

INSERT INTO "Category" ("id", "name", "slug")
VALUES ('category_feedback', '问题反馈', 'feedback')
ON CONFLICT ("slug") DO UPDATE SET "name" = EXCLUDED."name";

COMMIT;
