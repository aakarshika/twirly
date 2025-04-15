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
