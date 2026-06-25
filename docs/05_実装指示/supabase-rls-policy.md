# Supabase RLS 方針

## 目的

将来Supabaseへ移行する際に、企業アカウントごとのデータ分離を徹底する。

RLS未設定のまま本番運用しない。

## 基本方針

- 企業アカウントは、自分の `company_accounts.owner_user_id = auth.uid()` のものだけ読める。
- `app_instances` は、`company_account_id` 経由で自分の企業アカウントに紐づくものだけ読める。
- `app_data` は、`company_account_id` 経由で自分の企業アカウントに紐づくものだけ読める。
- `audit_logs` は、`company_account_id` 経由で自分の企業アカウントに紐づくものだけ読める。
- すべての業務データは `company_account_id` で分離する。

## service role key

- Supabase service role keyはフロントに置かない。
- GitHub Pagesに置かない。
- HTML / JS / JSONに直書きしない。
- `.env` をGitHubに置かない。

## company_accounts

本人の企業アカウントだけ参照できるようにする。

v0.10のSQLでは、以下を基本にする。

```text
company_accounts.owner_user_id = auth.uid()
```

insert / select / update は自分の `owner_user_id` のみ許可する。

deleteはポリシーを作らず、原則禁止にする。

## app_instances

`company_account_id` が本人の企業アカウントと一致する行だけ読み書きできるようにする。

所有確認は以下で行う。

```sql
exists (
  select 1
  from public.company_accounts ca
  where ca.id = app_instances.company_account_id
    and ca.owner_user_id = auth.uid()
)
```

## app_data

`company_account_id` が本人の企業アカウントと一致する行だけ読み書きできるようにする。

勤怠、座席、PDF作業、面談メモなどは必ずこの制約を通す。

他社データ混入を防ぐ最重要キーは `company_account_id`。

## audit_logs

`company_account_id` が本人の企業アカウントと一致するログだけ読めるようにする。

ログは改ざんしにくい扱いにする。通常ユーザーが自由に削除できる設計にしない。

v0.10のSQLでは、select / insertのみを許可し、update / deleteポリシーは作らない。

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

## v0.10 SQLとの対応

対応SQL:

```text
supabase/migrations/20260625_v010_company_account_foundation.sql
```

このSQLでは以下を行う。

- `company_accounts / apps / app_instances / app_data / audit_logs` を作成
- RLSを有効化
- `company_accounts.owner_user_id = auth.uid()` のpolicyを作成
- `app_instances / app_data / audit_logs` は `company_account_id` 経由で所有確認
- `apps` はカタログとしてselectのみ許可
- フロントからappsのinsert / update / deleteは許可しない
