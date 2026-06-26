# v0.14.7-v0.14.9前半 ポータル導線安定化記録

## 目的

`portal.html` を、社員が毎日使う社内入口として迷わず使える状態に近づける。

今回の対象は、既存HTMLアプリ導線の安定化、ポータル内mockの整理、実機確認前のコード調整です。

## 実施内容

- 主要HTMLアプリの表示名を統一
- クイックアクセス、お気に入りアプリ、保管庫内HTMLアプリのリンク先を実ファイルへ統一
- 社内テンプレート・資料欄をmock枠として明記
- mockカードに「準備中」表示を追加
- スマホ幅でクイックカード、プレビュー、保管庫行が大きく崩れにくいようCSSを補強
- `index.html` から新ポータルへ入る導線は維持

## 正規リンク

| 表示名 | リンク |
| --- | --- |
| 小テスト作成アプリ | `apps/quiz-maker/index.html` |
| 入試問題アプリ | `apps/exam-print/index.html` |
| PDF編集ツール | `apps/pdf-tool/index.html` |
| SeatFlow / 座席管理アプリ | `apps/seatflow/index.html` |
| 勤怠管理アプリ / だこくん | `apps/dakokun/index.html` |
| 面談支援ツール | `contents/meeting-support/index.html` |

## mockとして残すもの

- 掲示板投稿
- メモ保存
- To Do出力
- 購入済みコンテンツ風の社内テンプレート表示
- ファイル追加、フォルダ作成、ダウンロード、閲覧プレビュー

これらは実保存・実DB接続を行わず、トースト表示で後続実装予定であることを伝える。

## Supabase

今回、Supabase DB構造、RLS、`data/site-config.json` は変更していません。

## 次に確認すること

- PC、iPad、スマホでの表示崩れ
- クイックアクセスとお気に入りアプリの起動
- 保管庫ツリーの開閉とHTMLアプリリンク
- 掲示板・To Do・ファイル保管庫mockが実運用と誤解されないか
