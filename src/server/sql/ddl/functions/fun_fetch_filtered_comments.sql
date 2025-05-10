create or replace function fetch_filtered_comments(search text)
returns setof comparison_set_comments as $$
begin
  return query
  select c.*
  from comparison_set_comments c
  where c.text ilike '%' || search || '%'
     or exists (
       select 1
       from comparison_set_comment_replies r
       where r.comment_id = c.id
         and r.text ilike '%' || search || '%'
     );
end;
$$ language plpgsql;
