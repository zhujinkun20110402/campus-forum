-- Connection-list privacy settings
-- PostgreSQL / Supabase SQL Editor

ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "hideFollowers" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "hideFollowing" BOOLEAN NOT NULL DEFAULT false;
