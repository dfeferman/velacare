-- Prevent UPDATE and DELETE on audit_log (INSERT-only table)
CREATE OR REPLACE FUNCTION prevent_audit_log_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION
    'audit_log ist INSERT-only — % auf Zeile % ist nicht erlaubt',
    TG_OP, OLD.id;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_log_insert_only
BEFORE UPDATE OR DELETE ON audit_log
FOR EACH ROW EXECUTE FUNCTION prevent_audit_log_modification();
