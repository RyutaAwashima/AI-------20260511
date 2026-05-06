/**
 * 「AIで物語を作ろう」参加者アンケート フォーム自動作成スクリプト
 *
 * 使い方:
 *   1. script.google.com で新しいプロジェクトを作成
 *   2. このスクリプトを貼り付けて保存
 *   3. createSurveyForm() を選択して「実行」
 *   4. ログに表示されたフォームURLを参加者に共有
 *
 * オプション: SPREADSHEET_ID に既存スプシのIDを入れると、
 *             同じスプシの「アンケート回答」シートに回答が集まります。
 *             空文字にすると新規スプシが自動作成されます。
 */

// ── 設定 ──────────────────────────────────────────────────────────────────
var FORM_TITLE      = '「AIで物語を作ろう」参加者アンケート';
var SPREADSHEET_ID  = '';   // 既存スプシに紐付ける場合は ID を入力。空なら新規作成
// ─────────────────────────────────────────────────────────────────────────

function createSurveyForm() {
  // フォーム作成
  var form = FormApp.create(FORM_TITLE);
  form.setDescription(
    'アクティビティへのご参加ありがとうございました！\n' +
    'これからの改善や次回の企画に活かすため、ぜひご回答ください。\n' +
    '（回答は任意です。所要時間：約3〜5分）'
  );
  form.setCollectEmail(false);
  form.setAllowResponseEdits(false);
  form.setConfirmationMessage('ご回答ありがとうございました！またお会いしましょう 🎉');

  // ── セクション 1：基本情報 ─────────────────────────────────────────────
  form.addSectionHeaderItem()
    .setTitle('📋 基本情報')
    .setHelpText('任意です。記入しなくても送信できます。');

  form.addTextItem()
    .setTitle('お名前（ニックネームでもOK）')
    .setRequired(false);

  form.addMultipleChoiceItem()
    .setTitle('参加したときの状況を教えてください')
    .setChoiceValues([
      '授業・ワークショップとして参加した',
      '自習・自主学習として試した',
      'デモやイベントで見た・触れた',
      'その他'
    ])
    .showOtherOption(true)
    .setRequired(false);

  // ── セクション 2：感想 ────────────────────────────────────────────────
  form.addPageBreakItem()
    .setTitle('😊 感想')
    .setHelpText('今日のアクティビティについて教えてください');

  form.addScaleItem()
    .setTitle('全体的な満足度を教えてください')
    .setLabels('あまり楽しくなかった', 'とても楽しかった！')
    .setBounds(1, 5)
    .setRequired(true);

  form.addCheckboxItem()
    .setTitle('一番楽しかったパートはどれですか？（複数選択可）')
    .setChoiceValues([
      'Aria — キーワードを選ぶところ',
      'Aria — AIがあらすじ・ストーリーを生成するところ',
      'Canon — テキストをノベルゲームに変換するところ',
      'Canon — キャラや背景・BGMを設定するところ',
      'Sonnet — 実際にノベルゲームをプレイするところ',
      '全体の流れ（Aria→Canon→Sonnetの一連の体験）',
      'Google スプレッドシートと連動する仕組み'
    ])
    .showOtherOption(true)
    .setRequired(false);

  form.addParagraphTextItem()
    .setTitle('感想・良かった点を自由にどうぞ')
    .setHelpText('どんな小さなことでもOKです')
    .setRequired(false);

  // ── セクション 3：難しかった点・要望 ────────────────────────────────
  form.addPageBreakItem()
    .setTitle('🔧 難しかった点・改善してほしいこと')
    .setHelpText('率直なご意見がとても参考になります');

  form.addScaleItem()
    .setTitle('操作の難しさはどうでしたか？')
    .setLabels('難しすぎた', '簡単すぎた')
    .setBounds(1, 5)
    .setRequired(false);

  form.addCheckboxItem()
    .setTitle('難しかった・わかりにくかった点はありますか？（複数選択可）')
    .setChoiceValues([
      'Aria の操作・手順',
      'Canon の操作・手順',
      'Sonnet の操作・手順',
      'GAS（Google Apps Script）の設定',
      'Google スプレッドシートとの連携',
      '説明（ガイドや手順書）がわかりにくかった',
      '特になし'
    ])
    .showOtherOption(true)
    .setRequired(false);

  form.addParagraphTextItem()
    .setTitle('改善してほしい点・こうなったらもっと使いやすいというアイデアがあれば')
    .setRequired(false);

  form.addParagraphTextItem()
    .setTitle('あったらいいなと思う機能やコンテンツはありますか？')
    .setHelpText('例：もっと多くのキーワードが選びたい、BGMを自分で追加したいなど')
    .setRequired(false);

  // ── セクション 4：次の展開 ────────────────────────────────────────────
  form.addPageBreakItem()
    .setTitle('🚀 次の展開・もっとやってみたいこと')
    .setHelpText('次回以降の企画の参考にします');

  form.addCheckboxItem()
    .setTitle('次回やってみたいこと・もっと深めたいことはありますか？（複数選択可）')
    .setChoiceValues([
      '自分でオリジナルのキーワードセットを作ってみたい',
      '立ち絵（キャラクターの画像）を自分でデザインしてみたい',
      'BGMや効果音を自分で追加してみたい',
      'もっと長いストーリー（複数ルート・分岐）を作ってみたい',
      '友達と一緒に共同制作してみたい',
      '作った作品を他の人にプレイしてもらいたい',
      'AIの仕組み（プロンプト設計など）をもっと学びたい',
      'コードを読んで自分でカスタマイズしてみたい'
    ])
    .showOtherOption(true)
    .setRequired(false);

  form.addParagraphTextItem()
    .setTitle('このしくみを応用してやってみたいことはありますか？')
    .setHelpText('例：部活の紹介動画のシナリオに使いたい、英語学習に応用したいなど、どんなアイデアでも！')
    .setRequired(false);

  form.addMultipleChoiceItem()
    .setTitle('このアクティビティを誰かに勧めたいと思いますか？')
    .setChoiceValues([
      '友達・クラスメートに勧めたい',
      '家族に勧めたい',
      '先生や先輩に勧めたい',
      'SNSでシェアしたい',
      'あまり勧めたいとは思わない'
    ])
    .showOtherOption(true)
    .setRequired(false);

  // ── セクション 5：その他・自由記述 ──────────────────────────────────
  form.addPageBreakItem()
    .setTitle('💬 その他・自由コメント');

  form.addParagraphTextItem()
    .setTitle('授業・ワークショップで活用するとしたら、どんな場面で使えそうですか？')
    .setHelpText('国語・英語・総合学習・部活動・学文祭など、具体的なイメージがあれば')
    .setRequired(false);

  form.addParagraphTextItem()
    .setTitle('制作者へのメッセージ・その他なんでも')
    .setRequired(false);

  // ── スプレッドシートへの回答リンク ────────────────────────────────────
  var ss;
  if (SPREADSHEET_ID && SPREADSHEET_ID.length > 0) {
    try {
      ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    } catch (e) {
      Logger.log('⚠️ SPREADSHEET_ID が無効です。新規スプシを作成します: ' + e.message);
      ss = null;
    }
  }

  if (ss) {
    // 既存スプシに「アンケート回答」シートを作って紐付け
    var sheetName = 'アンケート回答';
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) sheet = ss.insertSheet(sheetName);
    form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
    Logger.log('✅ 既存スプシ「' + ss.getName() + '」の「' + sheetName + '」シートに回答が記録されます');
  } else {
    // FormApp がデフォルトで新規スプシを作成する
    form.setDestination(FormApp.DestinationType.SPREADSHEET,
      SpreadsheetApp.create(FORM_TITLE + ' 回答').getId());
    Logger.log('✅ 新しいスプレッドシートを作成して回答を記録します（Google ドライブをご確認ください）');
  }

  // ── 結果出力 ──────────────────────────────────────────────────────────
  var editUrl     = form.getEditUrl();
  var publishUrl  = form.getPublishedUrl();
  var shortUrl    = form.shortenFormUrl(publishUrl);

  Logger.log('');
  Logger.log('════════════════════════════════════════════════════');
  Logger.log('🎉 フォームを作成しました！');
  Logger.log('════════════════════════════════════════════════════');
  Logger.log('');
  Logger.log('【参加者に共有するURL】');
  Logger.log(shortUrl);
  Logger.log('');
  Logger.log('【フォーム編集URL（管理者用）】');
  Logger.log(editUrl);
  Logger.log('');
  Logger.log('【フォームID】');
  Logger.log(form.getId());
  Logger.log('════════════════════════════════════════════════════');
}

/**
 * （補助）既存フォームをすべて削除したいときに使う関数。
 * 誤実行防止のためデフォルトはコメントアウト。
 * 必要なときだけコメントを外して実行してください。
 */
// function deleteAllForms() {
//   var files = DriveApp.getFilesByType(MimeType.GOOGLE_FORMS);
//   while (files.hasNext()) {
//     var file = files.next();
//     if (file.getName().indexOf('AIで物語') !== -1) {
//       file.setTrashed(true);
//       Logger.log('削除: ' + file.getName());
//     }
//   }
// }
