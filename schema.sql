-- Enable the pg_cron extension for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;

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


CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."subscription_plan_type" AS ENUM (
    'pro',
    'lifetime'
);


ALTER TYPE "public"."subscription_plan_type" OWNER TO "postgres";


CREATE TYPE "public"."subscription_status" AS ENUM (
    'active',
    'cancelled',
    'expired'
);


ALTER TYPE "public"."subscription_status" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."add_credits"("p_user_id" "uuid", "p_credits" integer, "p_description" "text") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Update user credits
    UPDATE users 
    SET credits = credits + p_credits
    WHERE id = p_user_id;

    -- Record transaction
    INSERT INTO credits_transactions (
        user_id,
        amount,
        description,
        transaction_type
    ) VALUES (
        p_user_id,
        p_credits,
        p_description,
        'purchase'
    );
END;
$$;


ALTER FUNCTION "public"."add_credits"("p_user_id" "uuid", "p_credits" integer, "p_description" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_default_folder_and_notebook"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  folder_id uuid;
BEGIN
  -- Create default folder
  INSERT INTO public.folders (name, user_id, color, is_default)
  VALUES ('My Folders', NEW.id, '#ffffff', true)
  RETURNING id INTO folder_id;
  
  -- Create default notebook in the default folder
  INSERT INTO public.notebooks (name, user_id, color, folder_id)
  VALUES ('My Notes', NEW.id, '#ffffff', folder_id);
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."create_default_folder_and_notebook"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."delete_folder_cascade"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
declare
  notebook_ids uuid[];
begin
  -- Get all notebook IDs in this folder
  select array_agg(id) into notebook_ids
  from notebooks
  where folder_id = old.id;

  -- Delete all notes in these notebooks
  if notebook_ids is not null then
    delete from notes
    where notebook_id = any(notebook_ids);
  end if;

  -- Delete all notebooks in this folder
  delete from notebooks where folder_id = old.id;

  return old;
end;
$$;


ALTER FUNCTION "public"."delete_folder_cascade"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."delete_notebook_cascade"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  -- Delete all notes in this notebook
  delete from notes where notebook_id = old.id;
  return old;
end;
$$;


ALTER FUNCTION "public"."delete_notebook_cascade"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_subscription_details"("user_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
declare
  sub_details jsonb;
begin
  select jsonb_build_object(
    'has_subscription', true,
    'plan_type', plan_type,
    'status', status,
    'expires_at', expires_at,
    'is_lifetime', plan_type = 'lifetime'
  )
  into sub_details
  from public.subscriptions
  where user_id = user_id
  and status = 'active'
  and (
    plan_type = 'lifetime'
    or (plan_type = 'pro' and expires_at > now())
  )
  limit 1;

  if sub_details is null then
    return jsonb_build_object(
      'has_subscription', false
    );
  end if;

  return sub_details;
end;
$$;


ALTER FUNCTION "public"."get_subscription_details"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NOW(),
    NOW()
  );
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log the error but don't prevent user creation
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
    new.updated_at = now();
    return new;
end;
$$;


ALTER FUNCTION "public"."handle_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_user_metadata_update"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  update public.profiles
  set 
    full_name = coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'user_name',
      split_part(new.email, '@', 1)
    ),
    updated_at = now()
  where id = new.id;
  return new;
end;
$$;


ALTER FUNCTION "public"."handle_user_metadata_update"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."has_active_subscription"("user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  return exists (
    select 1
    from public.subscriptions
    where subscriptions.user_id = user_id
    and status = 'active'
    and (
      plan_type = 'lifetime'
      or (plan_type = 'pro' and expires_at > now())
    )
  );
end;
$$;


ALTER FUNCTION "public"."has_active_subscription"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"("user_email" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  return exists (
    select 1
    from public.admin_users
    where email = user_email
  );
end;
$$;


ALTER FUNCTION "public"."is_admin"("user_email" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."use_credits"("p_user_id" "uuid", "p_credits" integer, "p_description" "text") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Update user credits
    UPDATE users 
    SET credits = credits - p_credits
    WHERE id = p_user_id 
    AND (credits >= p_credits OR is_admin = true);

    -- Record transaction
    INSERT INTO credits_transactions (
        user_id,
        amount,
        description,
        transaction_type
    ) VALUES (
        p_user_id,
        -p_credits,
        p_description,
        'usage'
    );
END;
$$;


ALTER FUNCTION "public"."use_credits"("p_user_id" "uuid", "p_credits" integer, "p_description" "text") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."folders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "name" "text" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "color" "text" DEFAULT '#ffffff'::"text",
    "is_default" boolean DEFAULT false,
    "is_pinned" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."folders" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."note_shares" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "note_id" "uuid" NOT NULL,
    "shared_with" "text" NOT NULL,
    "can_edit" boolean DEFAULT false,
    "created_by" "uuid" NOT NULL
);


ALTER TABLE "public"."note_shares" OWNER TO "postgres";


ALTER TABLE "public"."note_shares" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."note_shares_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."notebooks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "name" "text" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "color" "text" DEFAULT '#ffffff'::"text",
    "folder_id" "uuid"
);


ALTER TABLE "public"."notebooks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "title" "text" NOT NULL,
    "content" "text",
    "notebook_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "is_pinned" boolean DEFAULT false,
    "is_archived" boolean DEFAULT false,
    "is_trashed" boolean DEFAULT false,
    "color" "text" DEFAULT '#ffffff'::"text",
    "tags" "text"[] DEFAULT ARRAY[]::"text"[],
    "trashed_at" timestamp with time zone,
    "labels" "text"[] DEFAULT ARRAY[]::"text"[],
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "position_x" double precision,
    "position_y" double precision,
    "layout_type" "text" DEFAULT 'circular'::"text"
);


ALTER TABLE "public"."notes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "email" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "full_name" "text"
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_subscriptions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "email" "text" NOT NULL,
    "name" "text",
    "subscription_status" "text" DEFAULT 'active'::"text" NOT NULL,
    "subscription_type" "text" DEFAULT 'lifetime'::"text" NOT NULL,
    "activated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "user_id" "uuid"
);


ALTER TABLE "public"."user_subscriptions" OWNER TO "postgres";


ALTER TABLE ONLY "public"."folders"
    ADD CONSTRAINT "folders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."note_shares"
    ADD CONSTRAINT "note_shares_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notebooks"
    ADD CONSTRAINT "notebooks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notes"
    ADD CONSTRAINT "notes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_subscriptions"
    ADD CONSTRAINT "unique_email" UNIQUE ("email");



ALTER TABLE ONLY "public"."user_subscriptions"
    ADD CONSTRAINT "user_subscriptions_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_note_shares_note_id" ON "public"."note_shares" USING "btree" ("note_id");



CREATE INDEX "idx_note_shares_shared_with" ON "public"."note_shares" USING "btree" ("shared_with");



CREATE INDEX "user_subscriptions_email_idx" ON "public"."user_subscriptions" USING "btree" ("email");



CREATE OR REPLACE TRIGGER "folder_delete_cascade_trigger" BEFORE DELETE ON "public"."folders" FOR EACH ROW EXECUTE FUNCTION "public"."delete_folder_cascade"();



CREATE OR REPLACE TRIGGER "notebook_delete_cascade_trigger" BEFORE DELETE ON "public"."notebooks" FOR EACH ROW EXECUTE FUNCTION "public"."delete_notebook_cascade"();



CREATE OR REPLACE TRIGGER "update_notes_updated_at" BEFORE UPDATE ON "public"."notes" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "fk_profiles_user" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."folders"
    ADD CONSTRAINT "folders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."note_shares"
    ADD CONSTRAINT "note_shares_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."note_shares"
    ADD CONSTRAINT "note_shares_note_id_fkey" FOREIGN KEY ("note_id") REFERENCES "public"."notes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notebooks"
    ADD CONSTRAINT "notebooks_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "public"."folders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notebooks"
    ADD CONSTRAINT "notebooks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."notes"
    ADD CONSTRAINT "notes_notebook_id_fkey" FOREIGN KEY ("notebook_id") REFERENCES "public"."notebooks"("id");



ALTER TABLE ONLY "public"."notes"
    ADD CONSTRAINT "notes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."user_subscriptions"
    ADD CONSTRAINT "user_subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Enable insert for service role only" ON "public"."user_subscriptions" FOR INSERT WITH CHECK (true);



CREATE POLICY "Enable read access for all users" ON "public"."user_subscriptions" FOR SELECT USING (true);



CREATE POLICY "Public profiles are viewable by everyone" ON "public"."profiles" FOR SELECT USING (true);



CREATE POLICY "Users can create shares" ON "public"."note_shares" FOR INSERT WITH CHECK (("created_by" = "auth"."uid"()));



CREATE POLICY "Users can delete own shares" ON "public"."note_shares" FOR DELETE USING (("created_by" = "auth"."uid"()));



CREATE POLICY "Users can delete their own notes" ON "public"."notes" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own notes" ON "public"."notes" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own profile" ON "public"."profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can update own shares" ON "public"."note_shares" FOR UPDATE USING (("created_by" = "auth"."uid"()));



CREATE POLICY "Users can update their own notes or shared notes with edit perm" ON "public"."notes" FOR UPDATE USING ((("user_id" = "auth"."uid"()) OR ("id" IN ( SELECT "note_shares"."note_id"
   FROM "public"."note_shares"
  WHERE (("note_shares"."shared_with" = "auth"."email"()) AND ("note_shares"."can_edit" = true))))));



CREATE POLICY "Users can update their own profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view shares" ON "public"."note_shares" FOR SELECT USING ((("created_by" = "auth"."uid"()) OR ("shared_with" = "auth"."email"())));



CREATE POLICY "Users can view their own notes or shared notes" ON "public"."notes" FOR SELECT USING ((("user_id" = "auth"."uid"()) OR ("id" IN ( SELECT "note_shares"."note_id"
   FROM "public"."note_shares"
  WHERE ("note_shares"."shared_with" = "auth"."email"())))));



CREATE POLICY "folder_delete_policy" ON "public"."folders" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "folder_insert_policy" ON "public"."folders" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "folder_select_policy" ON "public"."folders" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "folder_update_policy" ON "public"."folders" FOR UPDATE USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."folders" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "note_delete_policy" ON "public"."notes" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "note_insert_policy" ON "public"."notes" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."note_shares" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "notebook_delete_policy" ON "public"."notebooks" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "notebook_insert_policy" ON "public"."notebooks" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "notebook_select_policy" ON "public"."notebooks" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "notebook_update_policy" ON "public"."notebooks" FOR UPDATE USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."notebooks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_subscriptions" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."folders";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."notebooks";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."notes";



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";




















































































































































































GRANT ALL ON FUNCTION "public"."add_credits"("p_user_id" "uuid", "p_credits" integer, "p_description" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."add_credits"("p_user_id" "uuid", "p_credits" integer, "p_description" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."add_credits"("p_user_id" "uuid", "p_credits" integer, "p_description" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_default_folder_and_notebook"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_default_folder_and_notebook"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_default_folder_and_notebook"() TO "service_role";



GRANT ALL ON FUNCTION "public"."delete_folder_cascade"() TO "anon";
GRANT ALL ON FUNCTION "public"."delete_folder_cascade"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_folder_cascade"() TO "service_role";



GRANT ALL ON FUNCTION "public"."delete_notebook_cascade"() TO "anon";
GRANT ALL ON FUNCTION "public"."delete_notebook_cascade"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_notebook_cascade"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_subscription_details"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_subscription_details"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_subscription_details"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_user_metadata_update"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_user_metadata_update"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_user_metadata_update"() TO "service_role";



GRANT ALL ON FUNCTION "public"."has_active_subscription"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."has_active_subscription"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_active_subscription"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin"("user_email" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"("user_email" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"("user_email" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."use_credits"("p_user_id" "uuid", "p_credits" integer, "p_description" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."use_credits"("p_user_id" "uuid", "p_credits" integer, "p_description" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."use_credits"("p_user_id" "uuid", "p_credits" integer, "p_description" "text") TO "service_role";


















GRANT ALL ON TABLE "public"."folders" TO "anon";
GRANT ALL ON TABLE "public"."folders" TO "authenticated";
GRANT ALL ON TABLE "public"."folders" TO "service_role";



GRANT ALL ON TABLE "public"."note_shares" TO "anon";
GRANT ALL ON TABLE "public"."note_shares" TO "authenticated";
GRANT ALL ON TABLE "public"."note_shares" TO "service_role";



GRANT ALL ON SEQUENCE "public"."note_shares_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."note_shares_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."note_shares_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."notebooks" TO "anon";
GRANT ALL ON TABLE "public"."notebooks" TO "authenticated";
GRANT ALL ON TABLE "public"."notebooks" TO "service_role";



GRANT ALL ON TABLE "public"."notes" TO "anon";
GRANT ALL ON TABLE "public"."notes" TO "authenticated";
GRANT ALL ON TABLE "public"."notes" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."user_subscriptions" TO "anon";
GRANT ALL ON TABLE "public"."user_subscriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."user_subscriptions" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;

CREATE OR REPLACE FUNCTION "public"."cleanup_expired_trash"() RETURNS void
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    DELETE FROM notes
    WHERE is_trashed = true
    AND trashed_at < NOW() - INTERVAL '2 days';
END;
$$;

ALTER FUNCTION "public"."cleanup_expired_trash"() OWNER TO "postgres";

-- Create a scheduled job to run the cleanup function daily
SELECT cron.schedule(
    'cleanup-expired-trash',  -- job name
    '0 0 * * *',            -- run at midnight every day (cron expression)
    $$SELECT public.cleanup_expired_trash()$$
);
