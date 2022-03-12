-- Drop and create tasks table

DROP TABLE IF EXISTS tasks CASCADE;
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY NOT NULL,
  user_id INTEGER REFERENCES lists(id),
  description TEXT,
  category VARCHAR(255) NOT NULL,
  is_complete BOOLEAN NOT NULL,
  date_completed DATE
);
