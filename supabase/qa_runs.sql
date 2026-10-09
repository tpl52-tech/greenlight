-- Greenlight / Cue QA — shared manual-QA results for the PUBLIC (no-login) tool.
--
-- Applied to the ReUse App Supabase project (shared with the mobile app). This is the one
-- DELIBERATE exception to that project's deny-all RLS: a non-technical tester opens the public
-- GitHub Pages site with no Firebase sign-in, so the *anon* role must read/insert/update QA
-- results. Scoped to THIS table only — no delete, and nothing else in the schema is reachable
-- by anon. The page uses the same publishable anon key that already ships in the mobile app;
-- the security boundary is RLS, not the key.
--
-- One row per manual-QA sub-issue; `run` holds the whole per-ticket result the app overlays.

create table if not exists public.qa_runs (
  ticket_id  text primary key,                    -- manual-qa sub-issue key, e.g. COR-96
  run        jsonb not null default '{}'::jsonb,   -- { pre, steps, notes, verdict, verdictBy, verdictAt }
  updated_at timestamptz not null default now()
);

alter table public.qa_runs enable row level security;

revoke all on public.qa_runs from public, anon, authenticated;
grant select, insert, update on public.qa_runs to anon, authenticated;   -- no delete on purpose
grant all on public.qa_runs to service_role;

drop policy if exists "qa_runs public read"   on public.qa_runs;
create policy "qa_runs public read"   on public.qa_runs for select using (true);
drop policy if exists "qa_runs public insert" on public.qa_runs;
create policy "qa_runs public insert" on public.qa_runs for insert with check (true);
drop policy if exists "qa_runs public update" on public.qa_runs;
create policy "qa_runs public update" on public.qa_runs for update using (true) with check (true);

-- Cap the anon-writable key so a public writer can't bloat the table with huge ids (idempotent).
do $$ begin
  alter table public.qa_runs add constraint qa_runs_ticket_id_len check (char_length(ticket_id) <= 64);
exception when duplicate_object then null; end $$;

-- Live sync across testers (idempotent).
do $$ begin
  alter publication supabase_realtime add table public.qa_runs;
exception when duplicate_object then null; end $$;
