-- Twirly Database Schema
-- This file contains the core database schema for the Twirly application
-- It includes tables for users, items, comparisons, reviews, and analytics

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS items CASCADE;
DROP TABLE IF EXISTS comparison_sets CASCADE;
DROP TABLE IF EXISTS comparison_set_items CASCADE;
DROP TABLE IF EXISTS votes CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS review_metrics CASCADE;
DROP TABLE IF EXISTS review_likes CASCADE;
DROP TABLE IF EXISTS comparison_set_comments CASCADE;
DROP TABLE IF EXISTS comparison_set_comment_replies CASCADE;
DROP TABLE IF EXISTS comparison_set_comment_reactions CASCADE;
DROP TABLE IF EXISTS user_preferences CASCADE;
DROP TABLE IF EXISTS user_notification_settings CASCADE;
DROP TABLE IF EXISTS user_category_preferences CASCADE;


-- Categories table
-- Organizes items into categories for filtering and organization
-- Primary key: id
-- Unique constraint: name
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Items table
-- Core entity representing products/services that can be compared
-- Primary key: id
-- Foreign key: category_id references categories(id)
CREATE TABLE items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(255),
    category_id INTEGER REFERENCES categories(id),
    price DECIMAL(10,2),
    comparison_type VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);



-- Comparison sets table
-- Groups of items being compared in a poll
-- Primary key: id
-- Foreign keys: category_id, user_id
CREATE TABLE comparison_sets (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    category_id INTEGER REFERENCES categories(id),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Comparison set items table
-- Links items to comparison sets (many-to-many relationship)
-- Primary key: id
-- Foreign keys: set_id, item_id
CREATE TABLE comparison_set_items (
    id SERIAL PRIMARY KEY,
    set_id INTEGER REFERENCES comparison_sets(id) ON DELETE CASCADE,
    item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Votes table
-- Records user votes on items within comparison sets
-- Primary key: id
-- Foreign keys: user_id, item_id, set_id
CREATE TABLE votes (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
    set_id INTEGER REFERENCES comparison_sets(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Reviews table
-- Stores user-written reviews for items
-- Primary key: id
-- Foreign keys: user_id, item_id
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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
    set_id INTEGER REFERENCES comparison_sets(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Review likes table
-- Tracks which users have liked which reviews
-- Primary key: id
-- Foreign keys: user_id, review_id
-- Unique constraint: (user_id, review_id) to prevent duplicate likes
CREATE TABLE review_likes (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    review_id INTEGER REFERENCES reviews(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, review_id)
);

-- Comments table
CREATE TABLE comparison_set_comments (
    id SERIAL PRIMARY KEY,
    set_id INTEGER REFERENCES comparison_sets(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    dislikes_count INTEGER DEFAULT 0,
    replies_count INTEGER DEFAULT 0,
    is_edited BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Comment replies table
CREATE TABLE comparison_set_comment_replies (
    id SERIAL PRIMARY KEY,
    parent_comment_id INTEGER REFERENCES comparison_set_comments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    dislikes_count INTEGER DEFAULT 0,
    is_edited BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Comment reactions table
CREATE TABLE comparison_set_comment_reactions (
    id SERIAL PRIMARY KEY,
    comment_id INTEGER REFERENCES comparison_set_comments(id) ON DELETE CASCADE,
    reply_id INTEGER REFERENCES comparison_set_comment_replies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    reaction_type VARCHAR(10) CHECK (reaction_type IN ('like', 'dislike')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT reaction_target_check CHECK (
        (comment_id IS NOT NULL AND reply_id IS NULL) OR
        (comment_id IS NULL AND reply_id IS NOT NULL)
    ),
    CONSTRAINT unique_comment_reaction UNIQUE (user_id, comment_id),
    CONSTRAINT unique_reply_reaction UNIQUE (user_id, reply_id)
);

-- User preferences table
CREATE TABLE user_preferences (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(255) UNIQUE,
    display_name VARCHAR(255),
    bio TEXT,
    profile_image_url VARCHAR(255),
    theme_preference VARCHAR(50) DEFAULT 'light',
    language_preference VARCHAR(10) DEFAULT 'en',
    is_onboarding_complete BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- User notification settings table
CREATE TABLE user_notification_settings (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    marketing_emails BOOLEAN DEFAULT FALSE,
    vote_notifications BOOLEAN DEFAULT TRUE,
    comment_notifications BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- User category preferences table
CREATE TABLE user_category_preferences (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
    is_favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, category_id)
);

-- Performance indexes
-- These indexes improve query performance for common operations
CREATE INDEX idx_items_category_id ON items(category_id);
CREATE INDEX idx_votes_user_id ON votes(user_id);
CREATE INDEX idx_votes_item_id ON votes(item_id);
CREATE INDEX idx_votes_set_id ON votes(set_id);
CREATE INDEX idx_reviews_item_id ON reviews(item_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_review_metrics_review_id ON review_metrics(review_id);
CREATE INDEX idx_review_likes_review_id ON review_likes(review_id);
CREATE INDEX idx_comments_set_id ON comparison_set_comments(set_id);
CREATE INDEX idx_comments_user_id ON comparison_set_comments(user_id);
CREATE INDEX idx_replies_parent_id ON comparison_set_comment_replies(parent_comment_id);
CREATE INDEX idx_replies_user_id ON comparison_set_comment_replies(user_id);
CREATE INDEX idx_reactions_comment_id ON comparison_set_comment_reactions(comment_id);
CREATE INDEX idx_reactions_reply_id ON comparison_set_comment_reactions(reply_id);
CREATE INDEX idx_reactions_user_id ON comparison_set_comment_reactions(user_id);
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX idx_user_notification_settings_user_id ON user_notification_settings(user_id);
CREATE INDEX idx_user_category_preferences_user_id ON user_category_preferences(user_id);
CREATE INDEX idx_user_category_preferences_category_id ON user_category_preferences(category_id);
CREATE INDEX idx_review_metrics_set_id ON review_metrics(set_id);

-- Enable Row Level Security
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comparison_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE comparison_set_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE comparison_set_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comparison_set_comment_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE comparison_set_comment_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_category_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Items policies
CREATE POLICY "Anyone can view items"
  ON items FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create items"
  ON items FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Votes policies
CREATE POLICY "Anyone can view votes"
  ON votes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create and update their own votes"
  ON votes FOR ALL
  USING (auth.uid() = user_id);

-- Reviews policies
CREATE POLICY "Anyone can view reviews"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create and update their own reviews"
  ON reviews FOR ALL
  USING (auth.uid() = user_id);

-- Review likes policies
CREATE POLICY "Anyone can view review likes"
  ON review_likes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create and delete their own review likes"
  ON review_likes FOR ALL
  USING (auth.uid() = user_id);

-- Comparison sets policies
CREATE POLICY "Anyone can view comparison sets"
  ON comparison_sets FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create and update their own comparison sets"
  ON comparison_sets FOR ALL
  USING (auth.uid() = user_id);

-- Comparison set items policies
CREATE POLICY "Anyone can view comparison set items"
  ON comparison_set_items FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create comparison set items"
  ON comparison_set_items FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Comments policies
CREATE POLICY "Anyone can view comments"
  ON comparison_set_comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create and update their own comments"
  ON comparison_set_comments FOR ALL
  USING (auth.uid() = user_id);

-- User preferences policies
CREATE POLICY "Users can view their own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Item metric averages view
-- Aggregates review metrics by item and metric type
-- Provides average ratings and total review counts
CREATE OR REPLACE VIEW item_metric_averages AS
SELECT
    r.item_id,
    rm.metric_name,
    ROUND(AVG(rm.value), 2) AS avg_rating,
    COUNT(rm.id) AS total_reviews
FROM
    reviews r
JOIN review_metrics rm ON rm.review_id = r.id
GROUP BY
    r.item_id, rm.metric_name;

-- User activity summary view
-- Provides a comprehensive summary of user engagement
-- Includes total votes, reviews, polls posted, and likes received
CREATE VIEW user_activity_summary AS
SELECT
    u.id AS user_id,
    u.email,
    COALESCE(v.vote_count, 0) AS total_votes,
    COALESCE(r.review_count, 0) AS total_reviews,
    COALESCE(p.poll_count, 0) AS total_polls_posted,
    COALESCE(rl.likes_received, 0) AS total_likes_received
FROM
    auth.users u
LEFT JOIN (
    SELECT
        user_id,
        COUNT(*) AS vote_count
    FROM
        votes
    GROUP BY
        user_id
) v ON u.id = v.user_id
LEFT JOIN (
    SELECT
        user_id,
        COUNT(*) AS review_count
    FROM
        reviews
    GROUP BY
        user_id
) r ON u.id = r.user_id
LEFT JOIN (
    SELECT
        user_id,
        COUNT(*) AS poll_count
    FROM
        comparison_sets
    GROUP BY
        user_id
) p ON u.id = p.user_id
LEFT JOIN (
    SELECT
        r.user_id,
        COUNT(rl.id) AS likes_received
    FROM
        reviews r
    JOIN
        review_likes rl ON r.id = rl.review_id
    GROUP BY
        r.user_id
) rl ON u.id = rl.user_id;

-- Create a table for public profiles
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Create policies
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Create a trigger to automatically create a profile when a user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (new.id, new.raw_user_meta_data->>'username');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
