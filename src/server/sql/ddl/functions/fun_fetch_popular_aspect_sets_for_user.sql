create or replace function fetch_popular_aspect_sets_for_user(v_user_id uuid)
returns setof popular_comparison_sets as $$
begin
  return query
  select cas.*
  from popular_comparison_sets cas
  left join votes v on v.set_id = cas.aspect_set_id
  where v.id is null
  order by cas.created_at desc;
end;
$$ language plpgsql;
