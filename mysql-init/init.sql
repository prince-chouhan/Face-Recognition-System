CREATE DATABASE IF NOT EXISTS attendance_db;
USE attendance_db;

CREATE TABLE IF NOT EXISTS attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  confidence FLOAT,
  image_path VARCHAR(1024),
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
