-- Drop and create tasks table

DROP TABLE IF EXISTS tasks CASCADE;
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY NOT NULL,
  user_id INTEGER REFERENCES users(id),
  description TEXT,
  category VARCHAR(255) NOT NULL,
  is_complete SMALLINT NOT NULL,
  date_completed DATE
);
