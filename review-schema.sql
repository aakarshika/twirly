-- Review System Schema
-- This file contains the schema for the review system in Twirly
-- It includes tables for reviews, review metrics, and review likes

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS review_metrics CASCADE;
DROP TABLE IF EXISTS review_likes CASCADE;

-- Reviews table
-- Stores user-written reviews for items
-- Primary key: id
-- Foreign keys: user_id, item_id
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Review metrics table
-- Stores detailed rating metrics for reviews
-- Primary key: id
-- Foreign key: review_id
CREATE TABLE review_metrics (
    id SERIAL PRIMARY KEY,
    review_id INTEGER REFERENCES reviews(id) ON DELETE CASCADE,
    metric_name VARCHAR(50) NOT NULL,
    value DECIMAL(3,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Review likes table
-- Tracks which users have liked which reviews
-- Primary key: id
-- Foreign keys: user_id, review_id
-- Unique constraint: (user_id, review_id) to prevent duplicate likes
CREATE TABLE review_likes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    review_id INTEGER REFERENCES reviews(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, review_id)
);

-- Performance indexes
-- These indexes improve query performance for common review operations
CREATE INDEX idx_reviews_item_id ON reviews(item_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_review_metrics_review_id ON review_metrics(review_id);
CREATE INDEX idx_review_likes_review_id ON review_likes(review_id);
