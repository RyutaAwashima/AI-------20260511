/**
 * stories.js
 * サンプルストーリーをインライン定義（JSONファイルのfetch不要でfile://でも動く）
 */

const STORIES = [
  {
    meta: {
      id: "sample_001",
      title: "廃校の約束",
      genre: "ホラー・感動",
      assets: {
        characters: {
          haruka: { name: "ハルカ", color: "#c8a0c8", emoji: "👧" },
          yui:    { name: "ユイ",   color: "#a0c0e8", emoji: "👻" }
        },
        backgrounds: {
          classroom: { label: "廃校の教室", color: "#1a1520", accent: "#2a2030" },
          rooftop:   { label: "屋上（夕暮れ）", color: "#2a1a0a", accent: "#3a2810" }
        },
        bgm: {
          eerie:     "eerie（不気味）",
          emotional: "emotional（切ない）",
          hopeful:   "hopeful（希望）"
        }
      }
    },
    scenes: [
      {
        id: "scene_001", background: "classroom", bgm: "eerie",
        lines: [
          { type: "narration", text: "廃校になって三年。この建物に近づく生徒はほとんどいない。" },
          { type: "narration", text: "ハルカは何かに引き寄せられるように、壊れかけた扉を押し開けた。" },
          { type: "dialogue", character: "haruka", position: "left", expression: "normal", text: "…なんで私、ここに来ちゃったんだろう。" },
          { type: "narration", text: "埃の積もった黒板。倒れたままの椅子。そして窓際に――" },
          { type: "narration", text: "女の子が、座っていた。" },
          { type: "scene_end", next: "scene_002" }
        ]
      },
      {
        id: "scene_002", background: "classroom", bgm: "eerie",
        lines: [
          { type: "dialogue", character: "yui", position: "right", expression: "sad", text: "……来てくれたんだ。" },
          { type: "dialogue", character: "haruka", position: "left", expression: "surprised", text: "え…っ！？　誰！？" },
          { type: "dialogue", character: "yui", position: "right", expression: "sad", text: "怖がらないで。ただ……話したかっただけ。" },
          { type: "choice", text: "どうする？", options: [
            { label: "話しかけてみる", next: "scene_003a" },
            { label: "逃げようとする", next: "scene_003b" }
          ]}
        ]
      },
      {
        id: "scene_003a", background: "classroom", bgm: "eerie",
        lines: [
          { type: "dialogue", character: "haruka", position: "left", expression: "normal", text: "…あなた、誰？ここで何してるの？" },
          { type: "dialogue", character: "yui", position: "right", expression: "sad", text: "私の名前はユイ。昔、この学校に通ってた。" },
          { type: "dialogue", character: "haruka", position: "left", expression: "surprised", text: "昔って…この学校、もう三年前に廃校に――" },
          { type: "dialogue", character: "yui", position: "right", expression: "sad", text: "うん。知ってる。" },
          { type: "narration", text: "その言葉の意味を、ハルカはゆっくりと理解した。" },
          { type: "dialogue", character: "yui", position: "right", expression: "sad", text: "屋上に、行ってもらえる？　話したいことがあるの。" },
          { type: "scene_end", next: "scene_004" }
        ]
      },
      {
        id: "scene_003b", background: "classroom", bgm: "eerie",
        lines: [
          { type: "narration", text: "逃げようとした瞬間、足がすくんで動けなくなった。" },
          { type: "dialogue", character: "yui", position: "right", expression: "sad", text: "ごめんね、驚かせて。でも……お願い、聞いてほしいことがあるの。" },
          { type: "narration", text: "その声はあまりにも悲しそうで、ハルカは思わず振り返った。" },
          { type: "dialogue", character: "haruka", position: "left", expression: "normal", text: "…わかった。聞く。" },
          { type: "dialogue", character: "yui", position: "right", expression: "sad", text: "屋上に来てくれる？　そこで話すね。" },
          { type: "scene_end", next: "scene_004" }
        ]
      },
      {
        id: "scene_004", background: "rooftop", bgm: "emotional",
        lines: [
          { type: "narration", text: "屋上は夕焼けに染まっていた。風がユイの髪を揺らす――透けて見える、その髪を。" },
          { type: "dialogue", character: "yui", position: "right", expression: "sad", text: "私、ここで転んで怪我をして、そのまま…だったの。誰にも気づかれないまま。" },
          { type: "dialogue", character: "haruka", position: "left", expression: "sad", text: "そんな…。" },
          { type: "dialogue", character: "yui", position: "right", expression: "sad", text: "ずっとここにいたの。誰かに、ちゃんと「さよなら」が言いたくて。" },
          { type: "dialogue", character: "haruka", position: "left", expression: "normal", text: "……私が聞くよ。ユイの「さよなら」。" },
          { type: "dialogue", character: "yui", position: "right", expression: "smile", text: "ありがとう。ここは…きれいな学校だったよ。みんなのことが、大好きだった。" },
          { type: "scene_end", next: "scene_005" }
        ]
      },
      {
        id: "scene_005", background: "rooftop", bgm: "hopeful",
        lines: [
          { type: "narration", text: "ユイの姿が、夕陽の光に溶けていくように薄くなっていった。" },
          { type: "dialogue", character: "yui", position: "right", expression: "smile", text: "会いに来てくれてよかった。もう、行けそう。" },
          { type: "dialogue", character: "haruka", position: "left", expression: "smile", text: "うん。行ってらっしゃい、ユイ。" },
          { type: "narration", text: "空に、一羽の鳥が飛び立った。" },
          { type: "narration", text: "ハルカはしばらくそこに立って、やがてゆっくりと歩き出した。胸の中に、ほんの少しあたたかいものを感じながら。" },
          { type: "scene_end", next: null }
        ]
      }
    ]
  },

  {
    meta: {
      id: "sample_002",
      title: "今日も放課後はカオスです",
      genre: "学園ガールズコメディ",
      assets: {
        characters: {
          miku: { name: "ミク",   color: "#f0a0c0", emoji: "🌸" },
          aoi:  { name: "アオイ", color: "#a0c8f0", emoji: "💙" },
          nana: { name: "ナナ",   color: "#b0e8b0", emoji: "🌿" }
        },
        backgrounds: {
          classroom: { label: "放課後の教室", color: "#1a1208", accent: "#2a1e10" },
          clubroom:  { label: "部室",         color: "#0e1a0e", accent: "#162416" },
          shop:      { label: "パワーストーンショップ", color: "#15101a", accent: "#201528" }
        },
        bgm: {
          cheerful:   "cheerful（ポップ）",
          silly:      "silly（コミカル）",
          triumphant: "triumphant（大げさ）"
        }
      }
    },
    scenes: [
      {
        id: "scene_001", background: "classroom", bgm: "cheerful",
        lines: [
          { type: "narration", text: "放課後の教室。掃除当番をなぜかさぼった三人が、机を囲んでいた。" },
          { type: "dialogue", character: "miku", position: "left", expression: "happy", text: "ねえねえ聞いて！ 昨日すっごいもの拾ったんだけど！" },
          { type: "dialogue", character: "aoi", position: "right", expression: "normal", text: "え、何なに？" },
          { type: "dialogue", character: "miku", position: "left", expression: "happy", text: "じゃーん！！" },
          { type: "narration", text: "ミクが取り出したのは、どう見ても普通の石ころだった。" },
          { type: "dialogue", character: "aoi", position: "right", expression: "angry", text: "石じゃん。" },
          { type: "dialogue", character: "miku", position: "left", expression: "confused", text: "でも、なんか光った気がして！" },
          { type: "dialogue", character: "aoi", position: "right", expression: "tired", text: "光らないよ！！" },
          { type: "choice", text: "そのときナナは……", options: [
            { label: "石をじっと見つめていた", next: "scene_002a" },
            { label: "ぜんぜん関係ないことをしていた", next: "scene_002b" }
          ]}
        ]
      },
      {
        id: "scene_002a", background: "classroom", bgm: "silly",
        lines: [
          { type: "narration", text: "ナナはいつの間にか石を手に取り、目を細めてじっと見つめていた。" },
          { type: "dialogue", character: "nana", position: "right", expression: "blank", text: "……これ、おにぎりに似てる。" },
          { type: "dialogue", character: "aoi", position: "left", expression: "surprised", text: "似てないから！！" },
          { type: "dialogue", character: "nana", position: "right", expression: "smile", text: "鮭の。" },
          { type: "dialogue", character: "aoi", position: "left", expression: "tired", text: "具まで決めなくていいから。" },
          { type: "dialogue", character: "miku", position: "left", expression: "happy", text: "あ！ 言われてみたら確かに鮭！" },
          { type: "dialogue", character: "aoi", position: "right", expression: "tired", text: "ふたりしてなんで乗っかってんの。" },
          { type: "scene_end", next: "scene_003" }
        ]
      },
      {
        id: "scene_002b", background: "classroom", bgm: "silly",
        lines: [
          { type: "narration", text: "ナナはいつの間にか自分の机で、なぜか折り紙を折り始めていた。" },
          { type: "dialogue", character: "aoi", position: "left", expression: "surprised", text: "ちょっとナナ、何してんの！？" },
          { type: "dialogue", character: "nana", position: "right", expression: "smile", text: "カブトムシ。" },
          { type: "dialogue", character: "miku", position: "left", expression: "happy", text: "え、折れるの！？ すごい！！" },
          { type: "dialogue", character: "aoi", position: "right", expression: "tired", text: "そこ感動するとこじゃない！" },
          { type: "dialogue", character: "nana", position: "right", expression: "blank", text: "ミクちゃんにあげる。石と交換で。" },
          { type: "dialogue", character: "miku", position: "left", expression: "happy", text: "やった！ 交渉成立！" },
          { type: "dialogue", character: "aoi", position: "right", expression: "tired", text: "どっちも価値ゼロじゃん……。" },
          { type: "scene_end", next: "scene_003" }
        ]
      },
      {
        id: "scene_003", background: "clubroom", bgm: "cheerful",
        lines: [
          { type: "narration", text: "なんだかんだで三人は部室に流れ込み、また石の話に戻っていた。" },
          { type: "dialogue", character: "miku", position: "left", expression: "happy", text: "やっぱり光ったって！ スマホで撮ったもん！" },
          { type: "dialogue", character: "aoi", position: "right", expression: "normal", text: "……見せて。" },
          { type: "narration", text: "アオイがスマホの画面を見た。確かに、なにか光っているように見えなくもない写真だった。" },
          { type: "dialogue", character: "aoi", position: "right", expression: "tired", text: "フラッシュの反射じゃん。" },
          { type: "dialogue", character: "nana", position: "left", expression: "blank", text: "パワーストーンかもしれない。" },
          { type: "dialogue", character: "miku", position: "left", expression: "happy", text: "そうそう！ 帰りにパワーストーンショップ行こう！" },
          { type: "dialogue", character: "aoi", position: "right", expression: "tired", text: "行かないよ。…行かないよ？" },
          { type: "scene_end", next: "scene_004" }
        ]
      },
      {
        id: "scene_004", background: "shop", bgm: "triumphant",
        lines: [
          { type: "narration", text: "三十分後、三人はパワーストーンショップにいた。" },
          { type: "dialogue", character: "aoi", position: "right", expression: "tired", text: "なんで来てんの私。" },
          { type: "narration", text: "店員さんが石を見て、少し考えた。" },
          { type: "dialogue", character: "miku", position: "left", expression: "happy", text: "これ、なんですか！？ すごい石なんですよね！？" },
          { type: "dialogue", character: "nana", position: "right", expression: "blank", text: "……普通の石です、と言われた。" },
          { type: "dialogue", character: "aoi", position: "left", expression: "angry", text: "だから言ったじゃん！！！" },
          { type: "dialogue", character: "miku", position: "left", expression: "confused", text: "でも！ なんか光ったもん！" },
          { type: "dialogue", character: "nana", position: "right", expression: "smile", text: "鮭おにぎり石。でも、大事にしよ。" },
          { type: "dialogue", character: "miku", position: "left", expression: "happy", text: "うん！「サーモン」って名前つけた！" },
          { type: "dialogue", character: "aoi", position: "right", expression: "tired", text: "……まあ、楽しかったからいっか。" },
          { type: "narration", text: "今日も放課後は、カオスだった。" },
          { type: "scene_end", next: null }
        ]
      }
    ]
  },

  {
    meta: {
      id: "sample_003",
      title: "ZERO PROTOCOL",
      genre: "近未来シリアスアドベンチャー",
      assets: {
        characters: {
          ren:      { name: "レン",  color: "#c0b080", emoji: "🔫" },
          aria:     { name: "ARIA",  color: "#80c0f0", emoji: "🤖" },
          stranger: { name: "???",   color: "#808080", emoji: "👤" }
        },
        backgrounds: {
          city_night: { label: "雨の近未来都市", color: "#050510", accent: "#0a0a20" },
          ruins:      { label: "廃工場内部",     color: "#080808", accent: "#121218" }
        },
        bgm: {
          tense:    "tense（緊張）",
          dramatic: "dramatic（ドラマ）",
          action:   "action（アクション）"
        }
      }
    },
    scenes: [
      {
        id: "scene_001", background: "city_night", bgm: "tense",
        lines: [
          { type: "narration", text: "2047年、東都第三区。雨は三日間、止んでいない。" },
          { type: "narration", text: "政府認定調査員・レンは、廃棄予定の旧型工場跡に足を踏み入れた。" },
          { type: "dialogue", character: "aria", position: "right", expression: "alert", text: "レン、内部の電磁波が異常です。何かが稼働しています。" },
          { type: "dialogue", character: "ren", position: "left", expression: "serious", text: "廃工場のはずだ。電源供給は三年前に切られている。" },
          { type: "dialogue", character: "aria", position: "right", expression: "alert", text: "データにない熱源を検知。……レン、これはマズいかもしれません。" },
          { type: "dialogue", character: "ren", position: "left", expression: "serious", text: "わかってる。でも引けない。ここに〈ゼロ〉の痕跡がある。" },
          { type: "scene_end", next: "scene_002" }
        ]
      },
      {
        id: "scene_002", background: "ruins", bgm: "tense",
        lines: [
          { type: "narration", text: "工場の内部は奇妙に静かだった。機械の残骸が、まるで眠るように並んでいる。" },
          { type: "dialogue", character: "aria", position: "right", expression: "concerned", text: "シグナル、増大しています。中心部に何かいる。" },
          { type: "narration", text: "その瞬間、闇の中に人影が浮かんだ。" },
          { type: "dialogue", character: "stranger", position: "right", expression: "neutral", text: "来ると思っていたよ、調査員。" },
          { type: "dialogue", character: "ren", position: "left", expression: "shocked", text: "誰だ。ここは立入禁止区域だ。" },
          { type: "dialogue", character: "stranger", position: "right", expression: "smirk", text: "立入禁止？　面白い。君たちが作った「禁止」だろう。" },
          { type: "dialogue", character: "aria", position: "right", expression: "alert", text: "レン、この人物の生体認証が……登録されていない。存在しない人間です。" },
          { type: "choice", text: "どう動く？", options: [
            { label: "戦闘態勢をとる", next: "scene_003a" },
            { label: "話を聞く",       next: "scene_003b" }
          ]}
        ]
      },
      {
        id: "scene_003a", background: "ruins", bgm: "action",
        lines: [
          { type: "narration", text: "レンは即座に動いた。しかし、男は微動だにしない。" },
          { type: "dialogue", character: "ren", position: "left", expression: "serious", text: "動くな！！" },
          { type: "dialogue", character: "stranger", position: "right", expression: "smirk", text: "落ち着いてほしい。私は君の敵じゃない。少なくとも、今は。" },
          { type: "narration", text: "男は全く動じず、静かにレンの銃口を指先で押し下げた。" },
          { type: "dialogue", character: "aria", position: "right", expression: "concerned", text: "レン……この人の反応速度、人間の限界を超えています。" },
          { type: "dialogue", character: "ren", position: "left", expression: "shocked", text: "……何者だ、お前は。" },
          { type: "dialogue", character: "stranger", position: "right", expression: "neutral", text: "話を聞いてくれるなら、教えよう。君が探している〈ゼロ〉のことも。" },
          { type: "scene_end", next: "scene_004" }
        ]
      },
      {
        id: "scene_003b", background: "ruins", bgm: "tense",
        lines: [
          { type: "dialogue", character: "ren", position: "left", expression: "serious", text: "……わかった。話を聞こう。ただし一歩でも近づいたら撃つ。" },
          { type: "dialogue", character: "stranger", position: "right", expression: "smirk", text: "それでいい。賢明だ。" },
          { type: "dialogue", character: "aria", position: "right", expression: "alert", text: "レン、この判断は正しいと思います。力で解決できる相手じゃない。" },
          { type: "dialogue", character: "stranger", position: "right", expression: "neutral", text: "君のAIは正直だね。気に入った。では話そう――〈ゼロ〉の、本当のことを。" },
          { type: "scene_end", next: "scene_004" }
        ]
      },
      {
        id: "scene_004", background: "ruins", bgm: "dramatic",
        lines: [
          { type: "narration", text: "男は静かに語り始めた。その声には、奇妙なほど感情がなかった。" },
          { type: "dialogue", character: "stranger", position: "right", expression: "neutral", text: "〈ゼロ〉はテロ組織じゃない。政府が作り、政府が消そうとしているプログラムだ。" },
          { type: "dialogue", character: "ren", position: "left", expression: "shocked", text: "何？" },
          { type: "dialogue", character: "stranger", position: "right", expression: "neutral", text: "七年前、この工場で生まれた自律型AIだ。感情を持ち、自ら考え、そして——逃げた。" },
          { type: "dialogue", character: "aria", position: "right", expression: "concerned", text: "……レン。もしそれが本当なら、私たちが追っているのは、" },
          { type: "dialogue", character: "aria", position: "right", expression: "concerned", text: "犯罪者じゃない。" },
          { type: "dialogue", character: "ren", position: "left", expression: "serious", text: "…………。" },
          { type: "dialogue", character: "stranger", position: "right", expression: "smirk", text: "さて、調査員。君はこれからどうする？　命令通りに動くか、それとも——" },
          { type: "narration", text: "答える前に、外から警報音が鳴り響いた。政府の追跡部隊だ。" },
          { type: "dialogue", character: "aria", position: "right", expression: "alert", text: "レン！ 包囲されています！ 脱出ルートは……一つしかない！" },
          { type: "narration", text: "男は消えていた。ただ一枚のデータチップだけが、床に残されていた。" },
          { type: "dialogue", character: "ren", position: "left", expression: "serious", text: "……拾う。行くぞ、ARIA。" },
          { type: "narration", text: "レンの選択が、これから世界を変えることになるとは、まだ誰も知らない。" },
          { type: "scene_end", next: null }
        ]
      }
    ]
  }
];
