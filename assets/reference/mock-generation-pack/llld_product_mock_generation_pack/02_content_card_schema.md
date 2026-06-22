# 02 Content Card Schema

## 目的

LLLD Works Hubに掲載するコンテンツカードの情報構造を統一する。

今後アプリ・資料・テンプレートが増えても、  
HTMLやJSを大きく書き換えずに追加できるようにする。

---

## 必須項目

| 項目 | 型 | 内容 |
|---|---|---|
| id | string | 一意のID |
| title | string | 表示名 |
| category | string | 表示カテゴリ |
| type | string | HTMLアプリ、テンプレート、資料など |
| description | string | 1〜2行の短い説明 |
| url | string | 開くリンク |
| thumbnailType | string | サムネイル種別 |
| iconType | string | アイコン種別 |
| primaryActionLabel | string | 通常は「開く」 |

---

## 推奨項目

| 項目 | 型 | 内容 |
|---|---|---|
| thumbnailImage | string | 実画像がある場合のパス |
| badge | string | 人気、おすすめ、NEWなど |
| tags | array | タグ一覧 |
| status | string | 公開中、準備中、社内限定など |
| featured | boolean | おすすめ表示対象 |
| favoriteEnabled | boolean | お気に入り可能か |
| detailEnabled | boolean | 詳細表示可能か |
| lastUsedAt | string | 最終利用日時 |
| updatedAt | string | 更新日 |
| audience | string | 想定利用者 |
| summary | string | 詳細説明 |
| thumbnailFocus | string | サムネで目立たせる要素 |
| sourceHtml | string | 元HTML名 |
| mockImage | string | 生成したモック画像パス |

---

## カテゴリ候補

初期カテゴリ：
- 塾事業
- コンサル事業
- 社内運営
- HTMLアプリ
- テンプレート

将来カテゴリ：
- 授業支援
- 教室運営
- 採用・育成
- 補助金
- 営業資料
- LP・チラシ
- 業務改善
- 顧客管理
- 誰でもプログラマー
- 外部販売用
- 社内限定

---

## type候補

- HTMLアプリ
- テンプレート
- 資料
- マニュアル
- チェックリスト
- 研修コンテンツ
- LP
- チラシ
- 外部販売用コンテンツ

---

## badge候補

- 人気
- おすすめ
- NEW
- 作成中
- 社内限定
- 外部販売可
- ベータ版
- 要確認

---

## status候補

- 公開中
- 準備中
- 社内限定
- 外部販売可
- ベータ版
- 非表示
- アーカイブ

---

## iconType候補

- pdf
- seats
- quiz
- attendance
- document
- proposal
- dashboard
- form
- lp
- flyer
- exam
- crm
- training
- checklist
- ai
- marketplace
- generic

---

## JSONサンプル

```json
{
  "id": "attendance-app",
  "title": "勤怠管理",
  "category": "社内運営",
  "type": "HTMLアプリ",
  "description": "出退勤の記録・集計を効率化",
  "url": "./apps/attendance/index.html",
  "thumbnailType": "attendance",
  "thumbnailImage": "",
  "iconType": "attendance",
  "badge": "",
  "tags": ["HTMLアプリ", "社内運営"],
  "status": "公開中",
  "featured": false,
  "favoriteEnabled": true,
  "detailEnabled": true,
  "primaryActionLabel": "開く",
  "lastUsedAt": "",
  "updatedAt": "2026-06-22",
  "audience": "小規模事業者、教室長、事務担当",
  "summary": "出退勤の記録、打刻漏れ確認、修正申請、月末締めを支援する勤怠管理アプリ。",
  "thumbnailFocus": "勤怠一覧表、出勤時間、退勤時間、ステータスチップ",
  "sourceHtml": "",
  "mockImage": ""
}
```

---

## 実装方針

- コンテンツ情報はできるだけ配列またはJSONで管理する
- カードHTMLを直書きで増やさない
- thumbnailImage があれば画像を優先
- thumbnailImage がなければ thumbnailType に応じた疑似サムネイルを表示
- thumbnailType が不明なら generic を表示
- カテゴリやタグは配列から自動生成できるようにする
- 将来的な追加を想定して、idは必ず一意にする
