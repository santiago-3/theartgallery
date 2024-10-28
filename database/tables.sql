create table authors (
    id          serial          unique,
    name        varchar(255)    not null    unique,
    link        varchar(255)    not null    unique
);

create table styles (
    id          serial          unique,
    name        varchar(255)    not null
);

create table images (
    id          serial          unique,
    name        varchar(255)    not null,
    width       integer         not null,
    height      integer         not null,
    type        varchar(255)    not null
);

create table paintings (
    id          serial          unique,
    name        varchar(255)    not null,
    year        smallint,
    image_id    integer         not null    REFERENCES images (id),
    author_id   integer         not null    REFERENCES authors (id),
    style_id    integer         not null    REFERENCES styles (id),
    description bpchar          not null,
    UNIQUE (author_id, name)
);

create table tags (
    id      serial unique,
    name    varchar(255)    not null    unique
);

create table paintings_tags (
    painting_id integer REFERENCES paintings (id) not null,
    tag_id      integer REFERENCES tags (id) not null,
    UNIQUE (painting_id, tag_id)
) 
