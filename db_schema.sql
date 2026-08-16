CREATE DATABASE IF NOT EXISTS db_kas;
USE db_kas;

CREATE TABLE IF NOT EXISTS transactions (
  id BIGINT PRIMARY KEY,
  date DATE NOT NULL,
  type ENUM('income','expense','saving') NOT NULL,
  category VARCHAR(100) NOT NULL,
  amount INT NOT NULL,
  note TEXT DEFAULT NULL,
  plan_id BIGINT DEFAULT NULL,
  evidence MEDIUMTEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS plans (
  id BIGINT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  target_amount INT NOT NULL,
  mode ENUM('date','monthly') NOT NULL,
  target_date DATE DEFAULT NULL,
  monthly_fixed INT DEFAULT 0,
  purchase_link VARCHAR(500) DEFAULT NULL,
  evidence MEDIUMTEXT DEFAULT NULL,
  created_at DATE NOT NULL
);
