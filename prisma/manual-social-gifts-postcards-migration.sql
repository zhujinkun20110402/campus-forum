-- 每日声望礼物、限量明信片与个性化 24 小时状态
-- PostgreSQL / Supabase SQL Editor
-- 请先执行 manual-presence-features-migration.sql

BEGIN;

ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "lastReputationGiftDay" VARCHAR(10),
  ADD COLUMN IF NOT EXISTS "postcardQuotaMonth" VARCHAR(7),
  ADD COLUMN IF NOT EXISTS "postcardsSentThisMonth" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "CampusStatus"
  ADD COLUMN IF NOT EXISTS "tag" VARCHAR(24),
  ADD COLUMN IF NOT EXISTS "emoji" VARCHAR(16),
  ADD COLUMN IF NOT EXISTS "color" VARCHAR(7) NOT NULL DEFAULT '#f3c84b';

CREATE TABLE IF NOT EXISTS "Postcard" (
  "id" TEXT NOT NULL,
  "senderId" TEXT NOT NULL,
  "recipientId" TEXT NOT NULL,
  "message" VARCHAR(500) NOT NULL,
  "theme" VARCHAR(24) NOT NULL DEFAULT 'PAPER',
  "emoji" VARCHAR(16),
  "openedAt" TIMESTAMP(3),
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Postcard_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Postcard_recipientId_expiresAt_createdAt_idx"
  ON "Postcard"("recipientId", "expiresAt", "createdAt");

CREATE INDEX IF NOT EXISTS "Postcard_senderId_createdAt_idx"
  ON "Postcard"("senderId", "createdAt");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Postcard_senderId_fkey') THEN
    ALTER TABLE "Postcard" ADD CONSTRAINT "Postcard_senderId_fkey"
      FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Postcard_recipientId_fkey') THEN
    ALTER TABLE "Postcard" ADD CONSTRAINT "Postcard_recipientId_fkey"
      FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.cleanup_expired_postcards()
RETURNS INTEGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM "Postcard" WHERE "expiresAt" <= CURRENT_TIMESTAMP;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  DELETE FROM "Notification"
  WHERE "type" = 'POSTCARD_RECEIVED'
    AND "createdAt" <= CURRENT_TIMESTAMP - INTERVAL '7 days';

  RETURN deleted_count;
END;
$$;

COMMIT;

-- 若 Supabase 已启用 pg_cron，此段会安排每小时物理清理一次。
-- 未启用或当前账号无调度权限时只会给出 NOTICE，不影响上面的迁移。
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    IF NOT EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'cleanup-expired-campus-postcards') THEN
      PERFORM cron.schedule(
        'cleanup-expired-campus-postcards',
        '17 * * * *',
        'SELECT public.cleanup_expired_postcards();'
      );
    END IF;
  ELSE
    RAISE NOTICE 'pg_cron 未启用：应用仍会在访问明信片中心时清理过期数据。';
  END IF;
EXCEPTION
  WHEN insufficient_privilege OR undefined_table OR undefined_function THEN
    RAISE NOTICE '无法创建 pg_cron 任务，请按项目说明在 Supabase 中手动启用并调度。';
END $$;
