-- ============================================================
-- Secure International Payments Portal - Database Script
-- Database: MySQL 8.0+
-- ============================================================

CREATE DATABASE IF NOT EXISTS payments_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE payments_db;

-- ============================================================
-- Table: users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  Id            INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  FullName      VARCHAR(100)     NOT NULL,
  IdNumber      CHAR(13)         NOT NULL,
  AccountNumber VARCHAR(12)      NOT NULL,
  PasswordHash  VARCHAR(255)     NOT NULL,
  Role          ENUM('Customer','Admin') NOT NULL DEFAULT 'Customer',
  CreatedAt     DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (Id),
  UNIQUE KEY uq_account_number (AccountNumber),
  UNIQUE KEY uq_id_number      (IdNumber)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Table: payments
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
  Id            INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  UserId        INT UNSIGNED     NOT NULL,
  Amount        DECIMAL(18,2)    NOT NULL,
  Currency      VARCHAR(10)      NOT NULL,
  SwiftCode     VARCHAR(11)      NOT NULL,
  Receiver      VARCHAR(20)      NOT NULL,
  Status        ENUM('PENDING','VERIFIED','REJECTED') NOT NULL DEFAULT 'PENDING',
  CreatedAt     DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  VerifiedAt    DATETIME         NULL,
  PRIMARY KEY (Id),
  CONSTRAINT fk_payments_user
    FOREIGN KEY (UserId) REFERENCES users (Id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Seed: pre-registered Admin account
-- Password: Admin@1234  (bcrypt hash)
-- ============================================================
INSERT INTO users (FullName, IdNumber, AccountNumber, PasswordHash, Role)
VALUES (
  'System Administrator',
  '0000000000000',
  '000000000000',
  '$2a$12$vLi8JkBGwJVkH3rZz7gYaO5z1QK8N2mPxU4yW6tR9sL7cD1eX3fJi',
  'Admin'
);

-- ============================================================
-- Seed: demo Customer account
-- Password: Customer@1234  (bcrypt hash)
-- AccountNumber: 123456789012
-- IdNumber: 9001015009087
-- ============================================================
INSERT INTO users (FullName, IdNumber, AccountNumber, PasswordHash, Role)
VALUES (
  'Jane Customer',
  '9001015009087',
  '123456789012',
  '$2a$12$vLi8JkBGwJVkH3rZz7gYaO5z1QK8N2mPxU4yW6tR9sL7cD1eX3fJi',
  'Customer'
);
