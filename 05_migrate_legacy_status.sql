-- Data Migration for Status Refactoring
-- Updates legacy records with status 'convertito' to 'approvato'.
-- Since 'convertito' is no longer used in the UI/Logic as a primary status, 
-- we normallize these records to 'approvato'. The presence of 'convertito_in_noleggio_id'
-- will indicate the operational status.

UPDATE prev_noleggi
SET stato = 'approvato'
WHERE stato = 'convertito';
