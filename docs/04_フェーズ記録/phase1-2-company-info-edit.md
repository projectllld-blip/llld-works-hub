# phase1-2-company-info-edit

## Phase
v1.2 企業情報編集

## 状態
方針整理完了。

今回は実装しない。ログイン中企業アカウントが、自社の基本情報を確認・編集できるようにするための対象範囲、画面、RLS、入力チェック、保存方針を整理する。

## 現状確認

### company_accounts の想定カラム
既存migrationとdocs上、`company_accounts` は以下を持つ。

- `id`
- `owner_user_id`
- `email`
- `company_name`
- `contact_name`
- `business_type`
- `phone`
- `plan_status`
- `created_at`
- `updated_at`

現行DB構造には、住所、メモ、表示名の専用カラムはない。

### account.html の現在表示
`account.html` は現在、以下を表示している。

- 状態
- 会社名 / 店舗名 / 教室名
- 担当者名
- メールアドレス
- 業種
- プラン状態
- 登録日
- 更新日
- データ同期状態
- 利用中アプリ
- 検証用アプリ追加
- 最近使ったアプリ

### accountPage.js の現在取得
`assets/js/accountPage.js` は `AuthService.getCurrentAccount()` の結果を表示する。現時点では編集フォームや更新処理はない。

`AuthService.getCurrentAccount()` はSupabase modeで `company_accounts` から以下を取得している。

```text
id,email,company_name,contact_name,business_type,phone,plan_status,created_at,updated_at
```

### RLS確認
`supabase/migrations/20260625_v010_company_account_foundation.sql` には、`company_accounts_update_own` policy がある。

```text
using (owner_user_id = auth.uid())
with check (owner_user_id = auth.uid())
```

docs上も、`company_accounts` は自分の `owner_user_id` の行のみ select / insert / update できる方針。

ただし、実DBで現在もupdate policyが有効か、v1.2b実装前または実装後に人間確認が必要。

## v1.2で編集対象にしてよい候補
既存カラムだけで実装できる候補:

- 企業名: `company_name`
- 担当者名: `contact_name`
- 電話番号: `phone`
- 業種: `business_type`

慎重に扱うが、今回のMVPでは表示のみ候補:

- 連絡先メール: `email`

理由:
`email` は `company_accounts.email` として存在するが、ログインメールアドレスやSupabase Auth userのメールと混同しやすい。v1.2bではまず表示のみ、編集は人間判断後が安全。

現行DBにないためv1.2bでは編集対象にしない候補:

- 住所
- メモ
- 表示名

これらを編集対象にするにはDBカラム追加や別JSON保存方針が必要になる可能性があるため、v1.2ではPARKEDにする。

## 慎重に扱うもの
- `owner_user_id`
- Auth user情報
- 契約状態
- 支払い状態
- 権限
- 利用アプリ
- `app_instances`
- `app_data`
- RLSに関係するカラム
- `plan_status`
- `email`

## v1.2では編集しないもの
- Supabase Authユーザー
- ログインメールアドレス
- パスワード
- `owner_user_id`
- `app_instances`
- `app_data`
- `portal_state`本文
- 決済情報
- 契約情報
- 権限情報
- スタッフ情報
- 住所
- メモ
- 表示名

## 推奨画面

### 推奨: 案A account.html 内に企業情報編集フォームを追加
理由:
- ログイン中企業だけを編集する導線にしやすい。
- 既存の `account.html` が企業情報表示を担当している。
- 既存RLSの範囲で扱いやすい。
- MVPとして画面遷移が増えない。
- 未ログイン時やSupabase mode判定を既存処理に合わせやすい。

### 案B company-settings.html
将来候補。企業情報の項目が増え、住所、請求先、担当部署などを扱う段階で検討する。

### 案C admin.html
非推奨。`admin.html` はmock簡易管理者画面であり、v1.2の自社企業情報編集には使わない。

## RLS / 権限方針
- ログイン中ユーザーは自社 `company_accounts` だけ編集できる。
- 他社 `company_accounts` は編集できない。
- `owner_user_id` は変更しない。
- 管理者横断編集はv1.2では扱わない。
- `app_instances`、`app_data`、`portal_state` は編集しない。
- `plan_status` は契約状態に関わるため編集しない。
- 現行docs / migration上は `company_accounts_update_own` があるため、基本方針としては追加RLS不要。
- 実DBでupdate policyが有効かどうかは人間確認対象。

DB / RLS変更が必要になった場合は、v1.2b実装へ進まず `HUMAN_REQUIRED: YES` で停止する。

## 入力チェック方針
- 企業名: 必須。1〜80文字程度。
- 担当者名: 任意。ただし入力時は80文字程度まで。
- 電話番号: 任意。数字、ハイフン、括弧、スペース、+ のみ許可する軽いチェック。
- 業種: 既存候補から選択。`school`、`store`、`restaurant`、`small_business`、`consulting`、`personal`、`demo`。
- 連絡先メール: v1.2bでは表示のみ推奨。編集する場合はメール形式チェックとAuthメールとの違いを画面上で説明する必要がある。
- 空欄許可: 担当者名、電話番号。
- 保存前確認: 破壊的変更ではないため必須ではない。保存ボタン押下でよい。
- 保存成功: 短い成功メッセージを表示し、画面の表示値を更新する。
- 保存失敗: 入力値を消さず、再試行できる表示にする。
- 読込失敗: 編集フォームを無効化し、再読込導線を出す。
- 未ログイン: 既存account.htmlと同様にloginへ誘導する。

## 保存方針
- 保存対象テーブル: `company_accounts`
- 更新するカラム: `company_name`、`contact_name`、`business_type`、`phone`
- 更新しないカラム: `id`、`owner_user_id`、`email`、`plan_status`、`created_at`、`updated_at`
- `updated_at`: 既存DB trigger `set_company_accounts_updated_at` に任せる。フロントから直接更新しない。
- localStorage: 正本として使わない。未保存フォームの一時退避を入れる場合も別Phaseで検討する。
- 変更前データ: v1.2bでは画面上で保持し、キャンセルで読み込み時の値へ戻す。履歴保存やバックアップは扱わない。
- 保存条件: `AuthService.getCurrentAccount()` で取得したログイン中企業の `id` と、RLSで許可される自社行のみ。
- 更新方法案: Supabase clientから `company_accounts.update({...}).eq('id', account.id)` を行い、RLSで自社のみに制限する。

## v1.2b実装前に確認すること
- 実DBで `company_accounts_update_own` policy が有効であること。
- `company_accounts` に `phone` カラムがあること。
- `business_type` のcheck制約候補がdocsと一致していること。
- `email` を編集対象に含めるかは人間判断すること。
- 住所、メモ、表示名をv1.2bに含めないこと。

## STOP条件
- 本体UI / JS実装が必要な場合は、v1.2方針整理としては止まる。
- DB / RLS / migration変更が必要。
- Supabase Dashboard操作が必要。
- 管理用秘密キーが必要。
- Auth user情報編集に踏み込む。
- `app_instances` 編集に踏み込む。
- `app_data` 編集に踏み込む。
- 契約 / 決済 / 権限情報に踏み込む。
- どの企業情報を編集してよいか人間判断が必要。

## 次フェーズ案
`v1.2b 企業情報編集フォームMVP`

目的:
`account.html` 内に、ログイン中企業アカウントの基本情報を編集するMVPフォームを追加する。

触ってよい候補:
- `account.html`
- `assets/js/accountPage.js`
- `assets/js/authService.js`
- `docs/04_フェーズ記録/phase1-2-company-info-edit.md`
- `docs/00_PROJECT_STATUS.md`
- `docs/06_TASK_QUEUE.md`

編集対象:
- `company_name`
- `contact_name`
- `business_type`
- `phone`

編集しない:
- `owner_user_id`
- Auth user email
- password
- `email`。編集する場合は人間判断後。
- `plan_status`
- `app_instances`
- `app_data`
- `portal_state`
- 決済 / 契約 / 権限

実装前STOP:
- 実DBの `company_accounts_update_own` が確認できない。
- DB / RLS / migration変更が必要。
- Auth user情報編集が必要。
- メール編集を含める必要がある。
