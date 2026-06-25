-- LLLD Works Hub / Works Market v0.10 seed data.
-- This seed only inserts the public app catalog.
-- It does not create demo company accounts because those depend on auth.users.

insert into public.apps (app_key, name, description, status)
values
  ('attendance', '勤怠管理', '出勤・退勤・勤怠ログを扱うための業務アプリ。DB化は労務リスクを踏まえて後続フェーズで検討します。', 'beta'),
  ('seatflow', '座席管理 SeatFlow', '教室や店舗の座席配置を管理するアプリ。クラウド保存の初回候補です。', 'active'),
  ('pdf_tool', 'PDF編集', 'PDFの結合・分割・整理を行うツール。設定同期の候補です。', 'active'),
  ('quiz_maker', '小テスト作成', '教材データから小テストを作成するツール。問題セット保存は後続フェーズで検討します。', 'beta'),
  ('meeting_support', '面談支援', '面談資料やヒアリング内容を整理する支援ツール。', 'beta'),
  ('sales_talk_support', '営業トーク支援', '営業・提案時の会話整理を支援するツール。', 'beta')
on conflict (app_key) do update
set
  name = excluded.name,
  description = excluded.description,
  status = excluded.status,
  updated_at = now();
