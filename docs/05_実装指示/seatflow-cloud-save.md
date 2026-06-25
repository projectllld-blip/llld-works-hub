# SeatFlowクラウド保存 実装ルール

## 基本方針

v0.14ではSeatFlowの座席レイアウトだけをクラウド保存する。

名簿、利用者名、座席利用状態、勤怠情報は保存しない。

## 保存の流れ

1. 現在のauth modeを確認する。
2. mock modeならクラウド保存しない。
3. supabase modeならログイン中ユーザーを確認する。
4. `company_accounts` を取得する。
5. `app_instances` から `app_key = seatflow` を取得する。
6. SeatFlowレイアウトをsanitizeする。
7. `app_data` にupsertする。

## 読込の流れ

1. 現在のauth modeを確認する。
2. mock modeならクラウド読込しない。
3. supabase modeならログイン中ユーザーを確認する。
4. `company_accounts` と `seatflow` の `app_instances` を取得する。
5. `app_data` から `app_key = seatflow` / `data_type = seat_layout` を取得する。
6. SeatFlow画面の現在レイアウトへ反映する。
7. 既存localStorage保存にも反映される。

## app_dataのキー

```text
company_account_id
app_instance_id
app_key = seatflow
data_type = seat_layout
```

1つの `app_instance_id` と `data_type` につき1件を保存する。

## data_json構造

```json
{
  "version": 1,
  "layoutName": "メイン教室",
  "savedAt": "2026-06-25T00:00:00.000Z",
  "source": "seatflow",
  "canvas": {
    "width": 1200,
    "height": 800,
    "gridSize": 20,
    "zoom": 1
  },
  "items": [
    {
      "id": "seat-001",
      "type": "seat",
      "label": "1",
      "x": 120,
      "y": 180,
      "width": 80,
      "height": 60,
      "rotation": 0
    }
  ],
  "settings": {
    "showGrid": true,
    "snapToGrid": true
  }
}
```

## sanitize方針

クラウド保存前に、保存してよい項目だけを白リスト方式で抽出する。

保存対象:

- `id`
- `type`
- `label`
- `x`
- `y`
- `width`
- `height`
- `rotation`
- `z`
- `groupId`
- `assignable`
- `noBorder`
- `color`

保存対象外:

- `studentName`
- `assignedName`
- `personId`
- `teacherName`
- `customerName`
- `phone`
- `email`
- `memo`
- `note`
- `reservation`
- `reservedBy`
- `occupiedBy`
- `attendance`
- 座席の使用中、予約、離席などの状態

座席ラベルは座席番号として扱える短い値だけを残す。

## 未ログイン時

保存・読込を実行しない。

画面には以下を案内する。

```text
クラウド保存にはログインが必要です。
企業アカウントでログインしてください。
```

## app_instanceなし

保存・読込を実行しない。

画面には以下を案内する。

```text
この企業アカウントにはSeatFlowがまだ登録されていません。
利用アプリ一覧またはapp_instances設定を確認してください。
```

フロントから勝手に `app_instances` を作成しない。

## RLS前提

`app_data` は `company_account_id` で分離する。

ログイン中ユーザーが所有する `company_accounts.id` と一致する行だけ読める・書ける設計にする。

service role keyはフロントに置かない。

## v0.15への引き継ぎ

- エラー表示の細分化
- 空状態の説明改善
- 手動バックアップとの整理
- 競合時の扱い
- 最終同期日時の見せ方改善
