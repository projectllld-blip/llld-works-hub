# v0.17 バックアップ・復元 MVP実装指示案

## 目的

ログイン中企業アカウントが、自社クラウドデータをJSONとして安全にエクスポートできるようにする。

初回MVPでは、復元よりバックアップを優先する。

## 対象範囲

### v0.17bで実装してよい候補

- ログイン中企業アカウントの取得。
- 自社 `app_instances` の取得。
- 自社 `app_data` の取得。
- `app_data.data_type = portal_state` のJSONエクスポート。
- バックアップJSONの生成。
- ブラウザからのJSONダウンロード。

### v0.17bでは実装しない候補

- Supabase Authユーザーのバックアップ。
- Supabase Storage。
- ファイル本体。
- 決済履歴。
- service_roleを使うバックアップ。
- 管理者画面からの全社バックアップ。
- SeatFlow PARKED範囲。
- 復元によるDB更新。

## 推奨バックアップJSON形式

```json
{
  "backupVersion": 1,
  "source": "llld-works-hub",
  "exportedAt": "2026-07-01T00:00:00.000Z",
  "company": {
    "id": "<export_source_company_account_id>",
    "companyName": "Company Name",
    "email": "account@example.com"
  },
  "appInstances": [
    {
      "id": "<app_instance_id>",
      "appKey": "works_portal",
      "displayName": "LLLD Works Portal",
      "status": "active"
    }
  ],
  "appData": [
    {
      "id": "<app_data_id>",
      "appInstanceId": "<app_instance_id>",
      "appKey": "works_portal",
      "dataType": "portal_state",
      "updatedAt": "2026-07-01T00:00:00.000Z",
      "dataJson": {}
    }
  ]
}
```

## RLS前提

バックアップ取得は、通常ログイン中ユーザーの権限で行う。

- `company_accounts.owner_user_id = auth.uid()` の自社アカウントだけ取得する。
- `app_instances.company_account_id = ログイン中企業ID` の行だけ取得する。
- `app_data.company_account_id = ログイン中企業ID` の行だけ取得する。
- service_role keyは使わない。
- RLSを無効化しない。

## 復元方針

復元は初回MVPではDB更新まで進めない。

次段階で検討する場合:

- バックアップJSON内の `company.id` は信用しない。
- 復元先はログイン中企業アカウントに固定する。
- `appInstanceId` は信用せず、`appKey` からログイン中企業の `app_instances.id` を引き直す。
- `backupVersion` を確認する。
- 復元前に現在データを自動バックアップする。
- まず `portal_state` 限定の上書き復元だけを検討する。

## UI実装時の注意

- ボタン名は具体的にする。
- 例: `自社データをJSONバックアップ`
- 復元ボタンは初回MVPで出さない。
- バックアップJSONには秘密情報やservice_roleを含めない。
- ユーザーに、JSONファイルは大切に保管する必要があることを短く伝える。

## STOP条件

- service_role keyが必要。
- Supabase Dashboard操作が必要。
- DB / RLS変更が必要。
- 復元で既存データを上書きする必要がある。
- SeatFlow PARKED範囲を実装しようとしている。
- 他社データ混入リスクがある。
- secret混入の疑いがある。
