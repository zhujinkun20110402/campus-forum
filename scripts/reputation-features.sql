-- ============================================================
-- 声望之路：剩余功能数据库迁移（幂等，可重复执行）
--   · 投票帖：Post.poll + PollVote 表
--   · 定时发布：Post.publishAt
--   · 话题挑战：Post.challengeId + TopicChallenge 表
-- ============================================================

-- ===== 投票帖 =====
alter table "Post" add column if not exists "poll" jsonb;

create table if not exists "PollVote" (
    "id"        text         not null,
    "postId"    text         not null,
    "userId"    text         not null,
    "optionId"  varchar(32)  not null,
    "createdAt" timestamp(3) not null default current_timestamp,
    constraint "PollVote_pkey" primary key ("id")
);

create unique index if not exists "PollVote_postId_userId_key" on "PollVote" ("postId", "userId");
create index if not exists "PollVote_postId_idx" on "PollVote" ("postId");

-- ===== 定时发布 =====
alter table "Post" add column if not exists "publishAt" timestamptz;
create index if not exists "Post_publishAt_idx" on "Post" ("publishAt");

-- ===== 话题挑战 =====
create table if not exists "TopicChallenge" (
    "id"          text         not null,
    "title"       varchar(60)  not null,
    "description" varchar(200),
    "createdById" text         not null,
    "endsAt"      timestamp(3) not null,
    "createdAt"   timestamp(3) not null default current_timestamp,
    constraint "TopicChallenge_pkey" primary key ("id")
);

create index if not exists "TopicChallenge_endsAt_idx" on "TopicChallenge" ("endsAt");

alter table "Post" add column if not exists "challengeId" text;
create index if not exists "Post_challengeId_idx" on "Post" ("challengeId");

-- ===== 外键（幂等） =====
do $$
begin
    if not exists (select 1 from pg_constraint where conname = 'PollVote_postId_fkey') then
        alter table "PollVote" add constraint "PollVote_postId_fkey"
            foreign key ("postId") references "Post"("id") on delete cascade on update cascade;
    end if;
    if not exists (select 1 from pg_constraint where conname = 'PollVote_userId_fkey') then
        alter table "PollVote" add constraint "PollVote_userId_fkey"
            foreign key ("userId") references "User"("id") on delete cascade on update cascade;
    end if;
    if not exists (select 1 from pg_constraint where conname = 'TopicChallenge_createdById_fkey') then
        alter table "TopicChallenge" add constraint "TopicChallenge_createdById_fkey"
            foreign key ("createdById") references "User"("id") on delete cascade on update cascade;
    end if;
    if not exists (select 1 from pg_constraint where conname = 'Post_challengeId_fkey') then
        alter table "Post" add constraint "Post_challengeId_fkey"
            foreign key ("challengeId") references "TopicChallenge"("id") on delete set null on update cascade;
    end if;
end $$;
