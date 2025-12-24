-- REALTIME SCHEMA TABLES
-- Consolidated from monolithic schema.sql

-- subscription
CREATE TRIGGER tr_check_filters BEFORE INSERT OR UPDATE ON realtime.subscription FOR EACH ROW EXECUTE FUNCTION realtime.subscription_check_filters();

-- messages
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;
