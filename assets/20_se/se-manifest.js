// 自動生成: SE マニフェスト
// 件数: 56件 / カテゴリ: 4個
//
// 各エントリ: { label, url, loop, vol, cat, tags[] }
// cat: env / horror / human / sys
// 使用: Audio.playSE("se_id")  / Audio.playAmbient("se_id")

/* global SE ID リスト (GAS プロンプト用)
   env_rain_1min: 雨音 | tags: 嵐, 雨
   env_rain_loop: rain_loop | tags: 嵐, 雨
   env_stream_1min: 川の音 | tags: 川, 自然
   env_thunder: 雷 | tags: 嵐, 雷
   env_train_1min: 電車 | tags: 嵐, 鉄道, 雨, 電車
   env_train_loop: train_loop | tags: 嵐, 鉄道, 雨, 電車
   horror_squashy_sticky_long: ぬるぬる（長） | tags: ぬるぬる, ホラー, 不気味
   horror_squashy_sticky_middle: ぬるぬる（中） | tags: ぬるぬる, ホラー, 不気味
   horror_squashy_sticky_oneshot: ぬるぬる（単） | tags: ぬるぬる, ホラー, 不気味
   horror_zombie_attack01: ゾンビ攻撃1 | tags: ゾンビ, ホラー, 攻撃
   horror_zombie_attack02: ゾンビ攻撃2 | tags: ゾンビ, ホラー, 攻撃
   horror_zombie_attack03: ゾンビ攻撃3 | tags: ゾンビ, ホラー, 攻撃
   horror_zombie_growl01: ゾンビうめき1 | tags: うめき, ゾンビ, ホラー
   horror_zombie_growl02: ゾンビうめき2 | tags: うめき, ゾンビ, ホラー
   horror_zombie_growl03: ゾンビうめき3 | tags: うめき, ゾンビ, ホラー
   horror_zombie_growl04: ゾンビうめき4 | tags: うめき, ゾンビ, ホラー
   human_footstep_fast: 足音（速） | tags: 歩く, 走る, 足音, 速い
   human_footstep_high: 足音（高） | tags: 歩く, 足音
   human_footstep_low: 足音（低） | tags: 歩く, 足音
   human_footstep_middle: 足音（中） | tags: 歩く, 足音
   human_footstep_slow: 足音（遅） | tags: ゆっくり, 歩く, 足音, 遅い
   human_footstep_veryslow: 足音（超遅） | tags: ゆっくり, 忍び歩き, 歩く, 足音, 遅い, 静か
   human_heartbeat_1shot: 心拍（単発） | tags: 心拍, 緊張
   human_heartbeat_long_fast: 心拍（速） | tags: 心拍, 緊張, 走る, 速い
   human_heartbeat_long_slow: 心拍（遅） | tags: ゆっくり, 心拍, 緊張, 遅い
   human_telephone_4call: 電話 | tags: 呼び出し, 電話
   sys_battle_start: 戦闘開始 | tags: バトル, 戦闘
   sys_buzzer: ブザー | tags: エラー, 不正解
   sys_cancel_01: キャンセル1 | tags: キャンセル, 戻る
   sys_cancel_02: キャンセル2 | tags: キャンセル, 戻る
   sys_cursor_01: カーソル1 | tags: カーソル, 選択
   sys_cursor_02: カーソル2 | tags: カーソル, 選択
   sys_cursor_03: カーソル3 | tags: カーソル, 選択
   sys_damage01: ダメージ1 | tags: ダメージ, 攻撃
   sys_damage02: ダメージ2 | tags: ダメージ, 攻撃
   sys_damage03: ダメージ3 | tags: ダメージ, 攻撃
   sys_enemy_attack: 敵攻撃 | tags: 攻撃, 敵
   sys_item_01: アイテム1 | tags: アイテム, 入手
   sys_item_02: アイテム2 | tags: アイテム, 入手
   sys_kaifuku: 回復 | tags: 回復, 治る
   sys_kettei_01: 決定1 | tags: OK, 決定, 選択
   sys_kettei_02: 決定2 | tags: OK, 決定, 選択
   sys_kougekikaihi_01: 回避1 | tags: かわす, 回避
   sys_kougekikaihi_02: 回避2 | tags: かわす, 回避
   sys_load: ロード | tags: ロード, 読み込み
   sys_miss: ミス | tags: ミス, 外れ
   sys_save_01: セーブ1 | tags: セーブ, 保存
   sys_save_02: セーブ2 | tags: セーブ, 保存
   sys_sentoufunou: 戦闘不能 | tags: やられた, 戦闘不能, 敗北
   sys_shop: ショップ | tags: ショップ, 購入
   sys_skill: スキル | tags: スキル, 魔法
   sys_soubi_01: 装備1 | tags: 装備
   sys_soubi_02: 装備2 | tags: 装備
   sys_teki_syoumetsu: 敵消滅 | tags: 勝利, 敵消滅
   sys_tousou_01: 逃走1 | tags: 逃げる, 逃走
   sys_tousou_02: 逃走2 | tags: 逃げる, 逃走
*/

window.SE_MANIFEST = {
  env_rain_1min: { label:"雨音", url:"../assets/20_se/environmental_sfx%E3%81%AE%E3%82%B3%E3%83%94%E3%83%BC/mp3/rain-1min.mp3", loop:true, vol:0.34, cat:"env", tags:["嵐", "雨"] },
  env_rain_loop: { label:"rain_loop", url:"../assets/20_se/environmental_sfx%E3%81%AE%E3%82%B3%E3%83%94%E3%83%BC/ogg/rain_loop.ogg", loop:true, vol:0.34, cat:"env", tags:["嵐", "雨"] },
  env_stream_1min: { label:"川の音", url:"../assets/20_se/environmental_sfx%E3%81%AE%E3%82%B3%E3%83%94%E3%83%BC/mp3/stream-1min.mp3", loop:true, vol:0.34, cat:"env", tags:["川", "自然"] },
  env_thunder: { label:"雷", url:"../assets/20_se/environmental_sfx%E3%81%AE%E3%82%B3%E3%83%94%E3%83%BC/ogg/thunder.ogg", loop:false, vol:0.4, cat:"env", tags:["嵐", "雷"] },
  env_train_1min: { label:"電車", url:"../assets/20_se/environmental_sfx%E3%81%AE%E3%82%B3%E3%83%94%E3%83%BC/mp3/train-1min.mp3", loop:true, vol:0.34, cat:"env", tags:["嵐", "鉄道", "雨", "電車"] },
  env_train_loop: { label:"train_loop", url:"../assets/20_se/environmental_sfx%E3%81%AE%E3%82%B3%E3%83%94%E3%83%BC/ogg/train_loop.ogg", loop:true, vol:0.34, cat:"env", tags:["嵐", "鉄道", "雨", "電車"] },
  horror_squashy_sticky_long: { label:"ぬるぬる（長）", url:"../assets/20_se/horror_sfx%E3%81%AE%E3%82%B3%E3%83%94%E3%83%BC/ogg/squashy-sticky_long.ogg", loop:false, vol:0.65, cat:"horror", tags:["ぬるぬる", "ホラー", "不気味"] },
  horror_squashy_sticky_middle: { label:"ぬるぬる（中）", url:"../assets/20_se/horror_sfx%E3%81%AE%E3%82%B3%E3%83%94%E3%83%BC/ogg/squashy-sticky_middle.ogg", loop:false, vol:0.65, cat:"horror", tags:["ぬるぬる", "ホラー", "不気味"] },
  horror_squashy_sticky_oneshot: { label:"ぬるぬる（単）", url:"../assets/20_se/horror_sfx%E3%81%AE%E3%82%B3%E3%83%94%E3%83%BC/ogg/squashy-sticky_oneshot.ogg", loop:false, vol:0.65, cat:"horror", tags:["ぬるぬる", "ホラー", "不気味"] },
  horror_zombie_attack01: { label:"ゾンビ攻撃1", url:"../assets/20_se/horror_sfx%E3%81%AE%E3%82%B3%E3%83%94%E3%83%BC/ogg/zombie_attack01.ogg", loop:false, vol:0.65, cat:"horror", tags:["ゾンビ", "ホラー", "攻撃"] },
  horror_zombie_attack02: { label:"ゾンビ攻撃2", url:"../assets/20_se/horror_sfx%E3%81%AE%E3%82%B3%E3%83%94%E3%83%BC/ogg/zombie_attack02.ogg", loop:false, vol:0.65, cat:"horror", tags:["ゾンビ", "ホラー", "攻撃"] },
  horror_zombie_attack03: { label:"ゾンビ攻撃3", url:"../assets/20_se/horror_sfx%E3%81%AE%E3%82%B3%E3%83%94%E3%83%BC/ogg/zombie_attack03.ogg", loop:false, vol:0.65, cat:"horror", tags:["ゾンビ", "ホラー", "攻撃"] },
  horror_zombie_growl01: { label:"ゾンビうめき1", url:"../assets/20_se/horror_sfx%E3%81%AE%E3%82%B3%E3%83%94%E3%83%BC/ogg/zombie_growl01.ogg", loop:false, vol:0.65, cat:"horror", tags:["うめき", "ゾンビ", "ホラー"] },
  horror_zombie_growl02: { label:"ゾンビうめき2", url:"../assets/20_se/horror_sfx%E3%81%AE%E3%82%B3%E3%83%94%E3%83%BC/ogg/zombie_growl02.ogg", loop:false, vol:0.65, cat:"horror", tags:["うめき", "ゾンビ", "ホラー"] },
  horror_zombie_growl03: { label:"ゾンビうめき3", url:"../assets/20_se/horror_sfx%E3%81%AE%E3%82%B3%E3%83%94%E3%83%BC/ogg/zombie_growl03.ogg", loop:false, vol:0.65, cat:"horror", tags:["うめき", "ゾンビ", "ホラー"] },
  horror_zombie_growl04: { label:"ゾンビうめき4", url:"../assets/20_se/horror_sfx%E3%81%AE%E3%82%B3%E3%83%94%E3%83%BC/ogg/zombie_growl04.ogg", loop:false, vol:0.65, cat:"horror", tags:["うめき", "ゾンビ", "ホラー"] },
  human_footstep_fast: { label:"足音（速）", url:"../assets/20_se/human_sfx%E3%81%AE%E3%82%B3%E3%83%94%E3%83%BC/ogg/Footstep-fast.ogg", loop:false, vol:0.55, cat:"human", tags:["歩く", "走る", "足音", "速い"] },
  human_footstep_high: { label:"足音（高）", url:"../assets/20_se/human_sfx%E3%81%AE%E3%82%B3%E3%83%94%E3%83%BC/ogg/Footstep-high.ogg", loop:false, vol:0.55, cat:"human", tags:["歩く", "足音"] },
  human_footstep_low: { label:"足音（低）", url:"../assets/20_se/human_sfx%E3%81%AE%E3%82%B3%E3%83%94%E3%83%BC/ogg/Footstep-low.ogg", loop:false, vol:0.55, cat:"human", tags:["歩く", "足音"] },
  human_footstep_middle: { label:"足音（中）", url:"../assets/20_se/human_sfx%E3%81%AE%E3%82%B3%E3%83%94%E3%83%BC/ogg/Footstep-middle.ogg", loop:false, vol:0.55, cat:"human", tags:["歩く", "足音"] },
  human_footstep_slow: { label:"足音（遅）", url:"../assets/20_se/human_sfx%E3%81%AE%E3%82%B3%E3%83%94%E3%83%BC/ogg/Footstep-slow.ogg", loop:false, vol:0.55, cat:"human", tags:["ゆっくり", "歩く", "足音", "遅い"] },
  human_footstep_veryslow: { label:"足音（超遅）", url:"../assets/20_se/human_sfx%E3%81%AE%E3%82%B3%E3%83%94%E3%83%BC/ogg/Footstep-veryslow.ogg", loop:false, vol:0.55, cat:"human", tags:["ゆっくり", "忍び歩き", "歩く", "足音", "遅い", "静か"] },
  human_heartbeat_1shot: { label:"心拍（単発）", url:"../assets/20_se/human_sfx%E3%81%AE%E3%82%B3%E3%83%94%E3%83%BC/ogg/HeartBeat-1shot.ogg", loop:false, vol:0.55, cat:"human", tags:["心拍", "緊張"] },
  human_heartbeat_long_fast: { label:"心拍（速）", url:"../assets/20_se/human_sfx%E3%81%AE%E3%82%B3%E3%83%94%E3%83%BC/ogg/HeartBeat-long_fast.ogg", loop:true, vol:0.47, cat:"human", tags:["心拍", "緊張", "走る", "速い"] },
  human_heartbeat_long_slow: { label:"心拍（遅）", url:"../assets/20_se/human_sfx%E3%81%AE%E3%82%B3%E3%83%94%E3%83%BC/ogg/HeartBeat-long_slow.ogg", loop:true, vol:0.47, cat:"human", tags:["ゆっくり", "心拍", "緊張", "遅い"] },
  human_telephone_4call: { label:"電話", url:"../assets/20_se/human_sfx%E3%81%AE%E3%82%B3%E3%83%94%E3%83%BC/ogg/telephone-4call.ogg", loop:false, vol:0.55, cat:"human", tags:["呼び出し", "電話"] },
  sys_battle_start: { label:"戦闘開始", url:"../assets/20_se/rpgmaker_systemSE%E3%81%AE%E3%82%B3%E3%83%94%E3%83%BC/ogg/battle-start.ogg", loop:false, vol:0.45, cat:"sys", tags:["バトル", "戦闘"] },
  sys_buzzer: { label:"ブザー", url:"../assets/20_se/rpgmaker_systemSE%E3%81%AE%E3%82%B3%E3%83%94%E3%83%BC/ogg/buzzer.ogg", loop:false, vol:0.45, cat:"sys", tags:["エラー", "不正解"] },
  sys_cancel_01: { label:"キャンセル1", url:"../assets/20_se/rpgmaker_systemSE%E3%81%AE%E3%82%B3%E3%83%94%E3%83%BC/ogg/cancel-01.ogg", loop:false, vol:0.45, cat:"sys", tags:["キャンセル", "戻る"] },
  sys_cancel_02: { label:"キャンセル2", url:"../assets/20_se/rpgmaker_systemSE%E3%81%AE%E3%82%B3%E3%83%94%E3%83%BC/ogg/cancel-02.ogg", loop:false, vol:0.45, cat:"sys", tags:["キャンセル", "戻る"] },
  sys_cursor_01: { label:"カーソル1", url:"../assets/20_se/rpgmaker_systemSE%E3%81%AE%E3%82%B3%E3%83%94%E3%83%BC/ogg/cursor-01.ogg", loop:false, vol:0.45, cat:"sys", tags:["カーソル", "選択"] },
  sys_cursor_02: { label:"カーソル2", url:"../assets/20_se/rpgmaker_systemSE%E3%81%AE%E3%82%B3%E3%83%94%E3%83%BC/ogg/cursor-02.ogg", loop:false, vol:0.45, cat:"sys", tags:["カーソル", "選択"] },
  sys_cursor_03: { label:"カーソル3", url:"../assets/20_se/rpgmaker_systemSE%E3%81%AE%E3%82%B3%E3%83%94%E3%83%BC/ogg/cursor-03.ogg", loop:false, vol:0.45, cat:"sys", tags:["カーソル", "選択"] },
  sys_damage01: { label:"ダメージ1", url:"../assets/20_se/rpgmaker_systemSE%E3%81%AE%E3%82%B3%E3%83%94%E3%83%BC/ogg/damage01.ogg", loop:false, vol:0.45, cat:"sys", tags:["ダメージ", "攻撃"] },
  sys_damage02: { label:"ダメージ2", url:"../assets/20_se/rpgmaker_systemSE%E3%81%AE%E3%82%B3%E3%83%94%E3%83%BC/ogg/damage02.ogg", loop:false, vol:0.45, cat:"sys", tags:["ダメージ", "攻撃"] },
  sys_damage03: { label:"ダメージ3", url:"../assets/20_se/rpgmaker_systemSE%E3%81%AE%E3%82%B3%E3%83%94%E3%83%BC/ogg/damage03.ogg", loop:false, vol:0.45, cat:"sys", tags:["ダメージ", "攻撃"] },
  sys_enemy_attack: { label:"敵攻撃", url:"../assets/20_se/rpgmaker_systemSE%E3%81%AE%E3%82%B3%E3%83%94%E3%83%BC/ogg/enemy-attack.ogg", loop:false, vol:0.45, cat:"sys", tags:["攻撃", "敵"] },
  sys_item_01: { label:"アイテム1", url:"../assets/20_se/rpgmaker_systemSE%E3%81%AE%E3%82%B3%E3%83%94%E3%83%BC/ogg/item-01.ogg", loop:false, vol:0.45, cat:"sys", tags:["アイテム", "入手"] },
  sys_item_02: { label:"アイテム2", url:"../assets/20_se/rpgmaker_systemSE%E3%81%AE%E3%82%B3%E3%83%94%E3%83%BC/ogg/item-02.ogg", loop:false, vol:0.45, cat:"sys", tags:["アイテム", "入手"] },
  sys_kaifuku: { label:"回復", url:"../assets/20_se/rpgmaker_systemSE%E3%81%AE%E3%82%B3%E3%83%94%E3%83%BC/ogg/kaifuku.ogg", loop:false, vol:0.45, cat:"sys", tags:["回復", "治る"] },
  sys_kettei_01: { label:"決定1", url:"../assets/20_se/rpgmaker_systemSE%E3%81%AE%E3%82%B3%E3%83%94%E3%83%BC/ogg/kettei-01.ogg", loop:false, vol:0.45, cat:"sys", tags:["OK", "決定", "選択"] },
  sys_kettei_02: { label:"決定2", url:"../assets/20_se/rpgmaker_systemSE%E3%81%AE%E3%82%B3%E3%83%94%E3%83%BC/ogg/kettei-02.ogg", loop:false, vol:0.45, cat:"sys", tags:["OK", "決定", "選択"] },
  sys_kougekikaihi_01: { label:"回避1", url:"../assets/20_se/rpgmaker_systemSE%E3%81%AE%E3%82%B3%E3%83%94%E3%83%BC/ogg/kougekikaihi-01.ogg", loop:false, vol:0.45, cat:"sys", tags:["かわす", "回避"] },
  sys_kougekikaihi_02: { label:"回避2", url:"../assets/20_se/rpgmaker_systemSE%E3%81%AE%E3%82%B3%E3%83%94%E3%83%BC/ogg/kougekikaihi-02.ogg", loop:false, vol:0.45, cat:"sys", tags:["かわす", "回避"] },
  sys_load: { label:"ロード", url:"../assets/20_se/rpgmaker_systemSE%E3%81%AE%E3%82%B3%E3%83%94%E3%83%BC/ogg/load.ogg", loop:false, vol:0.45, cat:"sys", tags:["ロード", "読み込み"] },
  sys_miss: { label:"ミス", url:"../assets/20_se/rpgmaker_systemSE%E3%81%AE%E3%82%B3%E3%83%94%E3%83%BC/ogg/miss.ogg", loop:false, vol:0.45, cat:"sys", tags:["ミス", "外れ"] },
  sys_save_01: { label:"セーブ1", url:"../assets/20_se/rpgmaker_systemSE%E3%81%AE%E3%82%B3%E3%83%94%E3%83%BC/ogg/save-01.ogg", loop:false, vol:0.45, cat:"sys", tags:["セーブ", "保存"] },
  sys_save_02: { label:"セーブ2", url:"../assets/20_se/rpgmaker_systemSE%E3%81%AE%E3%82%B3%E3%83%94%E3%83%BC/ogg/save-02.ogg", loop:false, vol:0.45, cat:"sys", tags:["セーブ", "保存"] },
  sys_sentoufunou: { label:"戦闘不能", url:"../assets/20_se/rpgmaker_systemSE%E3%81%AE%E3%82%B3%E3%83%94%E3%83%BC/ogg/sentoufunou.ogg", loop:false, vol:0.45, cat:"sys", tags:["やられた", "戦闘不能", "敗北"] },
  sys_shop: { label:"ショップ", url:"../assets/20_se/rpgmaker_systemSE%E3%81%AE%E3%82%B3%E3%83%94%E3%83%BC/ogg/shop.ogg", loop:false, vol:0.45, cat:"sys", tags:["ショップ", "購入"] },
  sys_skill: { label:"スキル", url:"../assets/20_se/rpgmaker_systemSE%E3%81%AE%E3%82%B3%E3%83%94%E3%83%BC/ogg/skill.ogg", loop:false, vol:0.45, cat:"sys", tags:["スキル", "魔法"] },
  sys_soubi_01: { label:"装備1", url:"../assets/20_se/rpgmaker_systemSE%E3%81%AE%E3%82%B3%E3%83%94%E3%83%BC/ogg/soubi-01.ogg", loop:false, vol:0.45, cat:"sys", tags:["装備"] },
  sys_soubi_02: { label:"装備2", url:"../assets/20_se/rpgmaker_systemSE%E3%81%AE%E3%82%B3%E3%83%94%E3%83%BC/ogg/soubi-02.ogg", loop:false, vol:0.45, cat:"sys", tags:["装備"] },
  sys_teki_syoumetsu: { label:"敵消滅", url:"../assets/20_se/rpgmaker_systemSE%E3%81%AE%E3%82%B3%E3%83%94%E3%83%BC/ogg/teki-syoumetsu.ogg", loop:false, vol:0.45, cat:"sys", tags:["勝利", "敵消滅"] },
  sys_tousou_01: { label:"逃走1", url:"../assets/20_se/rpgmaker_systemSE%E3%81%AE%E3%82%B3%E3%83%94%E3%83%BC/ogg/tousou-01.ogg", loop:false, vol:0.45, cat:"sys", tags:["逃げる", "逃走"] },
  sys_tousou_02: { label:"逃走2", url:"../assets/20_se/rpgmaker_systemSE%E3%81%AE%E3%82%B3%E3%83%94%E3%83%BC/ogg/tousou-02.ogg", loop:false, vol:0.45, cat:"sys", tags:["逃げる", "逃走"] }
};
