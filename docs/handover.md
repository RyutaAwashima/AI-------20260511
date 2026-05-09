# 引き継ぎメモ — AIで物語を作ろう（2026.5.11）

最終更新: 2026年5月9日

---

## 1. プロジェクト概要

**イベント**: ふれあいタイム 第1回「AIで物語を作ろう」  
**日時**: 2026年5月11日（月）  
**対象**: 不登校の子ども 10名 / 45分  
**目的**: AIと一緒に物語を作る体験を通じて、創造的な自己表現を楽しむ

---

## 2. フォルダ構成

```
AIで物語を作ろう20260511/
├── aria/               ← メインアプリ（物語生成）
│   ├── index.html      ← Aria 本体（フロントエンド）
│   └── gas_proxy.gs    ← GAS バックエンド（Gemini API プロキシ + Sheets保存）
├── canon/
│   └── index.html      ← ノベルゲームデータ変換エディタ
├── sonnet/
│   ├── index.html      ← サウンドノベルプレイヤー
│   ├── engine.js       ← ノベルエンジン本体
│   └── stories.js      ← ストーリーデータ読み込み
├── stories/
│   └── sample_001〜003.json  ← サンプルストーリー
└── docs/
    ├── guide.html           ← 参加者向けガイド
    ├── briefing.html        ← スタッフ向けブリーフィング
    ├── slides.html          ← 当日スライド
    ├── resume.html          ← 再開手順書
    ├── create_survey_form.gs ← アンケートフォーム自動生成スクリプト
    ├── handover.md          ← このファイル
    └── スタッフ向けブリーフィング｜AIで物語を作ろう.pdf
```

---

## 3. インフラ構成

### GitHub リポジトリ
- **URL**: https://github.com/RyutaAwashima/AI-------20260511
- **ブランチ**: main（本番）
- **公開設定**: プライベート

### GAS（Google Apps Script）
- **デプロイ済みURL**:  
  `https://script.google.com/macros/s/AKfycbzdSAoFA7G9ByUdbQDqDIUcDTn4iCI-vhD37BSJFK2CMzO7awdY_kz1j3SZdjnW8eXv/exec`
- **使用モデル**: `gemini-2.5-flash-lite`
- **スクリプトプロパティ（GAS側に設定済み）**:
  - `GEMINI_API_KEY` — Google AI Studio で取得したAPIキー
  - `SPREADSHEET_ID` — 保存先スプレッドシートのID

### GAS のアクション一覧

| action | 用途 |
|--------|------|
| `generate` | あらすじ生成（Aria） |
| `save` | Sheets への保存（Aria） |
| `weave` | フルストーリー一発生成（通常モード） |
| `weave_chapters` | 4章分割生成 ＋ 伏線TODO管理 |
| `regenerate_chapter` | 特定章を再生成（単章 or 以降cascade） |
| `extract` | 登場人物抽出（Canon） |
| `convert` | テキスト→ノベルJSON変換（Canon） |
| `list_aria_stories` | Aria生成ストーリー一覧（Canon連携） |
| `load_aria_story` | Aria行の詳細取得 |
| `save_canon_json` | ノベルJSONを保存（Canon→Sonnet） |
| `list_stories` | ノベルJSONあり一覧（Sonnet） |
| `load_story` | ノベルJSONを取得（Sonnet） |

---

## 4. Aria（メインアプリ）の仕様

### 動作フロー
1. **STEP 1**: キーワード選択 → あらすじ生成（`generate`）
2. **STEP 2**: ストーリー紡ぎ
   - **通常モード**: 一発生成（`weave`）
   - **章立てモード（4章）**: 4回に分割生成（`weave_chapters`）
3. **STEP 3**: 完成ストーリー表示
   - 章ごとの手編集テキストエリア
   - 「この章だけ再生成」「この章以降を再生成」ボタン
   - デバッグ：伏線チェックリスト表示パネル（折りたたみ式）

### 章立てモードの内部処理（GAS）
```
1. buildForeshadowChecklist()  → あらすじから伏線TODO(4〜6個)を生成
2. 第1章生成 → updateChecklistAfterChapter()  ← 新規伏線も自動追加
3. 第2章生成 → updateChecklistAfterChapter()  ← 新規伏線も自動追加
4. 第3章生成 → updateChecklistAfterChapter()
5. 第4章生成（未回収があれば buildFinalRecoveryPrompt() で強制回収）
```

### 章立て生成のプロンプト設計（現在の実装）

| 機能 | 設計 |
|------|------|
| 前章コンテキスト | `chapterDigest()`: 冒頭200字 ＋ 末尾400字 を次章に渡す |
| 伏線管理 | チェックリスト(pending/partial/resolved)を全章通しで管理 |
| 章固有のルール | 第1章:伏線最大3つ / 第2章:最大2つ / 第3章:半分回収 / 第4章:全回収 |
| 重複防止 | 「前章で済みのシーン（覚醒・出会いなど）は繰り返さない」を明示 |
| 最終章フォールバック | 未回収TODO残存時 → `buildFinalRecoveryPrompt()` で第4章再生成 |

---

## 5. 既知の課題と対処方針

### ✅ 解決済み
- **ストーリーが途中で切れる** → `maxOutputTokens` 8192に増加 ＋ 章分割生成
- **伏線が未回収のまま終わる** → チェックリスト機構 ＋ 最終章フォールバック
- **第2章で新規追加した伏線がTODOに入らない** → `updateChecklistAfterChapter()` が第1・2章後に新規伏線を自動抽出・追加

### ⚠ 現在対処中
- **章の冒頭が前章の焼き直しになる問題**
  - **アイデア1（実施済み）**: 前章要約を「末尾優先」に変更（冒頭200字 ＋ 末尾400字）
  - **アイデア2（未実施）**: 章ごとに「前章終了ステート構造体」をGeminiで生成し次章に注入
    ```json
    {
      "last_scene": "塔の部屋で二人が向き合っている",
      "character_states": { "リリア": "協力を決意した", "アリア": "使命を思い出した" },
      "already_revealed": ["アリアはロボット", "絵画に記号がある"]
    }
    ```
    アイデア1で改善が不十分な場合はこちらを実装する。

### 🔲 未着手（余裕があれば）
- **Canon**: 長文ストーリーの分割変換（一度に処理できる文字数の上限対策）
- **Canon**: エディタ機能の充実（キャラ画像プレビュー、背景一覧など）
- **Sonnet**: 演出・レイアウト強化（フェードイン、BGM対応など）

---

## 6. ローカル起動方法

サーバー不要。ブラウザで直接ファイルを開くだけ。

```
aria/index.html    ← ダブルクリックで起動
canon/index.html
sonnet/index.html
docs/guide.html    ← 参加者向けガイド
```

> `file://` プロトコル対応済み。ローカルCORSの問題は GAS 側で `text/plain` POST により回避済み。

---

## 7. GAS 再デプロイ手順

コードを変更した場合は以下の手順でデプロイする。

1. Google Apps Script の編集画面を開く
2. `gas_proxy.gs` の内容を全選択して貼り替える
3. 「デプロイ」→「デプロイを管理」→ 鉛筆アイコン（編集）
4. バージョンを「新しいバージョン」にして保存
5. デプロイURLは変わらない（同じURLを使い続けられる）

---

## 8. ファイル変更履歴（主要なもの）

| 日付 | ファイル | 内容 |
|------|---------|------|
| 5/7 | docs/* | guide.html 相対パス修正、briefing/slides/resume/survey GAS 作成 |
| 5/7 | aria/gas_proxy.gs | callGeminiRaw 分離、maxOutputTokens 8192 |
| 5/7 | aria/gas_proxy.gs | handleWeaveChapters（3章→4章）、伏線TODOシステム追加 |
| 5/7 | aria/index.html | キーワードリセットボタン、章立てモード UI |
| 5/7 | aria/index.html | 章エディタ（手編集 ＋ 2モード再生成ボタン） |
| 5/8 | aria/gas_proxy.gs | 前章要約文字数 240→600、章別伏線ルール追加 |
| 5/8 | aria/gas_proxy.gs | updateChecklistAfterChapter: 新規伏線の自動追加機能 |
| 5/8 | aria/index.html | デバッグパネル（伏線チェックリスト）追加 |
| 5/9 | aria/gas_proxy.gs | chapterDigest(): 前章要約を末尾優先に変更（冒頭200＋末尾400） |
| 5/9 | aria/gas_proxy.gs | 章プロンプトに「前章シーンの繰り返し禁止」ルール追加 |
