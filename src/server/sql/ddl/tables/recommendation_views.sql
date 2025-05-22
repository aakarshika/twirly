drop function fetch_popular_aspect_sets_for_user(v_user_id uuid);
drop view popular_comparison_sets;

drop view if exists comparison_set_vote_counts;
CREATE OR REPLACE VIEW comparison_set_vote_counts AS
SELECT 
    csa.set_id,
    COUNT(*) as total_votes
FROM votes v
JOIN comparison_set_aspects csa ON v.set_id = csa.id
GROUP BY csa.set_id;

drop view if exists comparison_set_comment_counts;
CREATE OR REPLACE VIEW comparison_set_comment_counts AS
SELECT 
    csa.set_id,
    COUNT(*) as total_comments
FROM comparison_set_comments csc
JOIN comparison_set_aspects csa ON csc.set_id = csa.id
GROUP BY csa.set_id;

CREATE OR REPLACE VIEW popular_comparison_sets AS
WITH activity_scores AS (
    SELECT 
        entity_id as set_id,
        SUM(
            CASE 
                WHEN activity_type = 'comparison_set_view' THEN 1
                WHEN activity_type = 'vote' THEN 2
                WHEN activity_type = 'vote_revert' THEN -2
                WHEN activity_type = 'comment' THEN 5
                WHEN activity_type = 'comment_reply' THEN 3
                WHEN activity_type = 'like_comparison_set' THEN 3
                WHEN activity_type = 'dislike_comparison_set' THEN -3
                WHEN activity_type = 'unlike_comparison_set' THEN -3
                WHEN activity_type = 'undislike_comparison_set' THEN 3
                WHEN activity_type = 'create_comparison_set' THEN 10
                WHEN activity_type = 'edit_comparison_set' THEN 5
                ELSE 0
            END * 
            -- Time decay factor: activities from last 7 days get full weight, older activities get less weight
            GREATEST(0.1, 1 - EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - created_at)) / (7 * 24 * 3600))
        ) as popularity_score
    FROM user_activity_log
    WHERE entity_type = 'comparison_set'
    GROUP BY entity_id
)
SELECT 
    cs.id as set_id,
    cs.user_id,
    cs.name,
    cs.created_at,
    cs.category_id,
    (
        select concat((select string_agg(csa.metric_name, ' ') 
            from comparison_set_aspects csa
            where csa.set_id = cs.id
            group by csa.set_id), ' ',cs.name, ' ',
        (select string_agg(i.name, ' ') 
            from comparison_set_items csi
            join items i on csi.item_id = i.id
            where csi.set_id = cs.id
            group by csi.set_id))
     ) as all_stuff_names,
    COALESCE(vc.total_votes, 0) as total_votes,
    COALESCE(cc.total_comments, 0) as total_comments,
    COALESCE(activity_scores.popularity_score, 0) as popularity_score
FROM comparison_sets cs
LEFT JOIN activity_scores ON cs.id = activity_scores.set_id
LEFT JOIN comparison_set_vote_counts vc ON cs.id = vc.set_id
LEFT JOIN comparison_set_comment_counts cc ON cs.id = cc.set_id
WHERE cs.is_published = true
ORDER BY popularity_score DESC;

drop  VIEW searchable_items ;
CREATE VIEW searchable_items AS
SELECT 
    i.*,
    COALESCE(AVG(r.likes), 0) AS avg_likes,
    COUNT(r.id) AS review_count
FROM items i
LEFT JOIN reviews r ON i.id = r.item_id
GROUP BY i.id
ORDER BY avg_likes DESC, review_count DESC;

create or replace function fetch_popular_aspect_sets_for_user(v_user_id uuid)
returns setof popular_comparison_sets as $$
begin
  return query
  with user_preferred_categories as (
    select category_id 
    from user_category_preferences 
    where user_id = v_user_id 
    and is_favorite = true
  ),
  category_boosted_sets as (
    select 
      pcs.*,
      case 
        when pcs.category_id in (select category_id from user_preferred_categories) then 1.5
        else 1.0
      end as category_boost
    from popular_comparison_sets pcs
  )
  select 
    set_id,
    user_id,
    name,
    created_at,
    category_id,
    all_stuff_names,
    total_votes,
    total_comments,
    popularity_score * category_boost as popularity_score
  from category_boosted_sets
  where v_user_id is null 
    or v_user_id not in (
      select v.user_id 
      from votes v 
      join comparison_set_aspects csa on v.set_id = csa.id 
      where csa.set_id = category_boosted_sets.set_id
    )
  order by popularity_score desc;
end;
$$ language plpgsql;
