# LLLD Works Hub 変更後監査チェック

Works Hubを変更した後は、公開前に以下を確認してください。

## 必須監査

1. `data/contents.json` が正しいJSONとして読める。
2. `contents.json` の `url` と `thumbnail` がリンク切れしていない。
3. トップページのJavaScript構文が壊れていない。
4. コンテンツを開く操作は、すべて新しいタブで開く。
5. お気に入りは左ツールバーに表示され、左ツールバーから開ける。
6. メイン画面に不要なお気に入りカード欄を復活させない。
7. 最終利用履歴は最大8件で、履歴カードの `×` はホバー時に表示される。
8. GitHub Pages公開URLで変更が反映されている。

## 推奨コマンド

```bash
node -e "JSON.parse(require('fs').readFileSync('data/contents.json','utf8')); console.log('contents.json OK')"
git diff --check
```

ローカル確認:

```bash
python3 -m http.server 8765
```

確認URL:

```text
http://localhost:8765/
```

公開後確認URL:

```text
https://projectllld-blip.github.io/llld-works-hub/
```
