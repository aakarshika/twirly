-- Categories
INSERT INTO categories (id, name) VALUES
(1, 'Laptops'),
(2, 'Fitness Trackers'),
(3, 'Smartphones');

-- Items (8 per category)
INSERT INTO items (id, name, description, image_url, category_id, price, comparison_type) VALUES
-- Laptops
(1, 'ZenBook Air', 'Lightweight laptop', 'https://images.pexels.com/photos/538969/pexels-photo-538969.jpeg', 1, 999.99, 'in-company'),
(2, 'ProMax 15', 'High-performance laptop', 'https://images.pexels.com/photos/18105/pexels-photo.jpg', 1, 1499.99, 'in-company'),
(3, 'EcoBook', 'Eco-friendly laptop', 'https://images.pexels.com/photos/18105/pexels-photo.jpg', 1, 799.99, 'in-company'),
(4, 'LiteSlate', 'Affordable laptop', 'https://images.pexels.com/photos/18105/pexels-photo.jpg', 1, 599.99, 'in-company'),
(5, 'GigaGo', 'Gaming beast', 'https://images.pexels.com/photos/538969/pexels-photo-538969.jpeg', 1, 1799.99, 'in-company'),
(6, 'NotePro', 'Notebook style', 'https://images.pexels.com/photos/538969/pexels-photo-538969.jpeg', 1, 699.99, 'in-company'),
(7, 'SwiftEdge', 'Ultraportable', 'https://images.pexels.com/photos/538969/pexels-photo-538969.jpeg', 1, 1099.99, 'in-company'),
(8, 'BookFlex', 'Convertible laptop', 'https://images.pexels.com/photos/538969/pexels-photo-538969.jpeg', 1, 1199.99, 'in-company'),
-- Fitness Trackers
(9, 'FitPulse', 'Track your fitness', 'https://images.pexels.com/photos/267394/pexels-photo-267394.jpeg', 2, 149.99, 'in-company'),
(10, 'StepCore', 'Step counter', 'https://images.pexels.com/photos/267394/pexels-photo-267394.jpeg', 2, 99.99, 'in-company'),
(11, 'RunMate', 'Running companion', 'https://images.pexels.com/photos/267394/pexels-photo-267394.jpeg', 2, 199.99, 'in-company'),
(12, 'CardioBand', 'Heart monitor', 'https://images.pexels.com/photos/267394/pexels-photo-267394.jpeg', 2, 129.99, 'in-company'),
(13, 'FlexTrack', 'Flexible band', 'https://images.pexels.com/photos/267394/pexels-photo-267394.jpeg', 2, 119.99, 'in-company'),
(14, 'SleepGuide', 'Sleep monitor', 'https://images.pexels.com/photos/267394/pexels-photo-267394.jpeg', 2, 109.99, 'in-company'),
(15, 'WellnessLoop', 'Daily wellness', 'https://images.pexels.com/photos/267394/pexels-photo-267394.jpeg', 2, 139.99, 'in-company'),
(16, 'FitRing', 'Minimal wearable', 'https://images.pexels.com/photos/267394/pexels-photo-267394.jpeg', 2, 89.99, 'in-company'),
-- Smartphones
(17, 'SmartX A1', 'Flagship phone', 'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg', 3, 899.99, 'in-company'),
(18, 'GalaxyTune', 'High-end Android', 'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg', 3, 799.99, 'in-company'),
(19, 'PixelGo', 'Google assistant', 'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg', 3, 699.99, 'in-company'),
(20, 'OneFlash', 'Blazing fast', 'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg', 3, 599.99, 'in-company'),
(21, 'CamPro', 'Camera phone', 'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg', 3, 749.99, 'in-company'),
(22, 'BriteMini', 'Compact design', 'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg', 3, 549.99, 'in-company'),
(23, 'NoteMax', 'Large screen', 'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg', 3, 849.99, 'in-company'),
(24, 'ZoomX', 'Zoom master', 'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg', 3, 799.99, 'in-company');


-- Comparison sets (3 per category)
INSERT INTO comparison_sets (id, name, category_id, user_id) VALUES
(1, 'Laptop Showdown A', 1, '21f4d21e-8048-4725-ad57-1c7cabb451a5'),
(2, 'Laptop Showdown B', 1, '7cf77001-a493-42e5-8d0e-3ad977c77ce2'),
(3, 'Laptop Showdown C', 1, '21f4d21e-8048-4725-ad57-1c7cabb451a5'),
(4, 'Fitness Battle A', 2, '7cf77001-a493-42e5-8d0e-3ad977c77ce2'),
(5, 'Fitness Battle B', 2, '21f4d21e-8048-4725-ad57-1c7cabb451a5'),
(6, 'Fitness Battle C', 2, '7cf77001-a493-42e5-8d0e-3ad977c77ce2'),
(7, 'Phone Faceoff A', 3, '21f4d21e-8048-4725-ad57-1c7cabb451a5'),
(8, 'Phone Faceoff B', 3, '7cf77001-a493-42e5-8d0e-3ad977c77ce2'),
(9, 'Phone Faceoff C', 3, '21f4d21e-8048-4725-ad57-1c7cabb451a5');

-- Comparison set items (4 per set)
INSERT INTO comparison_set_items (id, set_id, item_id) VALUES
-- Laptop Showdown A
(1, 1, 1), (2, 1, 2), (3, 1, 3), (4, 1, 4),
-- Laptop Showdown B
(5, 2, 5), (6, 2, 6), (7, 2, 7), (8, 2, 8),
-- Laptop Showdown C
(9, 3, 2), (10, 3, 4), (11, 3, 6), (12, 3, 8),
-- Fitness Battle A
(13, 4, 9), (14, 4, 10), (15, 4, 11), (16, 4, 12),
-- Fitness Battle B
(17, 5, 13), (18, 5, 14), (19, 5, 15), (20, 5, 16),
-- Fitness Battle C
(21, 6, 10), (22, 6, 12), (23, 6, 14), (24, 6, 16),
-- Phone Faceoff A
(25, 7, 17), (26, 7, 18), (27, 7, 19), (28, 7, 20),
-- Phone Faceoff B
(29, 8, 21), (30, 8, 22), (31, 8, 23), (32, 8, 24),
-- Phone Faceoff C
(33, 9, 18), (34, 9, 20), (35, 9, 22), (36, 9, 24);

-- VOTES
INSERT INTO votes (id, user_id, set_id, item_id) VALUES
(1, '21f4d21e-8048-4725-ad57-1c7cabb451a5', 1, 2),
(2, '21f4d21e-8048-4725-ad57-1c7cabb451a5', 4, 10),
(3, '21f4d21e-8048-4725-ad57-1c7cabb451a5', 7, 18),
(4, '21f4d21e-8048-4725-ad57-1c7cabb451a5', 9, 24),
(5, '21f4d21e-8048-4725-ad57-1c7cabb451a5', 5, 13),
(6, '7cf77001-a493-42e5-8d0e-3ad977c77ce2', 2, 5),
(7, '7cf77001-a493-42e5-8d0e-3ad977c77ce2', 5, 14),
(8, '7cf77001-a493-42e5-8d0e-3ad977c77ce2', 8, 22),
(9, '7cf77001-a493-42e5-8d0e-3ad977c77ce2', 3, 6),
(10, '7cf77001-a493-42e5-8d0e-3ad977c77ce2', 6, 16);

-- REVIEWS
INSERT INTO reviews (id, user_id, item_id, text) VALUES
(1, '21f4d21e-8048-4725-ad57-1c7cabb451a5', 1, 'Impressive performance and sleek design.'),
(2, '21f4d21e-8048-4725-ad57-1c7cabb451a5', 2, 'Impressive performance and sleek design.'),
(3, '21f4d21e-8048-4725-ad57-1c7cabb451a5', 10, 'Accurate tracking and comfortable to wear.'),
(4, '7cf77001-a493-42e5-8d0e-3ad977c77ce2', 5, 'Great for gaming, but battery life could be better.'),
(5, '7cf77001-a493-42e5-8d0e-3ad977c77ce2', 14, 'Lightweight and easy to use during workouts.'),
(6, '21f4d21e-8048-4725-ad57-1c7cabb451a5', 1, 'Perfect for my daily tasks and very portable.'),
(7, '7cf77001-a493-42e5-8d0e-3ad977c77ce2', 15, 'Stylish design with reliable health metrics.'),
(8, '7cf77001-a493-42e5-8d0e-3ad977c77ce2', 6, 'Affordable yet packed with features.'),
(9, '21f4d21e-8048-4725-ad57-1c7cabb451a5', 8, 'Versatile and user-friendly interface.');

-- REVIEW METRICS
INSERT INTO review_metrics (id, review_id, metric_name, value) VALUES
-- For review_id 1 (Laptop)
(1, 1, 'Performance', 4.5),
(2, 1, 'Battery Life', 4.0),
(3, 1, 'Design', 5.0),
(4, 1, 'Portability', 4.8),
-- For review_id 2 (Laptop)
(5, 2, 'Performance', 4.7),
(6, 2, 'Battery Life', 4.5),
(7, 2, 'Design', 4.8),
(8, 2, 'Portability', 4.6),
-- For review_id 3 (Fitness Tracker)
(9, 3, 'Accuracy', 4.7),
(10, 3, 'Comfort', 4.5),
(11, 3, 'Battery Life', 4.2),
(12, 3, 'Durability', 4.6),
-- For review_id 4 (Laptop)
(13, 4, 'Performance', 4.8),
(14, 4, 'Graphics', 4.9),
(15, 4, 'Cooling', 4.3),
(16, 4, 'Value for Money', 4.0),
-- For review_id 5 (Fitness Tracker)
(17, 5, 'Step Tracking', 4.6),
(18, 5, 'Heart Rate Monitoring', 4.4),
(19, 5, 'App Integration', 4.2),
(20, 5, 'Battery Life', 4.3),
-- For review_id 6 (Laptop)
(21, 6, 'Portability', 5.0),
(22, 6, 'Battery Life', 4.7),
(23, 6, 'Build Quality', 4.8),
(24, 6, 'Performance', 4.6),
-- For review_id 7 (Fitness Tracker)
(25, 7, 'Design', 4.9),
(26, 7, 'Comfort', 4.7),
(27, 7, 'Functionality', 4.5),
(28, 7, 'Battery Life', 4.6),
-- For review_id 8 (Fitness Tracker)
(29, 8, 'Affordability', 4.8),
(30, 8, 'Features', 4.2),
(31, 8, 'Ease of Use', 4.5),
(32, 8, 'Battery Life', 4.3),
-- For review_id 9 (Laptop)
(33, 9, 'Versatility', 4.7),
(34, 9, 'User Interface', 4.6),
(35, 9, 'Performance', 4.5),
(36, 9, 'Design', 4.8);

-- Update image URLs with actual images
UPDATE items SET image_url = 'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg' WHERE id = 17; -- SmartX A1
UPDATE items SET image_url = 'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg' WHERE id = 18; -- GalaxyTune
UPDATE items SET image_url = 'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg' WHERE id = 19; -- PixelGo

UPDATE items SET image_url = 'https://images.pexels.com/photos/267394/pexels-photo-267394.jpeg' WHERE id = 12; -- CardioBand
UPDATE items SET image_url = 'https://images.pexels.com/photos/267394/pexels-photo-267394.jpeg' WHERE id = 13; -- FlexTrack
UPDATE items SET image_url = 'https://images.pexels.com/photos/267394/pexels-photo-267394.jpeg' WHERE id = 14; -- SleepGuide

UPDATE items SET image_url = 'https://images.pexels.com/photos/538969/pexels-photo-538969.jpeg' WHERE id = 1; -- ZenBook Air
UPDATE items SET image_url = 'https://images.pexels.com/photos/18105/pexels-photo.jpg' WHERE id = 2; -- ProMax 15
UPDATE items SET image_url = 'https://images.pexels.com/photos/18105/pexels-photo.jpg' WHERE id = 3; -- EcoBook
UPDATE items SET image_url = 'https://images.pexels.com/photos/18105/pexels-photo.jpg' WHERE id = 4; -- LiteSlate

UPDATE items SET image_url = 'https://images.pexels.com/photos/538969/pexels-photo-538969.jpeg' WHERE id = 6; -- NotePro
UPDATE items SET image_url = 'https://images.pexels.com/photos/538969/pexels-photo-538969.jpeg' WHERE id = 7; -- SwiftEdge


-- Insert dummy profiles (make sure to replace these UUIDs with actual user IDs from your auth.users table)
INSERT INTO public.profiles (id, username, created_at, updated_at)
VALUES 
  ('7cf77001-a493-42e5-8d0e-3ad977c77ce2', 'shivu', NOW(), NOW()),
  ('21f4d21e-8048-4725-ad57-1c7cabb451a5', 'akku', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;