-- 1. Create Tables
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null,
  name text not null,
  avatar text,
  birth_date text,
  location text,
  role text,
  push_token text,
  badges text[] default '{}'::text[],
  favorite_articles uuid[] default '{}'::uuid[],
  cover_image text default 'default',
  bio text,
  hide_birthdate boolean default false,
  reduca_email text,
  cellphone text
);

create table public.forum_topics (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text not null,
  category text not null,
  author_id uuid references public.profiles(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.forum_replies (
  id uuid default gen_random_uuid() primary key,
  topic_id uuid references public.forum_topics(id) on delete cascade not null,
  content text not null,
  author_id uuid references public.profiles(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.library_materials (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  url text not null,
  type text default 'link',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text,
  image text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  likes uuid[] default '{}'::uuid[],
  comments jsonb default '[]'::jsonb
);

create table public.user_settings (
  user_id uuid references public.profiles(id) on delete cascade not null primary key,
  active_widgets text[] default '{"quem-seguir"}'::text[]
);

create table public.custom_widgets (
  id text primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  url text not null,
  image text
);

-- 2. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.user_settings enable row level security;
alter table public.custom_widgets enable row level security;

-- 3. Create Policies (Permissive for prototyping)
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);

create policy "Posts are viewable by everyone." on public.posts for select using (true);
create policy "Authenticated users can create posts." on public.posts for insert with check (auth.role() = 'authenticated');
create policy "Users can update own posts or add likes/comments." on public.posts for update using (auth.role() = 'authenticated');
create policy "Users can delete own posts." on public.posts for delete using (auth.uid() = user_id);

create policy "Settings viewable by owner." on public.user_settings for select using (auth.uid() = user_id);
create policy "Settings insertable by owner." on public.user_settings for insert with check (auth.uid() = user_id);
create policy "Settings updatable by owner." on public.user_settings for update using (auth.uid() = user_id);

create policy "Custom widgets viewable by owner." on public.custom_widgets for select using (auth.uid() = user_id);
create policy "Custom widgets insertable by owner." on public.custom_widgets for insert with check (auth.uid() = user_id);
create policy "Custom widgets updatable by owner." on public.custom_widgets for update using (auth.uid() = user_id);
create policy "Custom widgets deletable by owner." on public.custom_widgets for delete using (auth.uid() = user_id);

-- 4. Enable Realtime on posts
alter publication supabase_realtime add table public.posts;

-- 5. Tabelas para Tarefas de Classe (Tasks & Submissions)
create table public.tasks (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  due_date timestamp with time zone,
  created_by uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.task_submissions (
  id uuid default gen_random_uuid() primary key,
  task_id uuid references public.tasks(id) on delete cascade not null,
  student_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  grade text,
  feedback text,
  submitted_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(task_id, student_id)
);

alter table public.tasks enable row level security;
alter table public.task_submissions enable row level security;

create policy "Tasks viewable by everyone." on public.tasks for select using (true);
create policy "Tasks modifiable by authenticated users." on public.tasks for all using (auth.role() = 'authenticated');
create policy "Submissions viewable by everyone." on public.task_submissions for select using (true);
create policy "Submissions modifiable by authenticated users." on public.task_submissions for all using (auth.role() = 'authenticated');

-- 6. Tabelas para Notícias com Recibo de Leitura
create table public.news (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text not null,
  created_by uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.news_receipts (
  id uuid default gen_random_uuid() primary key,
  news_id uuid references public.news(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  read_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(news_id, user_id)
);

alter table public.news enable row level security;
alter table public.news_receipts enable row level security;

create policy "News viewable by everyone." on public.news for select using (true);
create policy "News modifiable by authenticated users." on public.news for all using (auth.role() = 'authenticated');
create policy "Receipts viewable by everyone." on public.news_receipts for select using (true);
create policy "Receipts modifiable by authenticated users." on public.news_receipts for all using (auth.role() = 'authenticated');

-- 7. Grupos de Interesse
create table public.groups (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  cover_image text,
  created_by uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.group_members (
  id uuid default gen_random_uuid() primary key,
  group_id uuid references public.groups(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text default 'member',
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(group_id, user_id)
);

alter table public.groups enable row level security;
alter table public.group_members enable row level security;

create policy "Groups viewable by everyone." on public.groups for select using (true);
create policy "Groups modifiable by authenticated users." on public.groups for all using (auth.role() = 'authenticated');
create policy "Group members viewable by everyone." on public.group_members for select using (true);
create policy "Group members modifiable by authenticated users." on public.group_members for all using (auth.role() = 'authenticated');

-- Adicionando group_id à tabela posts se não existir
alter table public.posts add column if not exists group_id uuid references public.groups(id) on delete cascade;

-- 8. Coleta de Contatos (Newsletter / WhatsApp)
create table public.marketing_leads (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  email text not null,
  whatsapp text,
  opt_in boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id)
);

alter table public.marketing_leads enable row level security;

create policy "Leads viewable by owner." on public.marketing_leads for select using (auth.uid() = user_id);
create policy "Leads insertable by owner." on public.marketing_leads for insert with check (auth.uid() = user_id);
create policy "Leads modifiable by owner." on public.marketing_leads for update using (auth.uid() = user_id);

