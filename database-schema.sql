


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."handle_internal_email_delivery"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  recipient_email text;
  recipient_id uuid;
BEGIN
  -- Se um novo e-mail foi salvo na pasta "Enviados"
  IF NEW.folder = 'sent' THEN
    -- Para cada destinatário na lista
    FOR recipient_email IN SELECT * FROM jsonb_array_elements_text(NEW.recipients)
    LOOP
      -- Busca qual usuário do Reduca é o dono desse endereço @reduca.net
      SELECT id INTO recipient_id FROM public.profiles WHERE reduca_email = recipient_email LIMIT 1;
      
      -- Se o usuário existe, faz uma cópia do e-mail na Caixa de Entrada dele!
      IF recipient_id IS NOT NULL THEN
        INSERT INTO public.emails (
          user_id, folder, sender_name, sender_addr, recipients, subject, body, is_read, created_at
        ) VALUES (
          recipient_id, 'inbox', NEW.sender_name, NEW.sender_addr, NEW.recipients, NEW.subject, NEW.body, false, NEW.created_at
        );
      END IF;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_internal_email_delivery"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."articles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "author_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "content" "text" NOT NULL,
    "cover_image" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."articles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."barter_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "title" "text",
    "description" "text",
    "image_url" "text",
    "type" "text",
    "status" "text" DEFAULT 'Disponível'::"text",
    "created_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."barter_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."calendar_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "day" integer NOT NULL,
    "month" integer NOT NULL,
    "year" integer NOT NULL,
    "title" "text" NOT NULL,
    "color" "text" DEFAULT 'bg-orange-500'::"text"
);


ALTER TABLE "public"."calendar_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."chat_messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "user_name" "text",
    "user_avatar" "text",
    "text" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."chat_messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."custom_widgets" (
    "id" "text" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "url" "text" NOT NULL,
    "image" "text"
);


ALTER TABLE "public"."custom_widgets" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ecosystem_apps" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "icon_url" "text" NOT NULL,
    "link_web" "text",
    "link_apk" "text",
    "link_desktop" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."ecosystem_apps" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."emails" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "folder" "text" NOT NULL,
    "sender_name" "text",
    "sender_addr" "text",
    "recipients" "jsonb" NOT NULL,
    "subject" "text",
    "body" "text",
    "is_read" boolean DEFAULT false,
    "is_starred" boolean DEFAULT false,
    "labels" "jsonb" DEFAULT '[]'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "fts" "tsvector" GENERATED ALWAYS AS ("to_tsvector"('"portuguese"'::"regconfig", ((((((COALESCE("subject", ''::"text") || ' '::"text") || COALESCE("body", ''::"text")) || ' '::"text") || COALESCE("sender_name", ''::"text")) || ' '::"text") || COALESCE("sender_addr", ''::"text")))) STORED,
    CONSTRAINT "emails_folder_check" CHECK (("folder" = ANY (ARRAY['inbox'::"text", 'sent'::"text", 'drafts'::"text", 'trash'::"text", 'spam'::"text"])))
);


ALTER TABLE "public"."emails" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."follows" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "follower_id" "uuid" NOT NULL,
    "following_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."follows" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."forum_replies" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "topic_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "author_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."forum_replies" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."forum_topics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "content" "text" NOT NULL,
    "category" "text" NOT NULL,
    "author_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."forum_topics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."group_members" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "group_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" "text" DEFAULT 'member'::"text",
    "joined_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."group_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."groups" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "cover_image" "text",
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."groups" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."library_materials" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "url" "text" NOT NULL,
    "type" "text" DEFAULT 'link'::"text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."library_materials" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."marketing_leads" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "whatsapp" "text",
    "opt_in" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."marketing_leads" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."news" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "content" "text" NOT NULL,
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."news" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."news_receipts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "news_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "read_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."news_receipts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."posts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "content" "text",
    "image" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "likes" "uuid"[] DEFAULT '{}'::"uuid"[],
    "comments" "jsonb" DEFAULT '[]'::"jsonb",
    "poll_data" "jsonb",
    "group_id" "uuid"
);


ALTER TABLE "public"."posts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "name" "text" NOT NULL,
    "avatar" "text",
    "is_admin" boolean DEFAULT false,
    "birth_date" "text",
    "location" "text",
    "role" "text",
    "is_verified" boolean DEFAULT false,
    "push_token" "text",
    "badges" "text"[] DEFAULT '{}'::"text"[],
    "favorite_articles" "uuid"[] DEFAULT '{}'::"uuid"[],
    "cover_image" "text" DEFAULT 'default'::"text",
    "bio" "text",
    "hide_birthdate" boolean DEFAULT false,
    "reduca_email" "text",
    "cellphone" "text"
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."questions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "user_name" "text",
    "text" "text",
    "created_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."questions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."task_submissions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "task_id" "uuid" NOT NULL,
    "student_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "grade" "text",
    "feedback" "text",
    "submitted_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."task_submissions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tasks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "due_date" timestamp with time zone,
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."tasks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."turma_atividades" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "turma_id" "uuid",
    "title" "text" NOT NULL,
    "description" "text",
    "video_link" "text",
    "file_link" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."turma_atividades" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."turma_comentarios" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "atividade_id" "uuid",
    "user_id" "uuid",
    "user_name" "text" NOT NULL,
    "text" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."turma_comentarios" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."turma_membros" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "turma_id" "uuid",
    "user_id" "uuid",
    "name" "text" NOT NULL,
    "email" "text",
    "role" "text" DEFAULT 'Aluno'::"text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."turma_membros" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."turmas" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "owner_id" "uuid",
    "name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."turmas" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_settings" (
    "user_id" "uuid" NOT NULL,
    "active_widgets" "text"[] DEFAULT '{quem-seguir}'::"text"[]
);


ALTER TABLE "public"."user_settings" OWNER TO "postgres";


ALTER TABLE ONLY "public"."articles"
    ADD CONSTRAINT "articles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."barter_items"
    ADD CONSTRAINT "barter_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."calendar_events"
    ADD CONSTRAINT "calendar_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."chat_messages"
    ADD CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."custom_widgets"
    ADD CONSTRAINT "custom_widgets_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ecosystem_apps"
    ADD CONSTRAINT "ecosystem_apps_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."emails"
    ADD CONSTRAINT "emails_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."follows"
    ADD CONSTRAINT "follows_follower_id_following_id_key" UNIQUE ("follower_id", "following_id");



ALTER TABLE ONLY "public"."follows"
    ADD CONSTRAINT "follows_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."forum_replies"
    ADD CONSTRAINT "forum_replies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."forum_topics"
    ADD CONSTRAINT "forum_topics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."group_members"
    ADD CONSTRAINT "group_members_group_id_user_id_key" UNIQUE ("group_id", "user_id");



ALTER TABLE ONLY "public"."group_members"
    ADD CONSTRAINT "group_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."groups"
    ADD CONSTRAINT "groups_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."library_materials"
    ADD CONSTRAINT "library_materials_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."marketing_leads"
    ADD CONSTRAINT "marketing_leads_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."marketing_leads"
    ADD CONSTRAINT "marketing_leads_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."news"
    ADD CONSTRAINT "news_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."news_receipts"
    ADD CONSTRAINT "news_receipts_news_id_user_id_key" UNIQUE ("news_id", "user_id");



ALTER TABLE ONLY "public"."news_receipts"
    ADD CONSTRAINT "news_receipts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_reduca_email_key" UNIQUE ("reduca_email");



ALTER TABLE ONLY "public"."questions"
    ADD CONSTRAINT "questions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."task_submissions"
    ADD CONSTRAINT "task_submissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."task_submissions"
    ADD CONSTRAINT "task_submissions_task_id_student_id_key" UNIQUE ("task_id", "student_id");



ALTER TABLE ONLY "public"."tasks"
    ADD CONSTRAINT "tasks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."turma_atividades"
    ADD CONSTRAINT "turma_atividades_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."turma_comentarios"
    ADD CONSTRAINT "turma_comentarios_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."turma_membros"
    ADD CONSTRAINT "turma_membros_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."turmas"
    ADD CONSTRAINT "turmas_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_settings"
    ADD CONSTRAINT "user_settings_pkey" PRIMARY KEY ("user_id");



CREATE INDEX "emails_fts_idx" ON "public"."emails" USING "gin" ("fts");



CREATE OR REPLACE TRIGGER "email_sent_trigger" AFTER INSERT ON "public"."emails" FOR EACH ROW EXECUTE FUNCTION "public"."handle_internal_email_delivery"();



ALTER TABLE ONLY "public"."articles"
    ADD CONSTRAINT "articles_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."barter_items"
    ADD CONSTRAINT "barter_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."chat_messages"
    ADD CONSTRAINT "chat_messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."custom_widgets"
    ADD CONSTRAINT "custom_widgets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."emails"
    ADD CONSTRAINT "emails_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."follows"
    ADD CONSTRAINT "follows_follower_id_fkey" FOREIGN KEY ("follower_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."follows"
    ADD CONSTRAINT "follows_following_id_fkey" FOREIGN KEY ("following_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."forum_replies"
    ADD CONSTRAINT "forum_replies_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."forum_replies"
    ADD CONSTRAINT "forum_replies_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "public"."forum_topics"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."forum_topics"
    ADD CONSTRAINT "forum_topics_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."group_members"
    ADD CONSTRAINT "group_members_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."group_members"
    ADD CONSTRAINT "group_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."groups"
    ADD CONSTRAINT "groups_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."marketing_leads"
    ADD CONSTRAINT "marketing_leads_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."news"
    ADD CONSTRAINT "news_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."news_receipts"
    ADD CONSTRAINT "news_receipts_news_id_fkey" FOREIGN KEY ("news_id") REFERENCES "public"."news"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."news_receipts"
    ADD CONSTRAINT "news_receipts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."questions"
    ADD CONSTRAINT "questions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."task_submissions"
    ADD CONSTRAINT "task_submissions_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."task_submissions"
    ADD CONSTRAINT "task_submissions_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tasks"
    ADD CONSTRAINT "tasks_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."turma_atividades"
    ADD CONSTRAINT "turma_atividades_turma_id_fkey" FOREIGN KEY ("turma_id") REFERENCES "public"."turmas"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."turma_comentarios"
    ADD CONSTRAINT "turma_comentarios_atividade_id_fkey" FOREIGN KEY ("atividade_id") REFERENCES "public"."turma_atividades"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."turma_comentarios"
    ADD CONSTRAINT "turma_comentarios_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."turma_membros"
    ADD CONSTRAINT "turma_membros_turma_id_fkey" FOREIGN KEY ("turma_id") REFERENCES "public"."turmas"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."turma_membros"
    ADD CONSTRAINT "turma_membros_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."turmas"
    ADD CONSTRAINT "turmas_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_settings"
    ADD CONSTRAINT "user_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



CREATE POLICY "Acesso livre para autenticados" ON "public"."turma_atividades" USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Acesso livre para autenticados" ON "public"."turma_comentarios" USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Acesso livre para autenticados" ON "public"."turma_membros" USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Acesso livre para autenticados" ON "public"."turmas" USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Admin Modify ecosystem_apps" ON "public"."ecosystem_apps" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."is_admin" = true))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."is_admin" = true)))));



CREATE POLICY "Admins can update all profiles." ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() IN ( SELECT "profiles_1"."id"
   FROM "public"."profiles" "profiles_1"
  WHERE ("profiles_1"."is_admin" = true))));



CREATE POLICY "Apenas admins inserem" ON "public"."calendar_events" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."is_admin" = true)))));



CREATE POLICY "Apenas admins removem" ON "public"."calendar_events" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."is_admin" = true)))));



CREATE POLICY "Articles deletable by author." ON "public"."articles" FOR DELETE USING (("auth"."uid"() = "author_id"));



CREATE POLICY "Articles insertable by authenticated." ON "public"."articles" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Articles viewable by everyone." ON "public"."articles" FOR SELECT USING (true);



CREATE POLICY "Authenticated users can create posts." ON "public"."posts" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Custom widgets deletable by owner." ON "public"."custom_widgets" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Custom widgets insertable by owner." ON "public"."custom_widgets" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Custom widgets updatable by owner." ON "public"."custom_widgets" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Custom widgets viewable by owner." ON "public"."custom_widgets" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Follows viewable by everyone." ON "public"."follows" FOR SELECT USING (true);



CREATE POLICY "Group members modifiable by authenticated users." ON "public"."group_members" USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Group members viewable by everyone." ON "public"."group_members" FOR SELECT USING (true);



CREATE POLICY "Groups modifiable by authenticated users." ON "public"."groups" USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Groups viewable by everyone." ON "public"."groups" FOR SELECT USING (true);



CREATE POLICY "Leads insertable by owner." ON "public"."marketing_leads" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Leads modifiable by owner." ON "public"."marketing_leads" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Leads viewable by owner." ON "public"."marketing_leads" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "News modifiable by authenticated users." ON "public"."news" USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "News viewable by everyone." ON "public"."news" FOR SELECT USING (true);



CREATE POLICY "Posts are viewable by everyone." ON "public"."posts" FOR SELECT USING (true);



CREATE POLICY "Public Access ecosystem_apps" ON "public"."ecosystem_apps" FOR SELECT USING (true);



CREATE POLICY "Public profiles are viewable by everyone." ON "public"."profiles" FOR SELECT USING (true);



CREATE POLICY "Receipts modifiable by authenticated users." ON "public"."news_receipts" USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Receipts viewable by everyone." ON "public"."news_receipts" FOR SELECT USING (true);



CREATE POLICY "Settings insertable by owner." ON "public"."user_settings" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Settings updatable by owner." ON "public"."user_settings" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Settings viewable by owner." ON "public"."user_settings" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Submissions modifiable by authenticated users." ON "public"."task_submissions" USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Submissions viewable by everyone." ON "public"."task_submissions" FOR SELECT USING (true);



CREATE POLICY "Tasks modifiable by authenticated users." ON "public"."tasks" USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Tasks viewable by everyone." ON "public"."tasks" FOR SELECT USING (true);



CREATE POLICY "Todos podem ver os eventos" ON "public"."calendar_events" FOR SELECT USING (true);



CREATE POLICY "Users can delete own posts." ON "public"."posts" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own emails" ON "public"."emails" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own follows." ON "public"."follows" FOR DELETE USING (("auth"."uid"() = "follower_id"));



CREATE POLICY "Users can insert their own emails" ON "public"."emails" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own follows." ON "public"."follows" FOR INSERT WITH CHECK (("auth"."uid"() = "follower_id"));



CREATE POLICY "Users can insert their own profile." ON "public"."profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can update own posts or add likes/comments." ON "public"."posts" FOR UPDATE USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Users can update own profile." ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can update their own emails" ON "public"."emails" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own emails" ON "public"."emails" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "all" ON "public"."articles" FOR SELECT USING (true);



CREATE POLICY "all" ON "public"."barter_items" USING (true);



CREATE POLICY "all" ON "public"."questions" FOR SELECT USING (true);



CREATE POLICY "allow_read_all_custom_widgets" ON "public"."custom_widgets" FOR SELECT USING (true);



CREATE POLICY "allow_read_all_profiles" ON "public"."profiles" FOR SELECT USING (true);



CREATE POLICY "allow_read_all_user_settings" ON "public"."user_settings" FOR SELECT USING (true);



ALTER TABLE "public"."articles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "auth" ON "public"."questions" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



ALTER TABLE "public"."barter_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."calendar_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."custom_widgets" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ecosystem_apps" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."emails" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."follows" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."group_members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."groups" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."marketing_leads" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."news" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."news_receipts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."posts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."questions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."task_submissions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tasks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."turma_atividades" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."turma_comentarios" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."turma_membros" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."turmas" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_settings" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."chat_messages";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."emails";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."posts";



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";






















































































































































GRANT ALL ON FUNCTION "public"."handle_internal_email_delivery"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_internal_email_delivery"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_internal_email_delivery"() TO "service_role";


















GRANT ALL ON TABLE "public"."articles" TO "anon";
GRANT ALL ON TABLE "public"."articles" TO "authenticated";
GRANT ALL ON TABLE "public"."articles" TO "service_role";



GRANT ALL ON TABLE "public"."barter_items" TO "anon";
GRANT ALL ON TABLE "public"."barter_items" TO "authenticated";
GRANT ALL ON TABLE "public"."barter_items" TO "service_role";



GRANT ALL ON TABLE "public"."calendar_events" TO "anon";
GRANT ALL ON TABLE "public"."calendar_events" TO "authenticated";
GRANT ALL ON TABLE "public"."calendar_events" TO "service_role";



GRANT ALL ON TABLE "public"."chat_messages" TO "anon";
GRANT ALL ON TABLE "public"."chat_messages" TO "authenticated";
GRANT ALL ON TABLE "public"."chat_messages" TO "service_role";



GRANT ALL ON TABLE "public"."custom_widgets" TO "anon";
GRANT ALL ON TABLE "public"."custom_widgets" TO "authenticated";
GRANT ALL ON TABLE "public"."custom_widgets" TO "service_role";



GRANT ALL ON TABLE "public"."ecosystem_apps" TO "anon";
GRANT ALL ON TABLE "public"."ecosystem_apps" TO "authenticated";
GRANT ALL ON TABLE "public"."ecosystem_apps" TO "service_role";



GRANT ALL ON TABLE "public"."emails" TO "anon";
GRANT ALL ON TABLE "public"."emails" TO "authenticated";
GRANT ALL ON TABLE "public"."emails" TO "service_role";



GRANT ALL ON TABLE "public"."follows" TO "anon";
GRANT ALL ON TABLE "public"."follows" TO "authenticated";
GRANT ALL ON TABLE "public"."follows" TO "service_role";



GRANT ALL ON TABLE "public"."forum_replies" TO "anon";
GRANT ALL ON TABLE "public"."forum_replies" TO "authenticated";
GRANT ALL ON TABLE "public"."forum_replies" TO "service_role";



GRANT ALL ON TABLE "public"."forum_topics" TO "anon";
GRANT ALL ON TABLE "public"."forum_topics" TO "authenticated";
GRANT ALL ON TABLE "public"."forum_topics" TO "service_role";



GRANT ALL ON TABLE "public"."group_members" TO "anon";
GRANT ALL ON TABLE "public"."group_members" TO "authenticated";
GRANT ALL ON TABLE "public"."group_members" TO "service_role";



GRANT ALL ON TABLE "public"."groups" TO "anon";
GRANT ALL ON TABLE "public"."groups" TO "authenticated";
GRANT ALL ON TABLE "public"."groups" TO "service_role";



GRANT ALL ON TABLE "public"."library_materials" TO "anon";
GRANT ALL ON TABLE "public"."library_materials" TO "authenticated";
GRANT ALL ON TABLE "public"."library_materials" TO "service_role";



GRANT ALL ON TABLE "public"."marketing_leads" TO "anon";
GRANT ALL ON TABLE "public"."marketing_leads" TO "authenticated";
GRANT ALL ON TABLE "public"."marketing_leads" TO "service_role";



GRANT ALL ON TABLE "public"."news" TO "anon";
GRANT ALL ON TABLE "public"."news" TO "authenticated";
GRANT ALL ON TABLE "public"."news" TO "service_role";



GRANT ALL ON TABLE "public"."news_receipts" TO "anon";
GRANT ALL ON TABLE "public"."news_receipts" TO "authenticated";
GRANT ALL ON TABLE "public"."news_receipts" TO "service_role";



GRANT ALL ON TABLE "public"."posts" TO "anon";
GRANT ALL ON TABLE "public"."posts" TO "authenticated";
GRANT ALL ON TABLE "public"."posts" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."questions" TO "anon";
GRANT ALL ON TABLE "public"."questions" TO "authenticated";
GRANT ALL ON TABLE "public"."questions" TO "service_role";



GRANT ALL ON TABLE "public"."task_submissions" TO "anon";
GRANT ALL ON TABLE "public"."task_submissions" TO "authenticated";
GRANT ALL ON TABLE "public"."task_submissions" TO "service_role";



GRANT ALL ON TABLE "public"."tasks" TO "anon";
GRANT ALL ON TABLE "public"."tasks" TO "authenticated";
GRANT ALL ON TABLE "public"."tasks" TO "service_role";



GRANT ALL ON TABLE "public"."turma_atividades" TO "anon";
GRANT ALL ON TABLE "public"."turma_atividades" TO "authenticated";
GRANT ALL ON TABLE "public"."turma_atividades" TO "service_role";



GRANT ALL ON TABLE "public"."turma_comentarios" TO "anon";
GRANT ALL ON TABLE "public"."turma_comentarios" TO "authenticated";
GRANT ALL ON TABLE "public"."turma_comentarios" TO "service_role";



GRANT ALL ON TABLE "public"."turma_membros" TO "anon";
GRANT ALL ON TABLE "public"."turma_membros" TO "authenticated";
GRANT ALL ON TABLE "public"."turma_membros" TO "service_role";



GRANT ALL ON TABLE "public"."turmas" TO "anon";
GRANT ALL ON TABLE "public"."turmas" TO "authenticated";
GRANT ALL ON TABLE "public"."turmas" TO "service_role";



GRANT ALL ON TABLE "public"."user_settings" TO "anon";
GRANT ALL ON TABLE "public"."user_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."user_settings" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































