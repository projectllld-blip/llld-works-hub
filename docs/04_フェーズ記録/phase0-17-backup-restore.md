# v0.17 バックアップ・復元 方針整理

## 状態

- v0.17a バックアップ・復元 方針整理: 完了。
- v0.17b バックアップJSONエクスポートMVP: PARKED。
- v0.17c バックアップJSON読込・検証・プレビュー: PARKED。
- v0.17d 限定復元設計: PARKED。
- 復元: 未実装。

## 判断

v0.17b / v0.17c / v0.17d は `fix/v016-seatflow-cloud-load` 作業ブランチには存在するが、mainには未反映。

GitHub Pages公開版にもバックアップ導線は表示されていない。

そのため、公開版に「バックアップを書き出す」ボタンがない原因は、表示条件ではなくmain未反映である。

## v0.17aで整理済みの方針

- バックアップは通常ログイン中企業アカウントの自社データのみ対象にする。
- service_roleは使わない。
- RLSに従って取得できる範囲だけを扱う。
- 復元は危険度が高いため、実装前に設計と人間判断を挟む。
- バックアップJSON内の `company_account_id` / `app_instance_id` は将来復元時にそのまま信用しない。
- SeatFlow PARKED範囲には踏み込まない。

## PARKEDに戻す範囲

- v0.17b バックアップJSONエクスポートMVP。
- v0.17c バックアップJSON読込・検証・プレビュー。
- v0.17d 限定復元設計。
- `account.html` へのバックアップ導線追加。
- `assets/js/backupExportService.js`。
- `assets/js/backupImportPreviewService.js`。
- `docs/05_実装指示/portal-state-restore-mvp.md`。

これらは作業ブランチ上の検討成果として扱い、現時点ではmainへ入れない。

## 復元の扱い

復元は未実装のままにする。

復元実装が必要になった場合は、あらためて人間判断を挟み、main起点のcleanブランチで進める。

## 次の本線候補

```text
v0.18 検証環境デプロイ
```

v0.18開始時に確認すること:

- mainが最新であること。
- GitHub Pages公開版がmain由来であること。
- docsの現在地が v0.18 NEXT になっていること。
- v0.17b / v0.17c / v0.17d の作業ブランチ差分を混ぜないこと。
- 本体UI / JS / Supabase設定 / migration の不要な差分がないこと。
