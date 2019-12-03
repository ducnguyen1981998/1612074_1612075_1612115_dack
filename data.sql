-- Table: public.chuyenmuc

-- DROP TABLE public.chuyenmuc;

CREATE TABLE public.chuyenmuc
(
    idcm bigint NOT NULL,
    tencm text COLLATE pg_catalog."default",
    CONSTRAINT chuyenmuc_pkey PRIMARY KEY (idcm)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public.chuyenmuc
    OWNER to postgres;