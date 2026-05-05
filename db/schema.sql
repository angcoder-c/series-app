CREATE TABLE users (
    id               SERIAL       PRIMARY KEY,
    username         VARCHAR(50)  NOT NULL UNIQUE,
    email            VARCHAR(100) NOT NULL UNIQUE,
    hashed_password  TEXT         NOT NULL,
    is_active        BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE genres (
    id   SERIAL      PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE series (
    id               SERIAL       PRIMARY KEY,
    title            VARCHAR(200) NOT NULL,
    synopsis         TEXT,
    release_year     SMALLINT,
    status           VARCHAR(20)  CHECK (status IN ('ongoing','ended','cancelled','upcoming')),
    total_seasons    SMALLINT,
    total_episodes   SMALLINT,
    image_url        TEXT,
    image_public_id  VARCHAR(200),
    created_by       INTEGER      NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE series_genres (
    series_id INTEGER NOT NULL REFERENCES series(id) ON DELETE CASCADE,
    genre_id  INTEGER NOT NULL REFERENCES genres(id) ON DELETE CASCADE,
    PRIMARY KEY (series_id, genre_id)
);

CREATE TABLE ratings (
    id         SERIAL      PRIMARY KEY,
    series_id  INTEGER     NOT NULL REFERENCES series(id) ON DELETE CASCADE,
    user_id    INTEGER     NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
    score      SMALLINT    NOT NULL CHECK (score BETWEEN 1 AND 5),
    comment    TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (series_id, user_id)
);

-- Índices
CREATE INDEX idx_series_title      ON series (title);
CREATE INDEX idx_series_status     ON series (status);
CREATE INDEX idx_series_created_by ON series (created_by);
CREATE INDEX idx_ratings_series    ON ratings (series_id);
CREATE INDEX idx_ratings_user      ON ratings (user_id);