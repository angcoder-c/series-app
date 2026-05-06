CREATE TABLE IF NOT EXISTS users (
    id            SERIAL       PRIMARY KEY,
    email         VARCHAR(100) NOT NULL UNIQUE,
    password_hash TEXT         NOT NULL,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS genres (
    id   SERIAL      PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS series (
    id              SERIAL       PRIMARY KEY,
    title           VARCHAR(200) NOT NULL,
    description     TEXT,
    image_url       TEXT,
    image_public_id VARCHAR(200),
    release_year    SMALLINT,
    status          VARCHAR(20) CHECK (status IN ('ongoing', 'ended', 'cancelled', 'upcoming')),
    total_seasons   SMALLINT CHECK (total_seasons IS NULL OR total_seasons >= 0),
    total_episodes  SMALLINT CHECK (total_episodes IS NULL OR total_episodes >= 0),
    created_by      INTEGER      REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS series_genres (
    series_id INTEGER NOT NULL REFERENCES series(id) ON DELETE CASCADE,
    genre_id  INTEGER NOT NULL REFERENCES genres(id) ON DELETE CASCADE,
    PRIMARY KEY (series_id, genre_id)
);

CREATE TABLE IF NOT EXISTS ratings (
    id         SERIAL      PRIMARY KEY,
    series_id  INTEGER     NOT NULL REFERENCES series(id) ON DELETE CASCADE,
    user_id    INTEGER     NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
    score      SMALLINT    NOT NULL CHECK (score BETWEEN 1 AND 5),
    comment    TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (series_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_series_title ON series (title);
CREATE INDEX IF NOT EXISTS idx_series_created_by ON series (created_by);
CREATE INDEX IF NOT EXISTS idx_ratings_series ON ratings (series_id);
CREATE INDEX IF NOT EXISTS idx_ratings_user ON ratings (user_id);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_series_updated_at ON series;
CREATE TRIGGER trg_series_updated_at
BEFORE UPDATE ON series
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_ratings_updated_at ON ratings;
CREATE TRIGGER trg_ratings_updated_at
BEFORE UPDATE ON ratings
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();