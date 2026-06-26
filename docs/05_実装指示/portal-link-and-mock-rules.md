# ポータル導線・mock整理ルール

## 役割

- `portal.html`: 社員が毎日使う社内ポータル
- `index.html`: Hub全体の入口
- `account.html`: ログイン済み企業のアカウント画面
- `marketplace.html`: 外部向け販売・商品一覧

## 主要HTMLアプリの正規リンク

同じアプリは、ポータル内のどこから開いても同じリンク先にする。

| 表示名 | リンク |
| --- | --- |
| 小テスト作成アプリ | `apps/quiz-maker/index.html` |
| 入試問題アプリ | `apps/exam-print/index.html` |
| PDF編集ツール | `apps/pdf-tool/index.html` |
| SeatFlow / 座席管理アプリ | `apps/seatflow/index.html` |
| 勤怠管理アプリ / だこくん | `apps/dakokun/index.html` |
| 面談支援ツール | `contents/meeting-support/index.html` |

社内HTMLアプリは原則同じタブで開く。外部URLやPDF資料は必要に応じて別タブで開く。

## mockの扱い

以下は、実保存・実DB接続ができるまでmockとして扱う。

- 掲示板投稿
- メモ保存
- To Do出力
- 購入済みコンテンツ風の表示
- ファイル追加
- フォルダ作成
- ファイルダウンロード
- プレビューからの別タブ表示

mock操作には `data-mock` を付け、押したときに「後続フェーズで実装予定」「実保存はしない」などのトーストを出す。

## Supabase設定

ポータル導線整理では `data/site-config.json`、ログイン、アカウント、app_instances、app_data保存処理を変更しない。

Supabase DBやRLSの変更が必要になった場合は、その場で実装せず、必要な変更案として報告する。

## 実機確認

コード上の確認後、PC、iPad、スマホで以下を見る。

- `portal.html` の表示崩れ
- クイックアクセスからの主要アプリ起動
- お気に入りアプリの「開く」
- 保管庫ツリーの開閉
- mock操作のトースト表示
- `login.html` / `account.html` / `marketplace.html` への導線
