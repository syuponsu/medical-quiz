/**
 * 看護クイズ 結果ログ受信スクリプト（v2：クラウド同期対応）
 *
 * - doPost：結果を「log」シートに追記し、弱点・前回スコアを「state」シートに保存
 * - doGet ：全トピックの状態(state)をJSON/JSONPで返す（端末をまたいで読み込むため）
 */

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // --- 1) ログを追記 ---
    var log = ss.getSheetByName('log') || ss.getSheets()[0];
    if (log.getLastRow() === 0) {
      log.appendRow(['日時', 'トピックID', 'トピック名', 'モード', '正解数', '問題数', '正答率(%)', '要復習の問題']);
    }
    var pct = data.total ? Math.round(data.correct / data.total * 100) : '';
    log.appendRow([
      new Date(), data.topicId || '', data.topicTitle || '', data.mode || '',
      data.correct, data.total, pct, (data.wrong || []).join(' / ')
    ]);

    // --- 2) 状態（弱点・前回スコア）を保存（端末間同期用） ---
    if (data.state && data.topicId) {
      var st = ss.getSheetByName('state');
      if (!st) { st = ss.insertSheet('state'); st.appendRow(['topicId', 'json']); }
      var col = st.getRange(1, 1, st.getLastRow(), 1).getValues().map(function (r) { return r[0]; });
      var idx = col.indexOf(data.topicId);
      var blob = JSON.stringify(data.state);
      if (idx >= 0) st.getRange(idx + 1, 2).setValue(blob);
      else st.appendRow([data.topicId, blob]);
    }

    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var st = ss.getSheetByName('state');
  var out = {};
  if (st && st.getLastRow() > 1) {
    var vals = st.getRange(2, 1, st.getLastRow() - 1, 2).getValues();
    vals.forEach(function (r) { try { out[r[0]] = JSON.parse(r[1]); } catch (e) {} });
  }
  var payload = JSON.stringify(out);
  var cb = e && e.parameter && e.parameter.callback;
  if (cb) {
    // JSONP（ブラウザから読み込むため）
    return ContentService.createTextOutput(cb + '(' + payload + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(payload).setMimeType(ContentService.MimeType.JSON);
}
