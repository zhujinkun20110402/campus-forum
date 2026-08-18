-- =============================================================
-- 校园论坛 · 关系系统建表脚本（手动执行一次即可）
-- 对应 prisma/schema.prisma 中的 Relationship / RelationshipRequest
-- 以及 Notification.requestId 扩展字段。
--
-- 执行前：确保数据库为项目当前使用的 PostgreSQL。
-- 执行后：在本机运行 `npx prisma generate` 以更新 Prisma Client 类型。
--
-- 设计要点（尽量节约空间）：
--  * 关系等级由 xp 推导，不单独存储 level 字段；
--  * 每个关系只存一行，双向唯一索引保证“同种关系一人只能绑一位”；
--  * 待处理申请用部分唯一索引防止重复，历史申请在新申请产生时由应用清理；
--  * 通知表只新增一个可空 requestId 外键，用于申请被处理后清理对应通知。
-- =============================================================

BEGIN;

-- 1) 关系表
CREATE TABLE IF NOT EXISTS "Relationship" (
    "id"        TEXT NOT NULL,
    "userAId"   TEXT NOT NULL,
    "userBId"   TEXT NOT NULL,
    "type"      VARCHAR(16) NOT NULL,
    "xp"        INTEGER NOT NULL DEFAULT 0,
    "xpDay"     VARCHAR(10),
    "xpToday"   INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Relationship_pkey" PRIMARY KEY ("id")
);

-- 同种关系每人最多一位：用户无论处于 A/B 列，同一 type 都只能出现一次
CREATE UNIQUE INDEX IF NOT EXISTS "Relationship_userAId_type_key"
    ON "Relationship" ("userAId", "type");
CREATE UNIQUE INDEX IF NOT EXISTS "Relationship_userBId_type_key"
    ON "Relationship" ("userBId", "type");

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'Relationship_userAId_fkey'
    ) THEN
        ALTER TABLE "Relationship" ADD CONSTRAINT "Relationship_userAId_fkey"
            FOREIGN KEY ("userAId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'Relationship_userBId_fkey'
    ) THEN
        ALTER TABLE "Relationship" ADD CONSTRAINT "Relationship_userBId_fkey"
            FOREIGN KEY ("userBId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- 2) 关系申请表
CREATE TABLE IF NOT EXISTS "RelationshipRequest" (
    "id"          TEXT NOT NULL,
    "fromUserId"  TEXT NOT NULL,
    "toUserId"    TEXT NOT NULL,
    "type"        VARCHAR(16) NOT NULL,
    "message"     VARCHAR(120),
    "status"      VARCHAR(16) NOT NULL DEFAULT 'PENDING',
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),

    CONSTRAINT "RelationshipRequest_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "RelationshipRequest_toUserId_status_idx"
    ON "RelationshipRequest" ("toUserId", "status");
CREATE INDEX IF NOT EXISTS "RelationshipRequest_fromUserId_idx"
    ON "RelationshipRequest" ("fromUserId");

-- 业务约束：同一对用户之间、同一种关系，同时只能存在一条待处理申请
-- （Prisma schema 不支持部分唯一索引，因此手动添加）
CREATE UNIQUE INDEX IF NOT EXISTS "RelationshipRequest_pending_pair_type_key"
    ON "RelationshipRequest" ("fromUserId", "toUserId", "type")
    WHERE "status" = 'PENDING';

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'RelationshipRequest_fromUserId_fkey'
    ) THEN
        ALTER TABLE "RelationshipRequest" ADD CONSTRAINT "RelationshipRequest_fromUserId_fkey"
            FOREIGN KEY ("fromUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'RelationshipRequest_toUserId_fkey'
    ) THEN
        ALTER TABLE "RelationshipRequest" ADD CONSTRAINT "RelationshipRequest_toUserId_fkey"
            FOREIGN KEY ("toUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- 3) 通知表扩展：requestId（用于申请被处理/取消后清理对应通知）
ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "requestId" TEXT;

CREATE INDEX IF NOT EXISTS "Notification_requestId_idx"
    ON "Notification" ("requestId");

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'Notification_requestId_fkey'
    ) THEN
        ALTER TABLE "Notification" ADD CONSTRAINT "Notification_requestId_fkey"
            FOREIGN KEY ("requestId") REFERENCES "RelationshipRequest"("id")
            ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

COMMIT;
