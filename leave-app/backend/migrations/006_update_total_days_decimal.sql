-- migrations/006_update_total_days_decimal.sql

ALTER TABLE leaves
    MODIFY COLUMN total_days DECIMAL(3,1) NOT NULL DEFAULT 0.0;
