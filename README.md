# 看護クイズ

スマホのブラウザで開ける、看護学習用のクイズアプリ。
トピックを1つ選んで、4択・一問一答形式で解く。結果はスプレッドシートに自動記録できる。

## 構成
- `index.html` … アプリ本体（バニラJS・フレームワークなし）
- `config.js` … 結果ログの送信先（Apps Script ウェブアプリURL）
- `topics/index.json` … トピック一覧
- `topics/*.json` … トピックごとの問題データ
- `apps-script/` … 結果をスプレッドシートに記録する Google Apps Script とセットアップ手順

## トピックの追加
1. `topics/<id>.json` を作成（既存ファイルと同じ形式）
2. `topics/index.json` に1行追加

## 結果の自動記録
`apps-script/SETUP.md` を参照。
