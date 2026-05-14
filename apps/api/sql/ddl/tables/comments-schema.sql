-- Comments System Schema
-- This file contains the schema for the comments system in Twirly
-- It includes tables for comments, replies, and reactions on comparison sets

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS comparison_set_comments CASCADE;
DROP TABLE IF EXISTS comparison_set_comment_replies CASCADE;
DROP TABLE IF EXISTS comparison_set_comment_reactions CASCADE;

-- Top-level comments table for comparison sets (polls)
-- Stores comments made on comparison sets
-- Primary key: id
-- Foreign keys: set_id, user_id
-- Tracks likes, dislikes, and reply counts
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

-- Replies table (second-level comments only)
-- Stores replies to top-level comments
-- Primary key: id
-- Foreign keys: parent_comment_id, user_id
-- Tracks likes and dislikes
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

-- Reactions table for both comments and replies
-- Tracks user reactions (likes/dislikes) on comments and replies
-- Primary key: id
-- Foreign keys: comment_id, reply_id, user_id
-- Constraints:
--   - Reaction must be either for a comment OR a reply, not both
--   - One reaction per user per comment/reply
CREATE TABLE comparison_set_comment_reactions (
    id SERIAL PRIMARY KEY,
    comment_id INTEGER REFERENCES comparison_set_comments(id) ON DELETE CASCADE,
    reply_id INTEGER REFERENCES comparison_set_comment_replies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    reaction_type VARCHAR(10) CHECK (reaction_type IN ('like', 'dislike')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    -- Ensure reaction is either for a comment OR a reply, not both
    CONSTRAINT reaction_target_check CHECK (
        (comment_id IS NOT NULL AND reply_id IS NULL) OR
        (comment_id IS NULL AND reply_id IS NOT NULL)
    ),
    -- Prevent multiple reactions from same user on same comment/reply
    CONSTRAINT unique_comment_reaction UNIQUE (user_id, comment_id),
    CONSTRAINT unique_reply_reaction UNIQUE (user_id, reply_id)
);

-- Performance indexes
-- These indexes improve query performance for common comment operations
CREATE INDEX idx_comments_set_id ON comparison_set_comments(set_id);
CREATE INDEX idx_comments_user_id ON comparison_set_comments(user_id);
CREATE INDEX idx_replies_parent_id ON comparison_set_comment_replies(parent_comment_id);
CREATE INDEX idx_replies_user_id ON comparison_set_comment_replies(user_id);
CREATE INDEX idx_reactions_comment_id ON comparison_set_comment_reactions(comment_id);
CREATE INDEX idx_reactions_reply_id ON comparison_set_comment_reactions(reply_id);
CREATE INDEX idx_reactions_user_id ON comparison_set_comment_reactions(user_id);

-- RLS Policies for comment replies
CREATE POLICY "Anyone can view comment replies"
  ON comparison_set_comment_replies FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create and update their own replies"
  ON comparison_set_comment_replies FOR ALL
  USING (auth.uid() = user_id);


-- RLS Policies for comment replies
CREATE POLICY "Anyone can view comment replies"
  ON comparison_set_comment_reactions FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create and update their own replies"
  ON comparison_set_comment_reactions FOR ALL
  USING (auth.uid() = user_id);