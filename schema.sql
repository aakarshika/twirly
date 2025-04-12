DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS items CASCADE;
DROP TABLE IF EXISTS item_metrics CASCADE;
DROP TABLE IF EXISTS comparison_sets CASCADE;
DROP TABLE IF EXISTS comparison_set_items CASCADE;
DROP TABLE IF EXISTS votes CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS review_metrics CASCADE;
DROP TABLE IF EXISTS review_likes CASCADE;
-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Companies table
CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    industry VARCHAR(255),
    website VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Items table
CREATE TABLE items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(255),
    category_id INTEGER REFERENCES categories(id),
    company_id INTEGER REFERENCES companies(id),
    price DECIMAL(10,2),
    comparison_type VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Item metrics table
CREATE TABLE item_metrics (
    id SERIAL PRIMARY KEY,
    item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
    views INTEGER DEFAULT 0,
    comparisons INTEGER DEFAULT 0,
    reviews INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Comparison sets table (updated)
CREATE TABLE comparison_sets (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    category_id INTEGER REFERENCES categories(id),
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE, -- 🆕 added creator of the poll
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Comparison set items table
CREATE TABLE comparison_set_items (
    id SERIAL PRIMARY KEY,
    set_id INTEGER REFERENCES comparison_sets(id) ON DELETE CASCADE,
    item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Votes table
CREATE TABLE votes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
    set_id INTEGER REFERENCES comparison_sets(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Reviews table
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
CREATE TABLE review_metrics (
    id SERIAL PRIMARY KEY,
    review_id INTEGER REFERENCES reviews(id) ON DELETE CASCADE,
    metric_name VARCHAR(50) NOT NULL,
    value DECIMAL(3,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Review likes table
CREATE TABLE review_likes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    review_id INTEGER REFERENCES reviews(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, review_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_items_category_id ON items(category_id);
CREATE INDEX idx_items_company_id ON items(company_id);
CREATE INDEX idx_votes_user_id ON votes(user_id);
CREATE INDEX idx_votes_item_id ON votes(item_id);
CREATE INDEX idx_votes_set_id ON votes(set_id);
CREATE INDEX idx_reviews_item_id ON reviews(item_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_review_metrics_review_id ON review_metrics(review_id);
CREATE INDEX idx_review_likes_review_id ON review_likes(review_id);

-- Create view for item metric averages
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


CREATE VIEW user_activity_summary AS
SELECT
    u.id AS user_id,
    u.username,
    COALESCE(v.vote_count, 0) AS total_votes,
    COALESCE(r.review_count, 0) AS total_reviews,
    COALESCE(p.poll_count, 0) AS total_polls_posted,
    COALESCE(rl.likes_received, 0) AS total_likes_received
FROM
    users u
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
