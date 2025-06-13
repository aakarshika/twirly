-- View to join sets with their categories
CREATE OR REPLACE VIEW categorized_sets AS
SELECT 
  cs.id as set_id,
  cs.name as set_name,
  cs.created_at,
  c.id as category_id,
  c.name as category_name,
  vs.viral_score
FROM comparison_sets cs
JOIN set_categories sc ON sc.set_id = cs.id
JOIN categories c ON c.id = sc.category_id
LEFT JOIN viral_sets vs ON vs.id = cs.id; 