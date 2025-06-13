CREATE OR REPLACE VIEW top_categories AS
SELECT
  c.id AS category_id,
  c.name AS category_name,
  COUNT(sc.set_id) AS set_count
FROM categories c
LEFT JOIN set_categories sc ON sc.category_id = c.id
GROUP BY c.id, c.name
ORDER BY c.name ASC, set_count DESC;


drop view top_category_groups;
CREATE OR REPLACE VIEW top_category_groups AS
SELECT
  LOWER(SPLIT_PART(c.name, ' ', 1)) AS category_group,
  ARRAY_AGG(DISTINCT c.id) AS included_categories,
  COUNT(sc.set_id) AS set_count
FROM categories c
LEFT JOIN set_categories sc ON sc.category_id = c.id
GROUP BY category_group
ORDER BY set_count DESC, category_group ASC;