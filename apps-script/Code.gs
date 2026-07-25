/**
 * 看護クイズ 結果ログ受信スクリプト
 *
 * 使い方（デプロイ手順は同フォルダの SETUP.md を参照）:
 *  - このスクリプトは「看護クイズ_結果ログ」スプレッドシートに紐づけて使う
 *  - ウェブアプリとしてデプロイし、発行されたURLをアプリの config.js に設定する
 */

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('log') || ss.getSheets()[0];

    // 1行目が空ならヘッダーを付ける
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['日時', 'トピックID', 'トピック名', 'モード', '正解数', '問題数', '正答率(%)', '間違えた問題']);
    }

    var pct = data.total ? Math.round(data.correct / data.total * 100) : '';
    sheet.appendRow([
      new Date(),
      data.topicId || '',
      data.topicTitle || '',
      data.mode || '',
      data.correct,
      data.total,
      pct,
      (data.wrong || []).join(' / ')
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService.createTextOutput('看護クイズ 結果ログ受信エンドポイント（正常に動作しています）');
}
