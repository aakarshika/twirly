
SELECT setval(pg_get_serial_sequence('review_likes', 'id'), COALESCE((SELECT MAX(id) FROM review_likes), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('review_metrics', 'id'), COALESCE((SELECT MAX(id) FROM review_metrics), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('reviews', 'id'), COALESCE((SELECT MAX(id) FROM reviews), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('votes', 'id'), COALESCE((SELECT MAX(id) FROM votes), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('comparison_set_comment_reactions', 'id'), COALESCE((SELECT MAX(id) FROM comparison_set_comment_reactions), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('comparison_set_comment_replies', 'id'), COALESCE((SELECT MAX(id) FROM comparison_set_comment_replies), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('comparison_set_comments', 'id'), COALESCE((SELECT MAX(id) FROM comparison_set_comments), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('comparison_set_items', 'id'), COALESCE((SELECT MAX(id) FROM comparison_set_items), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('comparison_sets', 'id'), COALESCE((SELECT MAX(id) FROM comparison_sets), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('item_metrics', 'id'), COALESCE((SELECT MAX(id) FROM item_metrics), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('items', 'id'), COALESCE((SELECT MAX(id) FROM items), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('user_category_preferences', 'id'), COALESCE((SELECT MAX(id) FROM user_category_preferences), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('categories', 'id'), COALESCE((SELECT MAX(id) FROM categories), 0) + 1, false);