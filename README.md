# 看護クイズ

スマホのブラウザで開ける、看護学習用のクイズアプリ。
トピックを1つ選んで、4択・一問一答形式で解く。結果はスプレッドシートに自動記録できる。

## 構成
- `index.html` … アプリ本体（バニラJS・フレームワークなし）
- `config.js` … 結果ログの送信先（Apps Script ウェブアプリURL）
- `topics/index.json` … トピック一覧
- `topics/*.json` … トピックごとの問題データ
- `apps-script/` … 結果をスプレッドシートに記録する Google Apps Script とセットアップ手順

## トピックの追加（かんたん）
1. `topics/<id>.json` を作成（既存ファイルと同じ形式。`id` / `title` / `provisional` / `questions` を含める）
2. `python3 build_index.py` を実行 → `topics/index.json` が自動生成される（手で編集不要）
3. commit して push すれば公開版に反映される

### 問題データの形式
```json
{
  "id": "topicのID",
  "title": "画面に出す名前",
  "provisional": false,        // 仮作成なら true（一覧に「※仮作成」と表示）
  "category": "内分泌・代謝",   // 分野（Notionの「領域」に対応）。検索対象
  "tags": ["Na", "ODS", "SIADH"], // 関連キーワード。検索でヒットしやすくする
  "questions": [
    {
      "type": "mc", "q": "問題文", "choices": ["A","B","C","D"], "answer": 0,
      "why": ["", "Bが違う理由", "Cが違う理由", "Dが違う理由"],
      "explain": "解説"
    },
    { "type": "qa", "q": "問題文", "answer": "答え", "explain": "解説" }
  ]
}
```
- `category` / `tags` は検索の対象になる（トピック名に無い語でも見つかる）
- `type` は `mc`（4択）か `qa`（一問一答）
- `mc` の `answer` は正解の選択肢の番号（0始まり）
- `explain` は正解の解説。正解でも不正解でも表示される

### `why`（誤答肢ごとの解説・任意）
`choices` と同じ並び・同じ個数の配列。**自分が選んだ肢が違う理由**だけがピンポイントで表示される。
- 正解の位置は空文字 `""` にしておく（表示されないため）
- `why` を書かなければ従来どおり `explain` だけが出る（既存データはそのままで動く）
- 「なぜ間違いか」は正答の理由と別物なので、`explain` の言い換えにならないよう書く

## 結果の自動記録
`apps-script/SETUP.md` を参照。
