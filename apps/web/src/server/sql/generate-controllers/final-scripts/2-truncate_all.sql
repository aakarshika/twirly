-- Start a transaction
BEGIN;

-- 1. Truncate all tables except for user-related ones
-- Disable foreign key constraints temporarily
SET session_replication_role = 'replica';

-- Truncate tables in proper order to handle dependencies
TRUNCATE TABLE review_likes CASCADE;
TRUNCATE TABLE review_metrics CASCADE;
TRUNCATE TABLE reviews CASCADE;
TRUNCATE TABLE votes CASCADE;
TRUNCATE TABLE comparison_set_comment_reactions CASCADE;
TRUNCATE TABLE comparison_set_comment_replies CASCADE;
TRUNCATE TABLE comparison_set_comments CASCADE;
TRUNCATE TABLE comparison_set_items CASCADE;
TRUNCATE TABLE comparison_sets CASCADE;
TRUNCATE TABLE item_metrics CASCADE;
TRUNCATE TABLE items CASCADE;
TRUNCATE TABLE user_category_preferences CASCADE;
TRUNCATE TABLE categories CASCADE;

-- Re-enable foreign key constraints
SET session_replication_role = 'origin';

-- Commit the transaction
COMMIT;