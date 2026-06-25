-- v0.14 SeatFlow cloud layout save constraints
-- One SeatFlow layout row per app instance and data type.

create unique index if not exists app_data_instance_type_unique
on public.app_data(app_instance_id, data_type);
