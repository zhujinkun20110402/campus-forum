-- ============================================================
-- 声望之路（Reputation Road）：Phase 1 数据迁移
-- 幂等，可在 Supabase SQL Editor 重复执行
-- ============================================================

-- 用户：一次性卡已用计数 / 邀请额度已用 / 主页主题 / 装备称号
alter table "User" add column if not exists "pinCardsUsedCount" integer not null default 0;
alter table "User" add column if not exists "anonCardsUsedCount" integer not null default 0;
alter table "User" add column if not exists "inviteQuotaUsed" integer not null default 0;
alter table "User" add column if not exists "profileTheme" varchar(24);
alter table "User" add column if not exists "equippedTitle" varchar(24);

-- 帖子：编辑时间 / 匿名发布 / 自助置顶时间
alter table "Post" add column if not exists "editedAt" timestamptz;
alter table "Post" add column if not exists "anonymous" boolean not null default false;
alter table "Post" add column if not exists "selfPinnedAt" timestamptz;

-- 自助置顶按时间过滤，建索引
create index if not exists idx_post_self_pinned on "Post" ("selfPinnedAt");
