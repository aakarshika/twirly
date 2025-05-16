drop function fetch_popular_aspect_sets_for_user(v_user_id uuid);


drop view popular_comparison_sets;
CREATE OR REPLACE VIEW popular_comparison_sets AS
SELECT 
    cs.id as set_id,
    cs.user_id,
    cs.name,
    csa.description,
    cs.category_id,
    cs.created_at,
    csa.metric_name,
    csa.id as aspect_set_id,
    votes_count.total_votes,
    comments_count.total_comments,
    COALESCE(votes_count.total_votes, 0) * 2 + COALESCE(comments_count.total_comments, 0) AS popularity_score
FROM comparison_set_aspects csa 
join comparison_sets cs on cs.id = csa.set_id and cs.is_published = true
LEFT JOIN (
    SELECT 
        v.set_id, 
        COUNT(v.id) AS total_votes
    FROM votes v
    GROUP BY v.set_id
) votes_count ON csa.id = votes_count.set_id
LEFT JOIN (
    SELECT 
        csc.set_id, 
        COUNT(csc.id) AS total_comments
    FROM comparison_set_comments csc 
    GROUP BY csc.set_id
) comments_count ON csa.id = comments_count.set_id
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
  select cas.*
  from popular_comparison_sets cas
  where v_user_id is null or v_user_id not in (select vv.user_id from votes vv where vv.set_id = cas.aspect_set_id)
  order by cas.popularity_score desc;
end;
$$ language plpgsql;
