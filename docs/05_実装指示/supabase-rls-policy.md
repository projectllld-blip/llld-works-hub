# Supabase RLS 方針

## 目的

将来Supabaseへ移行する際に、企業アカウントごとのデータ分離を徹底する。

RLS未設定のまま本番運用しない。

## 基本方針

- 企業アカウントは、自分の `company_account` のみ読める。
- `app_instances` は、自分の `company_account_id` のものだけ読める。
- `app_data` は、自分の `company_account_id` のものだけ読める。
- `audit_logs` は、自分の `company_account_id` のものだけ読める。
- すべての業務データは `company_account_id` で分離する。

## service role key

- Supabase service role keyはフロントに置かない。
- GitHub Pagesに置かない。
- HTML / JS / JSONに直書きしない。
- `.env` をGitHubに置かない。

## company_accounts

本人の企業アカウントだけ参照できるようにする。

本番化時は、Supabase Authの `auth.uid()` と `company_accounts` の紐づけ方法を確定する。

## app_instances

`company_account_id` が本人の企業アカウントと一致する行だけ読み書きできるようにする。

## app_data

`company_account_id` が本人の企業アカウントと一致する行だけ読み書きできるようにする。

勤怠、座席、PDF作業、面談メモなどは必ずこの制約を通す。

## audit_logs

`company_account_id` が本人の企業アカウントと一致するログだけ読めるようにする。

ログは改ざんしにくい扱いにする。通常ユーザーが自由に削除できる設計にしない。

## 将来スタッフアカウントを追加する場合

今は実装しない。

将来必要になった場合は、以下のようなテーブルを追加検討する。

- `company_users`
- `account_members`

その際も、ユーザー単位ではなく `company_account_id` を軸にデータを分離する。

## 勤怠データの扱い

勤怠データは最初のDB化対象にしない。

理由:

- 修正履歴が必要。
- 労務リスクがある。
- スタッフ情報を含む可能性が高い。
- audit_logsとセットで扱う必要がある。

クラウド保存の初回候補は、座席管理やPDFツール設定など、リスクが比較的低いものから始める。
