# v0.17 バックアップ・復元 方針整理

## 目的

企業アカウントごとのクラウドデータについて、最低限のバックアップ・復元方針を整える。

v0.17では、特定アプリの細かい仕様ではなく、`company_account` 単位のクラウドデータ保護方針を決める。

SeatFlow完全クラウド同期はPARKED済みのため、今回の詳細対象にはしない。

## v0.17で対象にする候補

- `app_data` のJSONバックアップ。
- `app_data.data_type = portal_state`。
- `app_instances` の最低限メタ情報。
- `company_accounts` の最低限メタ情報。

最低限メタ情報は、バックアップの識別と人間確認に必要な範囲に限る。

- `company_accounts.id`
- `company_accounts.company_name`
- `company_accounts.email`
- `app_instances.id`
- `app_instances.app_key`
- `app_instances.display_name`
- `app_instances.status`
- `app_data.app_key`
- `app_data.data_type`
- `app_data.updated_at`
- `app_data.data_json`

## v0.17では対象外にする候補

- Supabase Authユーザーそのもの。
- service_roleが必要なバックアップ。
- Supabase Storage。
- ファイル本体。
- 決済履歴。
- アプリ固有の未完成データ。
- SeatFlow PARKED範囲。

## PARKEDとして残す候補

- アプリ別の完全バックアップ。
- ファイル添付。
- 履歴管理。
- 差分復元。
- 世代管理。
- 管理者画面からの復元。
- SeatFlow full cloud state backup。
- SeatFlow複数レイアウト同期。
- SeatFlow名簿 / QR / NFC / メモのクラウド保存。
- SeatFlow全体状態の完全バックアップ・復元。
- 複数タブ競合解決。
- 本格的な同時編集対応。

## バックアップ方式比較

### 案A: ブラウザからJSONエクスポート

ログイン中企業アカウントの自社データだけを、ブラウザからJSONとして出力する。

利点:

- RLSに沿う。
- anon key / 通常ログインで実行できる。
- service_roleを使わない。
- GitHub Pages前提を壊しにくい。
- MVPとして安全に始めやすい。

注意点:

- ログイン中ユーザーに見える範囲だけが対象になる。
- 大量データやStorageファイルには向かない。
- 出力JSONの扱いはユーザー責任になるため、画面上の注意が必要。

評価:

v0.17の推奨案。

### 案B: Supabase Dashboard / SQLで手動バックアップ

人間がSupabase DashboardやSQL Editorでバックアップする。

利点:

- DB全体を直接確認できる。
- 緊急時や検証時の調査には使える。

注意点:

- 権限が強くなりやすい。
- 誤操作リスクがある。
- 通常機能としてユーザーに提供できない。
- service_roleや管理者権限に近い領域へ寄りやすい。

評価:

v0.17の通常機能にはしない。人間作業・緊急対応の領域として残す。

### 案C: 将来の管理者画面からバックアップ・復元

管理者画面から企業ごとのバックアップ・復元を行う。

利点:

- 運用として整えやすい。
- 監査ログ、権限、世代管理と組み合わせられる。

注意点:

- 管理者権限設計が必要。
- 監査ログが必要。
- 復元ミス時の責任範囲が重い。

評価:

v1.1以降向き。v0.17では設計だけでよい。

## 推奨バックアップ方針

v0.17では、案Aを優先する。

```text
ログイン中企業アカウントが、自社のapp_dataをJSONとしてエクスポートする。
```

バックアップJSONには、少なくとも以下を含める。

- `backupVersion`
- `exportedAt`
- `source`
- `company`
- `appInstances`
- `appData`

`company_account_id` や `app_instance_id` は、復元時にそのまま信用しない。

## 復元方式

復元はバックアップより危険なため、v0.17では慎重に扱う。

復元時の原則:

- バックアップJSON内の `company_account_id` は信用しない。
- 復元先は、ログイン中企業アカウントの `company_account_id` に紐づけ直す。
- `app_instance_id` も、ログイン中企業の `app_instances.app_key` から引き直す。
- `schemaVersion` / `backupVersion` を確認する。
- 復元前に現在データを自動バックアップする。
- 復元対象はまず `portal_state` など限定範囲に絞る。
- 他社データが混ざる可能性があるJSONは復元しない。

復元方式の候補:

### 復元案1: 上書き

対象 `app_data` をバックアップJSONの内容で置き換える。

利点:

- 仕様が単純。
- 復旧用途に向く。

リスク:

- 現在データが失われる。
- 誤ったJSONを使うと戻す操作が必要になる。

### 復元案2: 追記

既存データを残し、追加可能なものだけ取り込む。

利点:

- 既存データを消しにくい。

リスク:

- `portal_state` のような単一JSON正本とは相性が悪い。
- 重複や整合性崩れが起きやすい。

### 復元案3: プレビューのみ

JSONを読み込み、復元候補を画面に表示するだけで、DB更新はしない。

利点:

- 安全。
- 人間確認しやすい。

リスク:

- 実際の復元には次段階が必要。

## 推奨復元方針

v0.17では、復元の実装は急がない。

次の実装候補としては、以下の順に進める。

1. `v0.17a`: 方針整理のみ。
2. `v0.17b`: ログイン中企業の `app_data` JSONエクスポート。
3. `v0.17c`: バックアップJSONの読込・検証・プレビュー。
4. `v0.17d`: `portal_state` 限定の確認付き上書き復元。

復元実装に進む場合は、人間確認を挟む。

## v0.17aの判断

今回は `v0.17a 方針整理のみ` が安全。

理由:

- 復元は既存データ上書きリスクがある。
- `company_account_id` / `app_instance_id` の再紐づけ方針を先に固定する必要がある。
- SeatFlow PARKED範囲を誤ってv0.17へ戻さないため、対象範囲を先に明文化する必要がある。
- 本体UI実装はSTOP条件に該当するため、今回は行わない。

## STOP条件

以下が必要になった場合は、Codexは実装を進めず `HUMAN_REQUIRED: YES` で停止する。

- service_role keyが必要。
- Supabase Dashboard操作が必要。
- DB / RLS変更が必要。
- 本体UI実装が必要。
- 復元仕様の人間判断が必要。
- SeatFlow PARKED範囲をv0.17内で実装しようとしている。
- 他社データ混入リスクがある。
- secret混入の疑いがある。

## 次の実装候補

次に進む場合は、`docs/05_実装指示/backup-restore-mvp.md` を正として、まずバックアップJSONエクスポートだけを実装する。

復元は、バックアップJSONの検証・プレビューまでに留めるか、`portal_state` 限定の確認付き上書き復元にするかを人間が判断してから進める。

## 2026-07-01 v0.17b バックアップJSONエクスポートMVP

実装範囲:

- `account.html` に「バックアップを書き出す」導線を追加。
- `assets/js/backupExportService.js` を追加。
- 通常ログイン中企業アカウントの自社データだけをJSONとしてダウンロードする。
- `company_accounts` の最低限メタ情報を含める。
- `app_instances` の最低限メタ情報を含める。
- `app_data` のJSONを含める。
- `backupVersion` / `exportedAt` / `source` / `scope` / `restorePolicy` を含める。

含めないもの:

- `owner_user_id`
- メールアドレス
- Supabase Authユーザー
- Supabase Storage
- ファイル本体
- 決済履歴
- service_roleでなければ取得できないデータ

復元未実装の扱い:

- 復元ボタンは作らない。
- バックアップJSON内の `sourceCompanyAccountId` / `sourceAppInstanceId` / `sourceAppDataId` は参考IDであり、将来復元時にそのまま信用しない。
- 将来復元する場合は、ログイン中企業アカウントの `company_account_id` と `app_key` から再紐づけする。

バックアップJSONの形:

```json
{
  "backupVersion": 1,
  "exportedAt": "2026-07-01T00:00:00.000Z",
  "source": "llld-works-hub",
  "scope": "company_account",
  "restorePolicy": {
    "doNotTrustSourceIds": true,
    "restoreRequiresLoggedInCompany": true,
    "sourceIdsAreReferenceOnly": true,
    "restoreNotImplemented": true
  },
  "company": {
    "companyName": "会社名",
    "sourceCompanyAccountId": "参考ID",
    "createdAt": "...",
    "updatedAt": "..."
  },
  "appInstances": [],
  "appData": []
}
```

次の候補:

- v0.17c バックアップJSON読込・検証・プレビュー。
- `portal_state` 限定復元を行うかは、人間判断後に決める。
