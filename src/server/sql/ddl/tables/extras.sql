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
