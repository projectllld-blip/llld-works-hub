# v1.7d 無料 / β版 app_instances反映MVP

## Phase

v1.7d 無料 / β版 app_instances反映MVP

## 状態

実装済み / 人間確認待ち。

今回は `purchase-confirm.html` の無料 / β版利用開始確認後に、対象アプリだけを `app_instances` へ正式反映するMVPを実装した。

Supabase migration、RLS、DB定義、`data/contents.json`、`data/site-config.json` は変更していない。

## 目的

v1.6までの `sessionStorage` 一時追加から一歩進め、無料 / β版のうち人間確認済みの少数アプリだけを、ログイン中企業アカウントの正式な利用中アプリとして `app_instances` へ反映する。

有料 / サブスク、準備中、開発相談、社内限定、購入者向け旧アプリ追加申請は対象外。

## 実装した内容

- `purchase-confirm.html` に `assets/js/appInstanceService.js` を読み込むようにした。
- `assets/js/appInstanceService.js` に無料 / β版限定の固定allowlistと `reflectFreeBetaAppInstance()` を追加した。
- `assets/js/purchaseConfirmPage.js` で、無料 / β版の確認後にSupabase modeでは `app_instances` 反映を優先するようにした。
- mock modeでは既存の `sessionStorage` 一時追加挙動を残した。
- 有料 / サブスクは既存どおり購入確認のみで、`app_instances` にも `sessionStorage` にも追加しない。

## allowlist対象app_key

| slug | app_key | priceType | app_instances.status | 扱い |
|---|---|---|---|---|
| `pdf-tool` | `pdf_tool` | `free` | `active` | 無料アプリとして正式反映 |
| `quiz-maker` | `quiz_maker` | `free-beta` | `trial` | β版 / trialとして正式反映 |

## allowlist対象外

以下は `app_instances` へ反映しない。

- `dakokun` / `attendance`
- `seatflow`
- `meeting_support`
- `subsidy-templates`
- `monthly-operations-checklist`
- `sales_talk_support`
- `dakokun-custom`
- `seatflow-classroom-custom`
- `internal-portal-build`
- `internal-operations`
- 有料 / サブスク
- 準備中
- 開発相談
- 導入相談
- 社内限定

## status別処理

| 既存status | 処理 |
|---|---|
| `active` | 何もしない。重複insertしない。利用中として扱う。 |
| `trial` | 何もしない。重複insertしない。β版利用中として扱う。 |
| `paused` | allowlist対象のみ、`pdf_tool` は `active`、`quiz_maker` は `trial` へ戻す。 |
| `disabled` | 絶対に更新しない。ユーザー操作では復活させない。 |
| 既存なし | allowlist対象のみinsertする。 |

`disabled` の場合は、以下の文言を返す。

```text
このアプリは運営側で停止されています。再開が必要な場合はお問い合わせください。
```

## 重複防止

- insert前に `company_account_id + app_key` で既存確認する。
- 既存があれば重複insertしない。
- unique violationが起きた場合は再取得し、既存レコードとして扱う。

## sessionStorageとの関係

- Supabase mode:
  - `app_instances` を正本として反映する。
  - 反映成功時は `sessionStorage` 一時追加へは進まない。
  - allowlist外、未ログイン、RLS / DBエラー時は正式反映しない。
- mock mode:
  - Supabase DB処理は行わない。
  - v1.6までの `sessionStorage` 一時追加で操作感を確認する。
- paid / subscription:
  - `app_instances` に追加しない。
  - `sessionStorage` にも追加しない。

## app_add_requestsの扱い

購入者導線では `app_add_requests` を使わない。

- `app_add_requests` insertは追加していない。
- 旧アプリ追加申請UIは復活していない。
- `app_add_requests` テーブルはdropせずPARKEDのまま。

## v1.7eへ送ること

今回の主目的は `app_instances` への正式反映。

以下は後続 `v1.7e account / portal / my-apps 表示整合` で扱う。

- `active` / `trial` の表示整理。
- `paused` / `disabled` の表示整理。
- account / portal / my-apps の一覧整合。
- 購入確認後に正式反映されたアプリを各画面でどう見せるか。

## Supabase Dashboardで人間が確認すべきこと

- `pdf_tool` 利用開始後、対象 `company_account_id + app_key = pdf_tool` が `app_instances` に作成される。
- `pdf_tool` の `status` が `active` になる。
- `quiz_maker` β版利用開始後、対象 `company_account_id + app_key = quiz_maker` が `app_instances` に作成される。
- `quiz_maker` の `status` が `trial` になる。
- 同じアプリを再度利用開始しても重複レコードが増えない。
- `paused` の既存レコードが `active` / `trial` に戻る。
- `disabled` の既存レコードはユーザー操作で復活しない。
- 有料 / サブスクは `app_instances` に追加されない。
- `app_data` は削除されない。

## ブラウザで人間が確認すべきこと

- ログイン状態で `purchase-confirm.html` の無料 / β版利用開始を確認する。
- `pdf_tool` の利用開始で完了表示になる。
- `quiz_maker` のβ版利用開始で完了表示になる。
- 有料 / サブスクは利用可能にならない。
- `disabled` 時のメッセージが破綻しない。
- 既存の購入確認ページUIが大きく崩れていない。
- スマホ表示で大きな崩れがない。

## 今回変更していないもの

- `account.html`
- `portal.html`
- `my-apps.html`
- `marketplace.html`
- `content-detail.html`
- `admin.html`
- `assets/css/*`
- `data/contents.json`
- `data/site-config.json`
- `supabase/migrations/*`
- `.github/workflows/*`

## 注意

現行RLSは自社 `company_account_id` 分離には効くが、無料 / β版だけをDB側で厳密にinsert許可し、有料 / サブスクをDB側で拒否する商品状態判定までは持たない。

そのため、v1.7dは人間確認済みallowlistに限定したMVPであり、より厳密な制御はRPC / Edge Function、商品・料金正本のDB化、または運営側反映で扱う。
