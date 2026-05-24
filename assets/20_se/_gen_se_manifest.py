#!/usr/bin/env python3
"""
SE マニフェスト生成スクリプト
出力: assets/20_se/se-manifest.js
"""

import os
import json
import re
from urllib.parse import quote

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OUT_FILE = os.path.join(BASE_DIR, 'se-manifest.js')

# ─── フォルダ設定（フォーマット優先順） ────────────────────────────
CATEGORIES = {
    'environmental_sfxのコピー': {
        'cat': 'env',
        'prefix': 'env',
        'ext_pref': ['mp3', 'ogg', 'm4a'],
    },
    'horror_sfxのコピー': {
        'cat': 'horror',
        'prefix': 'horror',
        'ext_pref': ['ogg', 'm4a', 'wav'],
    },
    'human_sfxのコピー': {
        'cat': 'human',
        'prefix': 'human',
        'ext_pref': ['ogg', 'm4a', 'wav'],
    },
    'rpgmaker_systemSEのコピー': {
        'cat': 'sys',
        'prefix': 'sys',
        'ext_pref': ['ogg', 'm4a', 'wav'],
    },
}

# ─── ループ判定キーワード ──────────────────────────────────────────
LOOP_KEYWORDS = ['loop', '_1min', '-1min', 'long_slow', 'long_fast', 'long-slow', 'long-fast']

# ─── 日本語ラベルマッピング ──────────────────────────────────────
LABEL_MAP = {
    'rain-1min':           '雨音',
    'stream-1min':         '川の音',
    'train-1min':          '電車',
    'thunder':             '雷',
    'squashy-sticky_long':   'ぬるぬる（長）',
    'squashy-sticky_middle': 'ぬるぬる（中）',
    'squashy-sticky_oneshot':'ぬるぬる（単）',
    'zombie_attack01':     'ゾンビ攻撃1',
    'zombie_attack02':     'ゾンビ攻撃2',
    'zombie_attack03':     'ゾンビ攻撃3',
    'zombie_growl01':      'ゾンビうめき1',
    'zombie_growl02':      'ゾンビうめき2',
    'zombie_growl03':      'ゾンビうめき3',
    'zombie_growl04':      'ゾンビうめき4',
    'Footstep-fast':       '足音（速）',
    'Footstep-high':       '足音（高）',
    'Footstep-low':        '足音（低）',
    'Footstep-middle':     '足音（中）',
    'Footstep-slow':       '足音（遅）',
    'Footstep-veryslow':   '足音（超遅）',
    'HeartBeat-1shot':     '心拍（単発）',
    'HeartBeat-long_fast': '心拍（速）',
    'HeartBeat-long_slow': '心拍（遅）',
    'telephone-4call':     '電話',
    'battle-start':        '戦闘開始',
    'buzzer':              'ブザー',
    'cancel-01':           'キャンセル1',
    'cancel-02':           'キャンセル2',
    'cursor-01':           'カーソル1',
    'cursor-02':           'カーソル2',
    'cursor-03':           'カーソル3',
    'damage01':            'ダメージ1',
    'damage02':            'ダメージ2',
    'damage03':            'ダメージ3',
    'enemy-attack':        '敵攻撃',
    'item-01':             'アイテム1',
    'item-02':             'アイテム2',
    'kaifuku':             '回復',
    'kettei-01':           '決定1',
    'kettei-02':           '決定2',
    'kougekikaihi-01':     '回避1',
    'kougekikaihi-02':     '回避2',
    'load':                'ロード',
    'miss':                'ミス',
    'save-01':             'セーブ1',
    'save-02':             'セーブ2',
    'sentoufunou':         '戦闘不能',
    'shop':                'ショップ',
    'skill':               'スキル',
    'soubi-01':            '装備1',
    'soubi-02':            '装備2',
    'teki-syoumetsu':      '敵消滅',
    'tousou-01':           '逃走1',
    'tousou-02':           '逃走2',
}

# ─── タグマッピング（ファイルステムにキーワードが含まれる場合）────
TAG_RULES = [
    ('rain',           ['雨', '嵐']),
    ('stream',         ['川', '自然']),
    ('train',          ['電車', '鉄道']),
    ('thunder',        ['雷', '嵐']),
    ('squashy',        ['ぬるぬる', 'ホラー', '不気味']),
    ('zombie_attack',  ['ゾンビ', '攻撃', 'ホラー']),
    ('zombie_growl',   ['ゾンビ', 'うめき', 'ホラー']),
    ('footstep',       ['足音', '歩く']),
    ('fast',           ['速い', '走る']),
    ('veryslow',       ['忍び歩き', '静か']),
    ('slow',           ['遅い', 'ゆっくり']),
    ('heartbeat',      ['心拍', '緊張']),
    ('heart',          ['心拍', '緊張']),
    ('telephone',      ['電話', '呼び出し']),
    ('battle',         ['戦闘', 'バトル']),
    ('buzzer',         ['エラー', '不正解']),
    ('cancel',         ['キャンセル', '戻る']),
    ('cursor',         ['選択', 'カーソル']),
    ('damage',         ['ダメージ', '攻撃']),
    ('enemy',          ['敵', '攻撃']),
    ('item',           ['アイテム', '入手']),
    ('kaifuku',        ['回復', '治る']),
    ('kettei',         ['決定', 'OK', '選択']),
    ('kougeki',        ['回避', 'かわす']),
    ('load',           ['ロード', '読み込み']),
    ('miss',           ['ミス', '外れ']),
    ('save',           ['セーブ', '保存']),
    ('sentoufunou',    ['戦闘不能', '敗北', 'やられた']),
    ('shop',           ['ショップ', '購入']),
    ('skill',          ['スキル', '魔法']),
    ('soubi',          ['装備']),
    ('teki',           ['敵消滅', '勝利']),
    ('tousou',         ['逃走', '逃げる']),
]

# ─── デフォルト音量（カテゴリ別） ────────────────────────────────
DEFAULT_VOL = {
    'env':    0.4,
    'horror': 0.65,
    'human':  0.55,
    'sys':    0.45,
}


def make_se_id(prefix, stem):
    """ファイルステム → SE ID"""
    s = stem.lower()
    s = re.sub(r'[-.]', '_', s)
    return f"{prefix}_{s}"


def get_tags(stem):
    tags = set()
    s = stem.lower()
    for keyword, tag_list in TAG_RULES:
        if keyword in s:
            tags.update(tag_list)
    return sorted(tags)


def is_loop(stem):
    s = stem.lower()
    return any(kw in s for kw in LOOP_KEYWORDS)


# ─── スキャン ─────────────────────────────────────────────────────
entries = {}   # se_id → entry dict
order  = []    # 出力順を保持

AUDIO_EXTS = {'mp3', 'ogg', 'm4a', 'wav'}

for folder_name, cfg in CATEGORIES.items():
    folder_path = os.path.join(BASE_DIR, folder_name)
    if not os.path.isdir(folder_path):
        print(f'  [SKIP] not found: {folder_name}')
        continue

    # stem → (ext, subdir) の最優先候補を収集
    best: dict[str, tuple[str, str]] = {}

    for subdir in os.listdir(folder_path):
        subdir_path = os.path.join(folder_path, subdir)
        if not os.path.isdir(subdir_path):
            continue
        for fname in os.listdir(subdir_path):
            if fname.startswith('.') or fname.endswith('.sfl'):
                continue
            stem, dot_ext = os.path.splitext(fname)
            ext = dot_ext.lstrip('.').lower()
            if ext not in AUDIO_EXTS:
                continue
            if ext not in cfg['ext_pref']:
                continue

            prio_cur = cfg['ext_pref'].index(ext)
            if stem in best:
                prio_prev = cfg['ext_pref'].index(best[stem][0])
                if prio_cur >= prio_prev:
                    continue  # 既により良い候補がある

            best[stem] = (ext, subdir, fname)

    # エントリ生成
    for stem, (ext, subdir, fname) in sorted(best.items()):
        encoded_folder = quote(folder_name, safe='')
        url = f"../assets/20_se/{encoded_folder}/{subdir}/{fname}"

        se_id = make_se_id(cfg['prefix'], stem)
        label = LABEL_MAP.get(stem, stem)
        loop  = is_loop(stem)
        vol   = DEFAULT_VOL[cfg['cat']]
        if loop:
            vol = round(vol * 0.85, 2)
        tags  = get_tags(stem)

        entries[se_id] = {
            'label': label,
            'url':   url,
            'loop':  loop,
            'vol':   vol,
            'cat':   cfg['cat'],
            'tags':  tags,
        }
        order.append(se_id)

# ─── JS 出力 ─────────────────────────────────────────────────────
lines = [
    '// 自動生成: SE マニフェスト',
    f'// 件数: {len(entries)}件 / カテゴリ: {len(CATEGORIES)}個',
    '//',
    '// 各エントリ: { label, url, loop, vol, cat, tags[] }',
    '// cat: env / horror / human / sys',
    '// 使用: Audio.playSE("se_id")  / Audio.playAmbient("se_id")',
    '',
    '/* global SE ID リスト (GAS プロンプト用)',
]
for se_id, e in entries.items():
    lines.append(f'   {se_id}: {e["label"]} | tags: {", ".join(e["tags"])}')
lines.append('*/')
lines.append('')
lines.append('window.SE_MANIFEST = {')

for i, se_id in enumerate(order):
    e = entries[se_id]
    comma = ',' if i < len(order) - 1 else ''
    tags_json = json.dumps(e['tags'], ensure_ascii=False)
    loop_str  = 'true' if e['loop'] else 'false'
    lines.append(
        f'  {se_id}: '
        f'{{ label:{json.dumps(e["label"], ensure_ascii=False)}, '
        f'url:{json.dumps(e["url"], ensure_ascii=False)}, '
        f'loop:{loop_str}, vol:{e["vol"]}, cat:{json.dumps(e["cat"])}, '
        f'tags:{tags_json} }}{comma}'
    )

lines.append('};')
lines.append('')

with open(OUT_FILE, 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines))

print(f'生成完了: {len(entries)} 件 → se-manifest.js')
for cat in set(e['cat'] for e in entries.values()):
    cnt = sum(1 for e in entries.values() if e['cat'] == cat)
    print(f'  {cat}: {cnt}件')
