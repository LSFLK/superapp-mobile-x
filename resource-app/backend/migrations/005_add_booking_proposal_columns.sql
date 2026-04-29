-- Add proposal time range fields for booking status proposals
ALTER TABLE bookings
    ADD COLUMN proposed_start_time TIMESTAMP NULL,
    ADD COLUMN proposed_end_time TIMESTAMP NULL;
