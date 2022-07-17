CREATE TABLE IF NOT EXISTS users (
     id                   SERIAL PRIMARY KEY,
     email                VARCHAR(256) NOT NULL UNIQUE CHECK (LOWER(email) = email),
     role                 VARCHAR(24) NOT NULL,
     created_at           TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, 
     updated_at           TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
     password             VARCHAR(128) NOT NULL

);

CREATE TABLE IF NOT EXISTS user_profile (
      id                 SERIAL PRIMARY KEY,
      user_id             INTEGER REFERENCES users(id) ON DELETE CASCADE,
      bio                VARCHAR(512),
      display_name        VARCHAR(64) NOT NULL,
      gender             VARCHAR(32),
      phone              VARCHAR(64),
      profile_photo        VARCHAR(512)

);
