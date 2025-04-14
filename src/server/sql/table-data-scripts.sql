
-- USERS
INSERT INTO users (id, username, email, password_hash) VALUES
  (1, 'alice', 'alice@example.com', 'hashedpassword1'),
  (2, 'bob', 'bob@example.com', 'hashedpassword2'),
  (3, 'carol', 'carol@example.com', 'hashedpassword3'),
  (4, 'dave', 'dave@example.com', 'hashedpassword4'),
  (5, 'eve', 'eve@example.com', 'hashedpassword5');

-- COMPANIES
INSERT INTO companies (name) VALUES
  ('TechNova'),
  ('FitGenius');

-- CATEGORIES
INSERT INTO categories (name) VALUES
  ('Laptops'),
  ('Fitness Trackers'),
  ('Smartphones');

-- ITEMS (8 per category)
INSERT INTO items (name, description, image_url, category_id, price, comparison_type) VALUES
-- Laptops
('ZenBook Air', 'Lightweight laptop', 'https://source.unsplash.com/featured/?laptop', 1,  999.99, 'in-company'),
('ProMax 15', 'High-performance laptop', 'https://source.unsplash.com/featured/?macbook', 1,  1499.99, 'in-company'),
('EcoBook', 'Eco-friendly laptop', 'https://source.unsplash.com/featured/?green-laptop', 1,  799.99, 'in-company'),
('LiteSlate', 'Affordable laptop', 'https://source.unsplash.com/featured/?budget-laptop', 1,  599.99, 'in-company'),
('GigaGo', 'Gaming beast', 'https://source.unsplash.com/featured/?gaming-laptop', 1,  1799.99, 'in-company'),
('NotePro', 'Notebook style', 'https://source.unsplash.com/featured/?notebook-laptop', 1,  699.99, 'in-company'),
('SwiftEdge', 'Ultraportable', 'https://source.unsplash.com/featured/?ultrabook', 1,  1099.99, 'in-company'),
('BookFlex', 'Convertible laptop', 'https://source.unsplash.com/featured/?2in1-laptop', 1,  1199.99, 'in-company'),
-- Fitness Trackers
('FitPulse', 'Track your fitness', 'https://source.unsplash.com/featured/?fitness-tracker', 2,  149.99, 'in-company'),
('StepCore', 'Step counter', 'https://source.unsplash.com/featured/?step-tracker', 2,  99.99, 'in-company'),
('RunMate', 'Running companion', 'https://source.unsplash.com/featured/?running-watch', 2,  199.99, 'in-company'),
('CardioBand', 'Heart monitor', 'https://source.unsplash.com/featured/?heart-tracker', 2,  129.99, 'in-company'),
('FlexTrack', 'Flexible band', 'https://source.unsplash.com/featured/?smart-band', 2,  119.99, 'in-company'),
('SleepGuide', 'Sleep monitor', 'https://source.unsplash.com/featured/?sleep-tracker', 2,  109.99, 'in-company'),
('WellnessLoop', 'Daily wellness', 'https://source.unsplash.com/featured/?wellness-band', 2,  139.99, 'in-company'),
('FitRing', 'Minimal wearable', 'https://source.unsplash.com/featured/?fitness-ring', 2,  89.99, 'in-company'),
-- Smartphones
('SmartX A1', 'Flagship phone', 'https://source.unsplash.com/featured/?smartphone', 3,  899.99, 'in-company'),
('GalaxyTune', 'High-end Android', 'https://source.unsplash.com/featured/?android-phone', 3,  799.99, 'in-company'),
('PixelGo', 'Google assistant', 'https://source.unsplash.com/featured/?google-phone', 3,  699.99, 'in-company'),
('OneFlash', 'Blazing fast', 'https://source.unsplash.com/featured/?fast-phone', 3,  599.99, 'in-company'),
('CamPro', 'Camera phone', 'https://source.unsplash.com/featured/?camera-phone', 3,  749.99, 'in-company'),
('BriteMini', 'Compact design', 'https://source.unsplash.com/featured/?small-phone', 3,  549.99, 'in-company'),
('NoteMax', 'Large screen', 'https://source.unsplash.com/featured/?large-phone', 3,  849.99, 'in-company'),
('ZoomX', 'Zoom master', 'https://source.unsplash.com/featured/?zoom-camera', 3,  799.99, 'in-company');

-- COMPARISON SETS (9 total, 3 per category)
INSERT INTO comparison_sets (name, category_id) VALUES
('Laptop Showdown A', 1),
('Laptop Showdown B', 1),
('Laptop Showdown C', 1),
('Fitness Battle A', 2),
('Fitness Battle B', 2),
('Fitness Battle C', 2),
('Phone Faceoff A', 3),
('Phone Faceoff B', 3),
('Phone Faceoff C', 3);


-- COMPARISON_SET_ITEMS (4 per set)
-- Laptop Showdown A
INSERT INTO comparison_set_items (set_id, item_id) VALUES
-- Laptop Showdown A
(1, 1), (1, 2), (1, 3), (1, 4),
-- Laptop Showdown B
(2, 5), (2, 6), (2, 7), (2, 8),
-- Laptop Showdown C
(3, 2), (3, 4), (3, 6), (3, 8),
-- Fitness Battle A
(4, 9), (4, 10), (4, 11), (4, 12),
-- Fitness Battle B
(5, 13), (5, 14), (5, 15), (5, 16),
-- Fitness Battle C
(6, 10), (6, 12), (6, 14), (6, 16),
-- Phone Faceoff A
(7, 17), (7, 18), (7, 19), (7, 20),
-- Phone Faceoff B
(8, 21), (8, 22), (8, 23), (8, 24),
-- Phone Faceoff C
(9, 18), (9, 20), (9, 22), (9, 24);

-- TODO: Insert votes and reviews next
-- VOTES
INSERT INTO votes (user_id, set_id, item_id) VALUES
(1, 1, 2),
(1, 4, 10),
(1, 7, 18),
(1, 9, 24),
(1, 5, 13),

(2, 2, 5),
(2, 5, 14),
(2, 8, 22),
(2, 3, 6),
(2, 6, 16),

(3, 1, 1),
(3, 4, 9),
(3, 7, 17),
(3, 8, 21),

(4, 2, 6),
(4, 5, 15),
(4, 9, 24),
(4, 3, 7),
(4, 6, 14),

(5, 3, 8),
(5, 6, 12),
(5, 7, 19),
(5, 9, 20),
(5, 4, 11);

-- REVIEWS
INSERT INTO reviews (user_id, item_id, text) VALUES
(1, 2, 'Impressive performance and sleek design.'),
(1, 10, 'Accurate tracking and comfortable to wear.'),

(2, 5, 'Great for gaming, but battery life could be better.'),
(2, 14, 'Lightweight and easy to use during workouts.'),

(3, 1, 'Perfect for my daily tasks and very portable.'),

(4, 15, 'Stylish design with reliable health metrics.'),
(4, 6, 'Affordable yet packed with features.'),

(5, 8, 'Versatile and user-friendly interface.');

-- REVIEW METRICS
-- For review_id 1 (Laptop)
-- For review_id 1 (Laptop)
INSERT INTO review_metrics (review_id, metric_name, value) VALUES
(1, 'Performance', 4.5),
(1, 'Battery Life', 4.0),
(1, 'Design', 5.0),
(1, 'Portability', 4.8);

-- For review_id 2 (Fitness Tracker)
INSERT INTO review_metrics (review_id, metric_name, value) VALUES
(2, 'Accuracy', 4.7),
(2, 'Comfort', 4.5),
(2, 'Battery Life', 4.2),
(2, 'Durability', 4.6);

-- For review_id 3 (Laptop)
INSERT INTO review_metrics (review_id, metric_name, value) VALUES
(3, 'Performance', 4.8),
(3, 'Graphics', 4.9),
(3, 'Cooling', 4.3),
(3, 'Value for Money', 4.0);

-- For review_id 4 (Fitness Tracker)
INSERT INTO review_metrics (review_id, metric_name, value) VALUES
(4, 'Step Tracking', 4.6),
(4, 'Heart Rate Monitoring', 4.4),
(4, 'App Integration', 4.2),
(4, 'Battery Life', 4.3);

-- For review_id 5 (Laptop)
INSERT INTO review_metrics (review_id, metric_name, value) VALUES
(5, 'Portability', 5.0),
(5, 'Battery Life', 4.7),
(5, 'Build Quality', 4.8),
(5, 'Performance', 4.6);

-- For review_id 6 (Fitness Tracker)
INSERT INTO review_metrics (review_id, metric_name, value) VALUES
(6, 'Design', 4.9),
(6, 'Comfort', 4.7),
(6, 'Functionality', 4.5),
(6, 'Battery Life', 4.6);

-- For review_id 7 (Fitness Tracker)
INSERT INTO review_metrics (review_id, metric_name, value) VALUES
(7, 'Affordability', 4.8),
(7, 'Features', 4.2),
(7, 'Ease of Use', 4.5),
(7, 'Battery Life', 4.3);

-- For review_id 8 (Laptop)
INSERT INTO review_metrics (review_id, metric_name, value) VALUES
(8, 'Versatility', 4.7),
(8, 'User Interface', 4.6),
(8, 'Performance', 4.5),
(8, 'Design', 4.8);



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