--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9 (Debian 16.9-1.pgdg120+1)
-- Dumped by pg_dump version 16.9 (Debian 16.9-1.pgdg120+1)

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: predictions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.predictions (
    id integer NOT NULL,
    user_email character varying,
    pclass integer,
    sex character varying,
    age double precision,
    sibsp integer,
    parch integer,
    fare double precision,
    embarked character varying,
    result character varying,
    probability double precision,
    created_at timestamp without time zone
);


ALTER TABLE public.predictions OWNER TO postgres;

--
-- Name: predictions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.predictions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.predictions_id_seq OWNER TO postgres;

--
-- Name: predictions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.predictions_id_seq OWNED BY public.predictions.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying,
    hashed_password character varying
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: predictions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.predictions ALTER COLUMN id SET DEFAULT nextval('public.predictions_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: predictions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.predictions (id, user_email, pclass, sex, age, sibsp, parch, fare, embarked, result, probability, created_at) FROM stdin;
1	kubodan014@gmail.com	1	female	30	1	2	50	C	Survived	0.9268142063973137	2025-05-14 13:17:23.955876
2	kubodan014@gmail.com	2	male	58	2	1	50	Q	Not Survived	0.0560530303676971	2025-05-14 13:17:40.226845
3	kubodan014@gmail.com	3	female	58	3	2	50	S	Not Survived	0.16020027060832595	2025-05-14 13:17:54.693585
4	kubodan014@gmail.com	2	male	34	3	1	50	C	Not Survived	0.10513569165852327	2025-05-14 13:18:15.867817
5	kubodan014@gmail.com	3	female	41	1	2	50	S	Not Survived	0.41101300745314007	2025-05-14 13:18:37.057583
6	kubodan014@gmail.com	1	female	30	1	2	50	S	Survived	0.9342987979045524	2025-05-14 13:18:46.338797
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, hashed_password) FROM stdin;
1	kubodan014@gmail.com	$2b$12$ds6hhX7X5a0QfIVg1Cmn3OTuo/JPiIJ6hOJ3lFl7fgfNZRtB8BPW.
\.


--
-- Name: predictions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.predictions_id_seq', 6, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 1, true);


--
-- Name: predictions predictions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.predictions
    ADD CONSTRAINT predictions_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: ix_predictions_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_predictions_id ON public.predictions USING btree (id);


--
-- Name: ix_predictions_user_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_predictions_user_email ON public.predictions USING btree (user_email);


--
-- Name: ix_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_users_email ON public.users USING btree (email);


--
-- Name: ix_users_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_users_id ON public.users USING btree (id);


--
-- PostgreSQL database dump complete
--

