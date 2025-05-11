ALTER TABLE comparison_set_comments
ADD CONSTRAINT fk_comments_user
FOREIGN KEY (user_id)  -- or whatever your user reference column is called
REFERENCES profiles(id);

ALTER TABLE comparison_set_comment_replies
ADD CONSTRAINT fk_replies_user
FOREIGN KEY (user_id)  -- or whatever your user reference column is called
REFERENCES profiles(id);

   ALTER TABLE reviews
   ADD CONSTRAINT fk_reviews_user
   FOREIGN KEY (user_id)  -- or the actual column name that references profiles
   REFERENCES profiles(id);

-- Enable Row Level Security for items table
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to update their own items
CREATE POLICY "Users can update their own items"
ON items
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to select their own items
CREATE POLICY "Users can view their own items"
ON items
FOR SELECT
USING (auth.uid() = user_id);

-- Policy to allow users to insert their own items
CREATE POLICY "Users can insert their own items"
ON items
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to delete their own items
CREATE POLICY "Users can delete their own items"
ON items
FOR DELETE
USING (auth.uid() = user_id);

-- Enable Row Level Security for comparison_set_aspects table
ALTER TABLE comparison_set_aspects ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to view aspects
CREATE POLICY "Anyone can view comparison set aspects"
ON comparison_set_aspects
FOR SELECT
USING (true);

-- Policy to allow users to manage their own aspects
CREATE POLICY "Users can manage their own aspects"
ON comparison_set_aspects
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM comparison_sets
    WHERE comparison_sets.id = comparison_set_aspects.set_id
    AND comparison_sets.user_id = auth.uid()
  )
);

-- Rate limiting for authentication attempts
CREATE POLICY "Rate limit auth attempts"
ON auth.users
FOR ALL
USING (
  (SELECT COUNT(*) FROM auth.users 
   WHERE created_at > NOW() - INTERVAL '1 hour') < 10
);

-- Rate limiting for API endpoints
CREATE POLICY "Rate limit API requests"
ON items
FOR ALL
USING (
  (SELECT COUNT(*) FROM items 
   WHERE created_at > NOW() - INTERVAL '1 minute') < 100
);

-- Rate limiting for comments
CREATE POLICY "Rate limit comments"
ON comparison_set_comments
FOR ALL
USING (
  (SELECT COUNT(*) FROM comparison_set_comments 
   WHERE user_id = auth.uid() 
   AND created_at > NOW() - INTERVAL '1 minute') < 5
);
