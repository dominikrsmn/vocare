-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.
CREATE TABLE public.activities (
id uuid NOT NULL DEFAULT gen_random_uuid(),
created_at timestamp with time zone NOT NULL DEFAULT now(),
created_by uuid DEFAULT gen_random_uuid(),
appointment uuid DEFAULT gen_random_uuid(),
type text,
content text,
CONSTRAINT activities_pkey PRIMARY KEY (id),
CONSTRAINT activities_appointment_fkey FOREIGN KEY (appointment) REFERENCES public.appointments(id)
);
CREATE TABLE public.appointment_assignee (
id uuid NOT NULL DEFAULT gen_random_uuid(),
created_at timestamp with time zone NOT NULL DEFAULT now(),
appointment uuid DEFAULT gen_random_uuid(),
user uuid DEFAULT gen_random_uuid(),
user_type text DEFAULT 'relatives'::text,
CONSTRAINT appointment_assignee_pkey PRIMARY KEY (id),
CONSTRAINT appointment_assignee_appointment_fkey FOREIGN KEY (appointment) REFERENCES public.appointme
);
CREATE TABLE public.appointments (
id uuid NOT NULL DEFAULT gen_random_uuid(),
created_at timestamp with time zone NOT NULL DEFAULT now(),
updated_at timestamp with time zone,
start timestamp with time zone,
end timestamp with time zone,
location text,
patient uuid DEFAULT gen_random_uuid(),
attachements ARRAY,
category uuid DEFAULT gen_random_uuid(),
notes text,
title text,
CONSTRAINT appointments_pkey PRIMARY KEY (id),
CONSTRAINT appointments_patient_fkey FOREIGN KEY (patient) REFERENCES public.patients(id),
CONSTRAINT appointments_category_fkey FOREIGN KEY (category) REFERENCES public.categories(id)
);
CREATE TABLE public.categories (
id uuid NOT NULL DEFAULT gen_random_uuid(),
created_at timestamp with time zone NOT NULL DEFAULT now(),
updated_at timestamp with time zone,
label text,
description text,
color text DEFAULT '#00ff00'::text,
icon text,
CONSTRAINT categories_pkey PRIMARY KEY (id)
);
CREATE TABLE public.patients (
created_at timestamp with time zone NOT NULL DEFAULT now(),
firstname text,
lastname text,
birth_date timestamp with time zone,
care_level numeric,
pronoun text,
email text,
active boolean,
active_since timestamp with time zone,
id uuid NOT NULL DEFAULT gen_random_uuid(),
CONSTRAINT patients_pkey PRIMARY KEY (id)
);
CREATE TABLE public.relatives (
id uuid NOT NULL DEFAULT gen_random_uuid(),
created_at timestamp with time zone NOT NULL DEFAULT now(),
pronoun text,
firstname text,
lastname text,
notes text,
CONSTRAINT relatives_pkey PRIMARY KEY (id)
);