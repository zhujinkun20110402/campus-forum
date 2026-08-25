-- ============================================================
-- 搜索升级：pg_trgm 三字组索引
-- 加速 ILIKE '%关键词%' 模糊匹配（中文同样受益，无需 zhparser）
-- 在 Supabase SQL Editor 中整段执行一次即可（幂等，可重复执行）
-- ============================================================

-- pg_trgm 是 Supabase 官方支持的扩展，免费版可用
create extension if not exists pg_trgm;

-- 帖子标题 / 正文
create index if not exists idx_post_title_trgm on "Post" using gin (title gin_trgm_ops);
create index if not exists idx_post_content_trgm on "Post" using gin (content gin_trgm_ops);

-- 用户昵称 / 简介
create index if not exists idx_user_name_trgm on "User" using gin (name gin_trgm_ops);
create index if not exists idx_user_bio_trgm on "User" using gin (bio gin_trgm_ops);
