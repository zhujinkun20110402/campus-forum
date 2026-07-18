-- Campus forum invitation system
-- PostgreSQL manual migration for prisma/schema.prisma
-- Safe to run more than once for the expected schema.

BEGIN;

ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "inviteGrantClaimedAt" TIMESTAMP(3);

CREATE TABLE IF NOT EXISTS "InviteCode" (
  "id" TEXT NOT NULL,
  "code" VARCHAR(32) NOT NULL,
  "source" VARCHAR(32) NOT NULL DEFAULT 'MEMBER_GRANT',
  "createdById" TEXT,
  "usedById" TEXT,
  "usedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "InviteCode_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "InviteCode_code_key"
  ON "InviteCode"("code");

CREATE UNIQUE INDEX IF NOT EXISTS "InviteCode_usedById_key"
  ON "InviteCode"("usedById");

CREATE INDEX IF NOT EXISTS "InviteCode_createdById_createdAt_idx"
  ON "InviteCode"("createdById", "createdAt");

CREATE INDEX IF NOT EXISTS "InviteCode_source_idx"
  ON "InviteCode"("source");

CREATE INDEX IF NOT EXISTS "InviteCode_usedAt_idx"
  ON "InviteCode"("usedAt");

DO $$
BEGIN
  ALTER TABLE "InviteCode"
    ADD CONSTRAINT "InviteCode_createdById_fkey"
    FOREIGN KEY ("createdById") REFERENCES "User"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "InviteCode"
    ADD CONSTRAINT "InviteCode_usedById_fkey"
    FOREIGN KEY ("usedById") REFERENCES "User"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

COMMIT;

-- Verification queries. Run these after the migration if your SQL console
-- does not show the resulting structure automatically.
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('User', 'InviteCode')
  AND (table_name = 'InviteCode' OR column_name = 'inviteGrantClaimedAt')
ORDER BY table_name, ordinal_position;

SELECT indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public' AND tablename = 'InviteCode'
ORDER BY indexname;

SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = '"InviteCode"'::regclass
ORDER BY conname;
