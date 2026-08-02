# 看護クイズ

スマホのブラウザで開ける、看護学習用のクイズアプリ。
トピックを1つ選ぶと「学習ページを読む」か「クイズを解く」かを選べる。結果はスプレッドシートに自動記録できる。

## 構成
- `index.html` … アプリ本体（バニラJS・フレームワークなし）
- `config.js` … 結果ログの送信先（Apps Script ウェブアプリURL）
- `topics/index.json` … トピック一覧
- `topics/*.json` … トピックごとの問題データ
- `topics/*.learn.html` … アプリ内に同梱する学習ページ（**トピックごとに必須**）
- `apps-script/` … 結果をスプレッドシートに記録する Google Apps Script とセットアップ手順

## 画面の流れ
```
ホーム（トピック一覧）
  └─ トピックを選ぶ
       ├─ 📖 学習ページを読む
       └─ ✏️ クイズを解く → 出題設定 → 出題 → 結果
```
学習ページが無いトピックは、選択画面を出さずに出題設定へ直行する。

## トピックの追加（かんたん）
1. `topics/<id>.json` を作成（既存ファイルと同じ形式。`id` / `title` / `provisional` / `notion` / `questions` を含める）
2. `topics/<id>.learn.html` を作成（**必須**。書き方は下の「学習ページ」を参照）
3. `python3 build_index.py` を実行 → `topics/index.json` が自動生成される（手で編集不要）
4. commit して push すれば公開版に反映される

> `build_index.py` は `.learn.html` が無くてもエラーにならず、`learn` が空のまま通る。**作り忘れても気づけない**ので、追加後に `topics/index.json` を開いて `learn` が埋まっているか目視で確認する。

### 問題データの形式
```json
{
  "id": "topicのID",
  "title": "画面に出す名前",
  "provisional": false,        // 仮作成なら true（一覧に「※仮作成」と表示）
  "notion": "https://app.notion.com/p/…",  // 学習ページ（Notion）のURL
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

## 学習ページ（`topics/<id>.learn.html`）
Notionの学習ページの中身をアプリ内で読めるようにするためのファイル。

**読むのはアプリ内が主**。スマホでは、編集できない＝長押しで誤って編集が始まらないこと、
文字組みが読みやすいことから、Notionを直接開くより読みやすいため。

`notion` は「元ページを直したいとき」の二次動線として、選択画面に小さなリンクで出る。

**新しいトピックには必ず付ける。** 無くてもアプリは動く（Notionを開く動作にフォールバックする）が、それはあくまで保険であって省略してよいという意味ではない。1つだけ挙動が違うと、どのトピックがアプリ内で読めるのか覚えていないといけなくなる。

- **このリポジトリは公開**。拾ってきたCT画像などをここに置かないこと（私的使用の例外は公開物には使えない）。画像を扱うなら非公開のNotion側に置く

- ファイル名は `<トピックのid>.learn.html`（例：`dka.learn.html`）
- `<body>` の中身だけを書いた**断片**（`<html>` や `<style>` は不要）。`index.html` 側のCSSで整形される
- 置いておけば `build_index.py` が自動で検出し、`index.json` に `"learn": "dka.learn.html"` が入る。**手で書く必要はない**
- 無い場合のフォールバック挙動：選択画面は出ず、トピックをタップすると出題設定に直行する

使えるクラス（`index.html` にスタイル定義あり）：

| 書き方 | 用途 |
|---|---|
| `<div class="callout c-blue"><span class="ci">🧪</span><div>本文</div></div>` | Notionのコールアウト。色は `c-gray` / `c-blue` / `c-red` / `c-green` / `c-yellow` |
| `<div class="tablewrap"><table>…</table></div>` | 表。**必ず `tablewrap` で包む**（スマホで横スクロールさせるため） |

### Notionを更新したとき
自動では同期されない。Notion側を書き換えたら、その内容を `topics/<id>.learn.html` に反映して commit・push する。
先頭の `<p class="synced">` に取り込み日を書いておくと、いつ時点の内容か画面で分かる。

## 結果の自動記録
`apps-script/SETUP.md` を参照。
