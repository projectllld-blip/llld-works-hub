# v0.17d portal_state限定復元設計

## 目的

バックアップJSONからの復元実装へ進む前に、最初に復元してよい範囲、安全策、STOP条件を整理する。

この文書は設計であり、DB更新・復元実行・upsert・migration変更は行わない。

## 最初に復元してよい候補

- `app_data.data_type = portal_state`

理由:

- `portal_state` は企業ポータル状態の単一JSON正本として扱いやすい。
- v0.16で企業ごとの分離方針を確認済み。
- SeatFlow PARKED範囲へ踏み込まずに、バックアップ・復元のMVPを検証できる。

## 復元対象外

- `seat_layout`
- SeatFlow完全クラウド同期関連
- `app_instances`
- `company_accounts`
- Supabase Auth users
- Supabase Storage
- ファイル本体
- 決済履歴
- 複数アプリ一括復元
- 履歴・世代管理
- 管理者画面からの復元

## 復元方式比較

### 案A: portal_state限定の上書き復元

特徴:

- 実装がシンプル。
- 既存の `works_portal` app_instanceと `portal_state` の1件を対象にできる。
- 現在データを上書きするため、復元前バックアップが必須。

評価:

v0.17eの推奨案。ただし、人間確認後に進める。

### 案B: portal_stateを別名 / 別スロットに復元

特徴:

- 現在データを直接上書きしないため安全寄り。
- ただし、`app_data.data_type` を追加する、または復元用スロットを設計する必要がある。
- DB設計やUI導線が重くなる可能性がある。

評価:

v0.17のMVPには重い。将来の世代管理・プレビュー保存で検討する。

### 案C: プレビューだけ継続し、復元実装はv1以降

特徴:

- 最も安全。
- ただし、バックアップ機能としては復旧導線が未完成のまま残る。

評価:

本番データ保護を優先する場合の保留案。v0.17eへ進む前に人間判断で選べるようにする。

## 推奨案

v0.17e以降で、案Aの `portal_state限定の確認付き上書き復元` を検討する。

ただし、実装へ進む前に以下を人間が確認する。

- `portal_state` の現在データを上書きしてよい運用にするか。
- 復元前バックアップの保存導線で十分か。
- 復元後に戻すには復元前バックアップが必要であることをUIに明記するか。

## 復元前自動バックアップ方針

復元実行前に、現在ログイン中企業アカウントの `portal_state` を自動バックアップする。

形式:

```json
{
  "backupVersion": 1,
  "source": "llld-works-hub",
  "scope": "company_account",
  "backupReason": "before_portal_state_restore",
  "exportedAt": "2026-07-01T00:00:00.000Z",
  "restorePolicy": {
    "doNotTrustSourceIds": true,
    "restoreRequiresLoggedInCompany": true,
    "sourceIdsAreReferenceOnly": true
  },
  "company": {},
  "appInstances": [],
  "appData": []
}
```

ファイル名:

```text
llld-works-hub-before-portal-restore-YYYYMMDD-HHMM.json
```

方針:

- 復元前バックアップの作成またはダウンロード準備に失敗したら、復元を停止する。
- ユーザーに復元前バックアップを保存させる。
- account画面上に「復元前バックアップを保存しました」または同等の確認表示を出す。
- 復元後に戻すには、この復元前バックアップが必要であると明記する。

## ID再紐づけ方針

バックアップJSON内のIDは参考情報として扱う。

```text
backup.company.sourceCompanyAccountId
-> 使わない

backup.appData[].sourceAppInstanceId
-> 使わない

backup.appData[].sourceAppDataId
-> 使わない

現在ログイン中のcompany_account_id
-> 復元先として使う

現在ログイン中企業のworks_portal app_instance
-> portal_state復元先として使う
```

復元処理では、`appKey = works_portal` と `dataType = portal_state` のバックアップデータを探す。

復元先は、ログイン中企業アカウントの `works_portal` app_instanceを取得し、その `app_instance_id` に紐づく `portal_state` とする。

## 復元前バリデーション

復元前に以下をすべて確認する。

- JSONとしてparse済み。
- `backupVersion` が対応範囲。
- `restorePolicy.doNotTrustSourceIds = true`。
- `appData` に `appKey = works_portal` がある。
- `appData` に `dataType = portal_state` がある。
- `portal_state` の `schemaVersion` が対応範囲。
- 復元先のログイン中企業に `works_portal` app_instance が存在する。
- 未ログインでは復元不可。
- mock modeでは復元不可。
- SeatFlow関連の `dataType` は復元対象にしない。

## 確認UI方針

復元前に以下を表示する。

- 復元対象: `portal_state`
- バックアップ元企業名
- エクスポート日時
- 現在ログイン中企業名
- 現在のポータル状態を上書きすること
- 復元前バックアップを作成すること
- 復元後に戻すには復元前バックアップが必要なこと
- この操作は元に戻せないこと
- 最終確認チェックボックスまたは確認入力

表示例:

```text
現在のポータル状態を上書きします。
復元前バックアップを保存しました。
この操作は元に戻せません。
バックアップ内のIDは参考情報であり、ログイン中企業アカウントへ再紐づけします。
```

## STOP条件

以下に該当した場合、復元実装または復元実行を停止する。

- 復元前バックアップに失敗した。
- `works_portal` app_instanceがない。
- `backupVersion` が非対応。
- `portal_state.schemaVersion` が非対応。
- バックアップ内の `sourceCompanyAccountId` を復元先として使おうとしている。
- バックアップ内の `sourceAppInstanceId` を復元先として使おうとしている。
- バックアップ内の `sourceAppDataId` を復元先として使おうとしている。
- 他社データ混入の恐れがある。
- SeatFlowや複数アプリ復元に拡張しようとしている。
- service_role keyが必要。
- Supabase Dashboard操作が必要。
- DB / RLS / migration変更が必要。

## v0.17e候補

```text
v0.17e portal_state限定復元MVP
```

実装へ進むかどうかは人間判断を挟む。

v0.17eで実装する場合の範囲:

- バックアップJSONプレビュー後の `portal_state` 復元候補表示。
- 復元前自動バックアップ。
- ログイン中企業の `works_portal` app_instance取得。
- `portal_state` 限定の確認付き上書き復元。

v0.17eでも実装しないもの:

- SeatFlow復元。
- 複数アプリ一括復元。
- `app_instances` 作成。
- `company_accounts` 更新。
- Supabase Auth users復元。
- Supabase Storage復元。
- migration / RLS変更。
