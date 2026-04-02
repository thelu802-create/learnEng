select
  pt.id,
  pt.title,
  pt.note,
  pt.due_date,
  pt.due_time,
  pt.priority,
  pt.repeat_weekly,
  pt.completed,
  pt.user_id,
  p.display_name,
  p.role,
  pt.created_at,
  pt.updated_at
from public.planner_tasks pt
left join public.profiles p on p.id = pt.user_id
order by pt.due_date asc, pt.due_time asc, pt.created_at asc;
