-- =============================================================
-- 校园论坛 · 举报系统建表脚本（Supabase SQL Editor 直接运行，幂等）
-- 对应 prisma/schema.prisma 中的 Report 模型。
--
-- 执行后：在本机运行 `npx prisma generate` 以更新 Prisma Client 类型。
--
-- 设计要点（节约空间）：
--  * targetType/targetId 采用多态存储（POST/COMMENT），后续可扩展新举报对象；
--  * 同一用户对同一内容同时只能有一条待处理举报（部分唯一索引）；
--  * 内容被删除后由应用清理对应举报记录；
--  * 审核信息（处理人/时间）只占两个字段。
-- =============================================================

BEGIN;

CREATE TABLE IF NOT EXISTS "Report" (
    "id"          TEXT NOT NULL,
    "reporterId"  TEXT,
    "targetType"  VARCHAR(16) NOT NULL,
    "targetId"    TEXT NOT NULL,
    "reason"      VARCHAR(32) NOT NULL,
    "detail"      VARCHAR(500),
    "status"      VARCHAR(16) NOT NULL DEFAULT 'PENDING',
    "handledById" TEXT,
    "handledAt"   TIMESTAMP(3),
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Report_status_createdAt_idx"
    ON "Report" ("status", "createdAt");
CREATE INDEX IF NOT EXISTS "Report_targetType_targetId_idx"
    ON "Report" ("targetType", "targetId");
CREATE INDEX IF NOT EXISTS "Report_reporterId_idx"
    ON "Report" ("reporterId");

-- 同一用户对同一内容只能有一条待处理举报（Prisma schema 不支持部分唯一索引，手动添加）
CREATE UNIQUE INDEX IF NOT EXISTS "Report_pending_reporter_target_key"
    ON "Report" ("reporterId", "targetType", "targetId")
    WHERE "status" = 'PENDING';

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'Report_reporterId_fkey'
    ) THEN
        ALTER TABLE "Report" ADD CONSTRAINT "Report_reporterId_fkey"
            FOREIGN KEY ("reporterId") REFERENCES "User"("id")
            ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'Report_handledById_fkey'
    ) THEN
        ALTER TABLE "Report" ADD CONSTRAINT "Report_handledById_fkey"
            FOREIGN KEY ("handledById") REFERENCES "User"("id")
            ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

COMMIT;
