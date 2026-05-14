CREATE OR REPLACE FUNCTION mark_set_viewed(
  _user_id UUID,
  _set_id INTEGER
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO user_views (user_id, set_id)
  VALUES (_user_id, _set_id)
  ON CONFLICT (user_id, set_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql; 