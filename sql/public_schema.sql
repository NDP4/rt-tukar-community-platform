--
-- PostgreSQL database dump
--

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: pg_database_owner
--

CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO pg_database_owner;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: item_condition; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.item_condition AS ENUM (
    'new',
    'like_new',
    'good',
    'fair',
    'poor'
);


ALTER TYPE public.item_condition OWNER TO postgres;

--
-- Name: item_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.item_status AS ENUM (
    'available',
    'reserved',
    'unavailable'
);


ALTER TYPE public.item_status OWNER TO postgres;

--
-- Name: request_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.request_status AS ENUM (
    'pending',
    'accepted',
    'rejected',
    'collected'
);


ALTER TYPE public.request_status OWNER TO postgres;

--
-- Name: user_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.user_role AS ENUM (
    'admin',
    'member'
);


ALTER TYPE public.user_role OWNER TO postgres;

--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.profiles (id, name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.raw_user_meta_data->>'phone'
  )
  ON CONFLICT (id) DO UPDATE SET
    name = COALESCE(NEW.raw_user_meta_data->>'name', EXCLUDED.name),
    phone = COALESCE(NEW.raw_user_meta_data->>'phone', EXCLUDED.phone),
    updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.handle_new_user() OWNER TO postgres;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: comments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.comments (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    item_id uuid NOT NULL,
    user_id uuid NOT NULL,
    body text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


ALTER TABLE public.comments OWNER TO postgres;

--
-- Name: items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.items (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    title text NOT NULL,
    description text,
    category text NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    unit text DEFAULT 'piece'::text NOT NULL,
    condition text DEFAULT 'good'::text,
    photo_path text,
    donor_id uuid NOT NULL,
    rt_id uuid NOT NULL,
    status text DEFAULT 'available'::text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT items_condition_check CHECK ((condition = ANY (ARRAY['new'::text, 'like_new'::text, 'good'::text, 'fair'::text]))),
    CONSTRAINT items_status_check CHECK ((status = ANY (ARRAY['available'::text, 'requested'::text, 'reserved'::text, 'collected'::text])))
);


ALTER TABLE public.items OWNER TO postgres;

--
-- Name: likes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.likes (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    item_id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


ALTER TABLE public.likes OWNER TO postgres;

--
-- Name: item_stats; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.item_stats AS
 SELECT i.id AS item_id,
    count(DISTINCT l.id) AS likes_count,
    count(DISTINCT c.id) AS comments_count
   FROM ((public.items i
     LEFT JOIN public.likes l ON ((i.id = l.item_id)))
     LEFT JOIN public.comments c ON ((i.id = c.item_id)))
  GROUP BY i.id;


ALTER VIEW public.item_stats OWNER TO postgres;

--
-- Name: members; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.members (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    profile_id uuid NOT NULL,
    rt_id uuid NOT NULL,
    role text DEFAULT 'member'::text NOT NULL,
    joined_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT members_role_check CHECK ((role = ANY (ARRAY['admin'::text, 'member'::text])))
);


ALTER TABLE public.members OWNER TO postgres;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    type character varying(50) NOT NULL,
    title character varying(255) NOT NULL,
    message text NOT NULL,
    related_id uuid,
    related_type character varying(50),
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    name text NOT NULL,
    phone text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


ALTER TABLE public.profiles OWNER TO postgres;

--
-- Name: requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.requests (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    item_id uuid NOT NULL,
    requester_id uuid NOT NULL,
    status text DEFAULT 'pending'::text,
    message text,
    scheduled_pickup_date timestamp with time zone,
    pickup_address text,
    pickup_code uuid,
    pickup_code_used_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    reply_message text,
    replied_at timestamp with time zone,
    CONSTRAINT requests_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'accepted'::text, 'rejected'::text, 'collected'::text])))
);


ALTER TABLE public.requests OWNER TO postgres;

--
-- Name: rts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rts (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    kelurahan text NOT NULL,
    kecamatan text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


ALTER TABLE public.rts OWNER TO postgres;

--
-- Name: user_request_stats; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.user_request_stats AS
 SELECT i.donor_id,
    count(
        CASE
            WHEN (r.status = 'pending'::text) THEN 1
            ELSE NULL::integer
        END) AS pending_requests,
    count(
        CASE
            WHEN (r.status = 'accepted'::text) THEN 1
            ELSE NULL::integer
        END) AS accepted_requests,
    count(
        CASE
            WHEN (r.status = 'rejected'::text) THEN 1
            ELSE NULL::integer
        END) AS rejected_requests
   FROM (public.items i
     LEFT JOIN public.requests r ON ((i.id = r.item_id)))
  GROUP BY i.donor_id;


ALTER VIEW public.user_request_stats OWNER TO postgres;

--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: items items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_pkey PRIMARY KEY (id);


--
-- Name: likes likes_item_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_item_id_user_id_key UNIQUE (item_id, user_id);


--
-- Name: likes likes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_pkey PRIMARY KEY (id);


--
-- Name: members members_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.members
    ADD CONSTRAINT members_pkey PRIMARY KEY (id);


--
-- Name: members members_profile_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.members
    ADD CONSTRAINT members_profile_id_key UNIQUE (profile_id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: requests requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.requests
    ADD CONSTRAINT requests_pkey PRIMARY KEY (id);


--
-- Name: rts rts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rts
    ADD CONSTRAINT rts_pkey PRIMARY KEY (id);


--
-- Name: idx_comments_item_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_comments_item_id ON public.comments USING btree (item_id);


--
-- Name: idx_comments_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_comments_user_id ON public.comments USING btree (user_id);


--
-- Name: idx_likes_item_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_likes_item_id ON public.likes USING btree (item_id);


--
-- Name: idx_likes_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_likes_user_id ON public.likes USING btree (user_id);


--
-- Name: idx_notifications_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_created_at ON public.notifications USING btree (created_at DESC);


--
-- Name: idx_notifications_is_read; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_is_read ON public.notifications USING btree (is_read);


--
-- Name: idx_notifications_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_user_id ON public.notifications USING btree (user_id);


--
-- Name: idx_requests_item_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_requests_item_id ON public.requests USING btree (item_id);


--
-- Name: idx_requests_requester_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_requests_requester_id ON public.requests USING btree (requester_id);


--
-- Name: idx_requests_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_requests_status ON public.requests USING btree (status);


--
-- Name: comments update_comments_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: items update_items_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON public.items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: notifications update_notifications_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON public.notifications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: requests update_requests_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_requests_updated_at BEFORE UPDATE ON public.requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: rts update_rts_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_rts_updated_at BEFORE UPDATE ON public.rts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: comments comments_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(id) ON DELETE CASCADE;


--
-- Name: comments comments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: items items_donor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_donor_id_fkey FOREIGN KEY (donor_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: items items_rt_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_rt_id_fkey FOREIGN KEY (rt_id) REFERENCES public.rts(id) ON DELETE CASCADE;


--
-- Name: likes likes_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(id) ON DELETE CASCADE;


--
-- Name: likes likes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: members members_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.members
    ADD CONSTRAINT members_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: members members_rt_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.members
    ADD CONSTRAINT members_rt_id_fkey FOREIGN KEY (rt_id) REFERENCES public.rts(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id);


--
-- Name: requests requests_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.requests
    ADD CONSTRAINT requests_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(id) ON DELETE CASCADE;


--
-- Name: requests requests_requester_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.requests
    ADD CONSTRAINT requests_requester_id_fkey FOREIGN KEY (requester_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: items Donors and RT admins can delete items; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Donors and RT admins can delete items" ON public.items FOR DELETE USING (((donor_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.members
  WHERE ((members.profile_id = auth.uid()) AND (members.rt_id = items.rt_id) AND (members.role = 'admin'::text))))));


--
-- Name: items Donors and RT admins can update items; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Donors and RT admins can update items" ON public.items FOR UPDATE USING (((donor_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.members
  WHERE ((members.profile_id = auth.uid()) AND (members.rt_id = items.rt_id) AND (members.role = 'admin'::text))))));


--
-- Name: requests Requesters, donors, and RT admins can update requests; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Requesters, donors, and RT admins can update requests" ON public.requests FOR UPDATE USING (((requester_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.items
  WHERE ((items.id = requests.item_id) AND (items.donor_id = auth.uid())))) OR (EXISTS ( SELECT 1
   FROM (public.items
     JOIN public.members ON ((members.rt_id = items.rt_id)))
  WHERE ((items.id = requests.item_id) AND (members.profile_id = auth.uid()) AND (members.role = 'admin'::text))))));


--
-- Name: comments Users can create comments on items in their RT; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can create comments on items in their RT" ON public.comments FOR INSERT WITH CHECK (((user_id = auth.uid()) AND (EXISTS ( SELECT 1
   FROM (public.items
     JOIN public.members ON ((members.rt_id = items.rt_id)))
  WHERE ((items.id = comments.item_id) AND (members.profile_id = auth.uid()))))));


--
-- Name: items Users can create items in their RT; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can create items in their RT" ON public.items FOR INSERT WITH CHECK (((donor_id = auth.uid()) AND (EXISTS ( SELECT 1
   FROM public.members
  WHERE ((members.profile_id = auth.uid()) AND (members.rt_id = items.rt_id))))));


--
-- Name: requests Users can create requests for items in their RT; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can create requests for items in their RT" ON public.requests FOR INSERT WITH CHECK (((requester_id = auth.uid()) AND (EXISTS ( SELECT 1
   FROM (public.items
     JOIN public.members ON ((members.rt_id = items.rt_id)))
  WHERE ((items.id = requests.item_id) AND (members.profile_id = auth.uid()))))));


--
-- Name: comments Users can delete own comments or RT admins can delete any; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can delete own comments or RT admins can delete any" ON public.comments FOR DELETE USING (((user_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM (public.items
     JOIN public.members ON ((members.rt_id = items.rt_id)))
  WHERE ((items.id = comments.item_id) AND (members.profile_id = auth.uid()) AND (members.role = 'admin'::text))))));


--
-- Name: profiles Users can insert own profile; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = id));


--
-- Name: members Users can join an RT; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can join an RT" ON public.members FOR INSERT WITH CHECK ((profile_id = auth.uid()));


--
-- Name: comments Users can update own comments; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can update own comments" ON public.comments FOR UPDATE USING ((user_id = auth.uid()));


--
-- Name: comments Users can view comments on items in their RT; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view comments on items in their RT" ON public.comments FOR SELECT USING ((EXISTS ( SELECT 1
   FROM (public.items
     JOIN public.members ON ((members.rt_id = items.rt_id)))
  WHERE ((items.id = comments.item_id) AND (members.profile_id = auth.uid())))));


--
-- Name: items Users can view items in their RT; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view items in their RT" ON public.items FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.members
  WHERE ((members.profile_id = auth.uid()) AND (members.rt_id = items.rt_id)))));


--
-- Name: profiles Users can view own profile; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING ((auth.uid() = id));


--
-- Name: requests Users can view requests for items in their RT; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view requests for items in their RT" ON public.requests FOR SELECT USING (((requester_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.items
  WHERE ((items.id = requests.item_id) AND (items.donor_id = auth.uid())))) OR (EXISTS ( SELECT 1
   FROM (public.items
     JOIN public.members ON ((members.rt_id = items.rt_id)))
  WHERE ((items.id = requests.item_id) AND (members.profile_id = auth.uid()) AND (members.role = 'admin'::text))))));


--
-- Name: rts Users can view their RT; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view their RT" ON public.rts FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.members
  WHERE ((members.profile_id = auth.uid()) AND (members.rt_id = rts.id)))));


--
-- Name: likes allow_all_select_likes; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY allow_all_select_likes ON public.likes FOR SELECT TO authenticated USING (true);


--
-- Name: likes allow_own_delete_likes; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY allow_own_delete_likes ON public.likes FOR DELETE TO authenticated USING ((auth.uid() = user_id));


--
-- Name: likes allow_own_insert_likes; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY allow_own_insert_likes ON public.likes FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: comments; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

--
-- Name: comments comments_delete_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY comments_delete_own ON public.comments FOR DELETE TO authenticated USING ((user_id = auth.uid()));


--
-- Name: comments comments_insert_rt; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY comments_insert_rt ON public.comments FOR INSERT TO authenticated WITH CHECK (((user_id = auth.uid()) AND (item_id IN ( SELECT items.id
   FROM (public.items
     JOIN public.members ON ((items.rt_id = members.rt_id)))
  WHERE (members.profile_id = auth.uid())))));


--
-- Name: comments comments_update_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY comments_update_own ON public.comments FOR UPDATE TO authenticated USING ((user_id = auth.uid()));


--
-- Name: comments comments_view_rt; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY comments_view_rt ON public.comments FOR SELECT TO authenticated USING ((item_id IN ( SELECT items.id
   FROM (public.items
     JOIN public.members ON ((items.rt_id = members.rt_id)))
  WHERE (members.profile_id = auth.uid()))));


--
-- Name: items; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

--
-- Name: items items_delete; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY items_delete ON public.items FOR DELETE TO authenticated USING (((donor_id = auth.uid()) OR (rt_id IN ( SELECT members.rt_id
   FROM public.members
  WHERE ((members.profile_id = auth.uid()) AND (members.role = 'admin'::text))))));


--
-- Name: items items_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY items_insert ON public.items FOR INSERT TO authenticated WITH CHECK (((rt_id IN ( SELECT members.rt_id
   FROM public.members
  WHERE (members.profile_id = auth.uid()))) AND (donor_id = auth.uid())));


--
-- Name: items items_read; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY items_read ON public.items FOR SELECT TO authenticated USING ((rt_id IN ( SELECT members.rt_id
   FROM public.members
  WHERE (members.profile_id = auth.uid()))));


--
-- Name: items items_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY items_update ON public.items FOR UPDATE TO authenticated USING (((donor_id = auth.uid()) OR (rt_id IN ( SELECT members.rt_id
   FROM public.members
  WHERE ((members.profile_id = auth.uid()) AND (members.role = 'admin'::text))))));


--
-- Name: likes likes_all_access; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY likes_all_access ON public.likes TO authenticated USING (true);


--
-- Name: likes likes_insert_rt; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY likes_insert_rt ON public.likes FOR INSERT TO authenticated WITH CHECK (((user_id = auth.uid()) AND (item_id IN ( SELECT items.id
   FROM (public.items
     JOIN public.members ON ((items.rt_id = members.rt_id)))
  WHERE (members.profile_id = auth.uid())))));


--
-- Name: likes likes_view_rt; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY likes_view_rt ON public.likes FOR SELECT TO authenticated USING ((item_id IN ( SELECT items.id
   FROM (public.items
     JOIN public.members ON ((items.rt_id = members.rt_id)))
  WHERE (members.profile_id = auth.uid()))));


--
-- Name: members; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

--
-- Name: members members_own_data; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY members_own_data ON public.members TO authenticated USING ((profile_id = auth.uid()));


--
-- Name: members members_own_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY members_own_insert ON public.members FOR INSERT TO authenticated WITH CHECK ((profile_id = auth.uid()));


--
-- Name: members members_own_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY members_own_select ON public.members FOR SELECT TO authenticated USING ((profile_id = auth.uid()));


--
-- Name: members members_own_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY members_own_update ON public.members FOR UPDATE TO authenticated USING ((profile_id = auth.uid()));


--
-- Name: notifications notifications_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY notifications_insert ON public.notifications FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: notifications notifications_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY notifications_select ON public.notifications FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: notifications notifications_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY notifications_update ON public.notifications FOR UPDATE TO authenticated USING ((auth.uid() = user_id));


--
-- Name: profiles profiles_own_data; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY profiles_own_data ON public.profiles TO authenticated USING ((auth.uid() = id));


--
-- Name: profiles profiles_own_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY profiles_own_insert ON public.profiles FOR INSERT TO authenticated WITH CHECK ((auth.uid() = id));


--
-- Name: profiles profiles_own_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY profiles_own_select ON public.profiles FOR SELECT TO authenticated USING ((auth.uid() = id));


--
-- Name: profiles profiles_own_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY profiles_own_update ON public.profiles FOR UPDATE TO authenticated USING ((auth.uid() = id));


--
-- Name: requests; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;

--
-- Name: requests requests_delete_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY requests_delete_own ON public.requests FOR DELETE TO authenticated USING ((requester_id = auth.uid()));


--
-- Name: requests requests_insert_rt; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY requests_insert_rt ON public.requests FOR INSERT TO authenticated WITH CHECK (((requester_id = auth.uid()) AND (item_id IN ( SELECT items.id
   FROM (public.items
     JOIN public.members ON ((items.rt_id = members.rt_id)))
  WHERE (members.profile_id = auth.uid())))));


--
-- Name: requests requests_update_rt; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY requests_update_rt ON public.requests FOR UPDATE TO authenticated USING (((requester_id = auth.uid()) OR (item_id IN ( SELECT items.id
   FROM public.items
  WHERE (items.donor_id = auth.uid()))) OR (item_id IN ( SELECT items.id
   FROM (public.items
     JOIN public.members ON ((items.rt_id = members.rt_id)))
  WHERE ((members.profile_id = auth.uid()) AND (members.role = 'admin'::text))))));


--
-- Name: requests requests_view_rt; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY requests_view_rt ON public.requests FOR SELECT TO authenticated USING (((requester_id = auth.uid()) OR (item_id IN ( SELECT items.id
   FROM public.items
  WHERE (items.donor_id = auth.uid()))) OR (item_id IN ( SELECT items.id
   FROM (public.items
     JOIN public.members ON ((items.rt_id = members.rt_id)))
  WHERE ((members.profile_id = auth.uid()) AND (members.role = 'admin'::text))))));


--
-- Name: rts; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.rts ENABLE ROW LEVEL SECURITY;

--
-- Name: rts rts_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY rts_insert ON public.rts FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: rts rts_read; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY rts_read ON public.rts FOR SELECT TO authenticated USING (true);


--
-- Name: rts rts_read_all; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY rts_read_all ON public.rts FOR SELECT TO authenticated USING (true);


--
-- Name: rts rts_read_authenticated; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY rts_read_authenticated ON public.rts FOR SELECT TO authenticated USING (true);


--
-- Name: rts rts_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY rts_update ON public.rts FOR UPDATE TO authenticated USING ((id IN ( SELECT members.rt_id
   FROM public.members
  WHERE ((members.profile_id = auth.uid()) AND (members.role = 'admin'::text)))));


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT USAGE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;


--
-- Name: FUNCTION handle_new_user(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.handle_new_user() TO anon;
GRANT ALL ON FUNCTION public.handle_new_user() TO authenticated;
GRANT ALL ON FUNCTION public.handle_new_user() TO service_role;


--
-- Name: FUNCTION update_updated_at_column(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.update_updated_at_column() TO anon;
GRANT ALL ON FUNCTION public.update_updated_at_column() TO authenticated;
GRANT ALL ON FUNCTION public.update_updated_at_column() TO service_role;


--
-- Name: TABLE comments; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.comments TO anon;
GRANT ALL ON TABLE public.comments TO authenticated;
GRANT ALL ON TABLE public.comments TO service_role;


--
-- Name: TABLE items; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.items TO anon;
GRANT ALL ON TABLE public.items TO authenticated;
GRANT ALL ON TABLE public.items TO service_role;


--
-- Name: TABLE likes; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.likes TO anon;
GRANT ALL ON TABLE public.likes TO authenticated;
GRANT ALL ON TABLE public.likes TO service_role;


--
-- Name: TABLE item_stats; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.item_stats TO anon;
GRANT ALL ON TABLE public.item_stats TO authenticated;
GRANT ALL ON TABLE public.item_stats TO service_role;


--
-- Name: TABLE members; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.members TO anon;
GRANT ALL ON TABLE public.members TO authenticated;
GRANT ALL ON TABLE public.members TO service_role;


--
-- Name: TABLE notifications; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.notifications TO anon;
GRANT ALL ON TABLE public.notifications TO authenticated;
GRANT ALL ON TABLE public.notifications TO service_role;


--
-- Name: TABLE profiles; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.profiles TO anon;
GRANT ALL ON TABLE public.profiles TO authenticated;
GRANT ALL ON TABLE public.profiles TO service_role;


--
-- Name: TABLE requests; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.requests TO anon;
GRANT ALL ON TABLE public.requests TO authenticated;
GRANT ALL ON TABLE public.requests TO service_role;


--
-- Name: TABLE rts; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.rts TO anon;
GRANT ALL ON TABLE public.rts TO authenticated;
GRANT ALL ON TABLE public.rts TO service_role;


--
-- Name: TABLE user_request_stats; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.user_request_stats TO anon;
GRANT ALL ON TABLE public.user_request_stats TO authenticated;
GRANT ALL ON TABLE public.user_request_stats TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- PostgreSQL database dump complete
--

