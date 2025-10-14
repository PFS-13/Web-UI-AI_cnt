-- --
-- -- PostgreSQL database dump
-- --

-- \restrict E0aumuyYp254HTvRJFuS9XqokDdZIoTD6eMvxHEtb584xWdM2scQ6i3b4UQuDDj

-- -- Dumped from database version 17.5 (84bec44)
-- -- Dumped by pg_dump version 18.0

-- SET statement_timeout = 0;
-- SET lock_timeout = 0;
-- SET idle_in_transaction_session_timeout = 0;
-- SET transaction_timeout = 0;
-- SET client_encoding = 'UTF8';
-- SET standard_conforming_strings = on;
-- SELECT pg_catalog.set_config('search_path', '', false);
-- SET check_function_bodies = false;
-- SET xmloption = content;
-- SET client_min_messages = warning;
-- SET row_security = off;



-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


-- COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


CREATE TYPE public.provider AS ENUM (
    'google',
    'manual',
);


--
-- Name: token_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.token_type AS ENUM (
    'auth',
    'forgot_password'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: attached_message; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.attached_message (
    id integer NOT NULL,
    filename character varying(50),
    message_id integer
);


--
-- Name: attached_message_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.attached_message ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.attached_message_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: conversations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.conversations (
    conversation_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    title character varying(50),
    user_id uuid NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    last_updated timestamp without time zone DEFAULT now() NOT NULL,
    shared_url uuid,
    shared_path character varying
);


--
-- Name: message; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.message (
    id integer NOT NULL,
    conversation_id uuid NOT NULL,
    content text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    is_attach_file boolean,
    is_user boolean,
    edited_from_message_id integer,
    parent_message_id integer
);


--
-- Name: message_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.message ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.message_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: token; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.token (
    id integer NOT NULL,
    code character varying(255) NOT NULL,
    expired_date timestamp without time zone DEFAULT (now() + '1 day'::interval) NOT NULL,
    user_id uuid NOT NULL,
    token_type public.token_type
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    email character varying(255) NOT NULL,
    password character varying(255),
    provider public.provider NOT NULL,
    username character varying(255),
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    is_active boolean DEFAULT false,
    image_url character varying(255)
);


--
-- Name: verificaiton_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.token ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.verificaiton_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Data for Name: attached_message; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.attached_message (id, filename, message_id) FROM stdin;
--
-- Name: attached_message_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.attached_message_id_seq', 1, false);


--
-- Name: message_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.message_id_seq', 124, true);


--
-- Name: verificaiton_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.verificaiton_id_seq', 65, true);


--
-- Name: attached_message attached_message_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attached_message
    ADD CONSTRAINT attached_message_pkey PRIMARY KEY (id);


--
-- Name: conversations conversations_conversation_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_conversation_id_key UNIQUE (conversation_id);


--
-- Name: conversations conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_pkey PRIMARY KEY (conversation_id);


--
-- Name: users id_prikey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT id_prikey PRIMARY KEY (id);


--
-- Name: message message_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message
    ADD CONSTRAINT message_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: token verificaiton_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.token
    ADD CONSTRAINT verificaiton_pkey PRIMARY KEY (id);


--
-- Name: idx_message_conversation_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_message_conversation_id ON public.message USING btree (conversation_id);


--
-- Name: idx_message_conversation_id_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_message_conversation_id_created_at ON public.message USING btree (conversation_id, created_at);


--
-- Name: idx_message_edited_from; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_message_edited_from ON public.message USING btree (edited_from_message_id);


--
-- Name: idx_message_parent_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_message_parent_id ON public.message USING btree (parent_message_id);


--
-- Name: message constraint_conversation; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message
    ADD CONSTRAINT constraint_conversation FOREIGN KEY (conversation_id) REFERENCES public.conversations(conversation_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: message constraint_edit_from; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message
    ADD CONSTRAINT constraint_edit_from FOREIGN KEY (edited_from_message_id) REFERENCES public.message(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: message constraint_reply_from; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message
    ADD CONSTRAINT constraint_reply_from FOREIGN KEY (parent_message_id) REFERENCES public.message(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: conversations constraint_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT constraint_user FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: token fkey_userId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.token
    ADD CONSTRAINT "fkey_userId" FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: attached_message message_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attached_message
    ADD CONSTRAINT message_id FOREIGN KEY (message_id) REFERENCES public.message(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict E0aumuyYp254HTvRJFuS9XqokDdZIoTD6eMvxHEtb584xWdM2scQ6i3b4UQuDDj

