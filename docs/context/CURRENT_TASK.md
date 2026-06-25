# Current Task

LLLD Works Hub / Market ローカル検証版を、将来のマーケット化に向けて安全に整理している。

現在の優先事項:

1. このフォルダごと渡せばローカルで動く状態を維持する。
2. 実行に必要なHTML / CSS / JS / JSON / assets / apps / contents は壊さない。
3. ルール、構想、監査、フェーズ記録などのMarkdownは `docs/` に集約する。
4. 本番GitHub Pagesにはまだ反映しない。
5. 将来Supabase等へ移行しやすいように、データ取得はService層経由にする。
6. Phase 4は代表本人による疑似βチェックに圧縮する。
7. Phase 5はSupabase移行準備に留め、本番DB接続はしない。
8. Phase 6は管理画面Skeletonに留め、本番操作は実装しない。

直近の整理:

- `docs/` を用途別に分けた。
- `data/` を仮DBとして明記した。
- ルートREADMEを「渡せば動くパッケージ」の説明に更新した。
- `admin.html` を本番操作不可の管理画面モックとして追加した。
