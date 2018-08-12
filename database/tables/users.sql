create table public.users
(
    id serial primary key,
    email text unique not null,
    name text,
    merchant_id text unique not null,
    merchant_type integer,
    access_token text
)
with (
    OIDS = FALSE
)
tablespace pg_default;

alter table public.users
    owner to postgres;