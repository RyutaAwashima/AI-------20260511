#!/usr/bin/env python3
"""
立ち絵サイズ正規化スクリプト
─────────────────────────────────────────────────────
carlmary-*  フォルダ内の PNG → SCALE_UP   倍率でリサイズ（拡大）
spr_*.png   ファイル      → SCALE_DOWN 倍率でリサイズ（縮小）

使い方:
  python3 _normalize_sprites.py            # 実行（上書き保存）
  python3 _normalize_sprites.py --dry-run  # 確認のみ（ファイル変更なし）
  python3 _normalize_sprites.py --scale-up 1.20 --scale-down 0.80
"""

import os
import sys
import argparse
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    sys.exit('[ERROR] Pillow が必要です: pip3 install Pillow')

# ── デフォルト倍率 ──────────────────────────────────────────
DEFAULT_SCALE_UP   = 1.15   # carlmary: 15%拡大
DEFAULT_SCALE_DOWN = 0.82   # spr_:     18%縮小


def normalize(img_path: Path, scale: float, dry_run: bool) -> tuple[int,int,int,int]:
    """1ファイルをリサイズ。(old_w, old_h, new_w, new_h) を返す。"""
    img = Image.open(img_path)
    old_w, old_h = img.size
    new_w = max(1, round(old_w * scale))
    new_h = max(1, round(old_h * scale))
    if not dry_run:
        mode = img.mode
        resized = img.resize((new_w, new_h), Image.LANCZOS)
        # アルファチャンネルを保持
        if mode in ('RGBA', 'LA', 'PA'):
            resized.save(img_path, format='PNG', optimize=True)
        else:
            resized.save(img_path, format='PNG', optimize=True)
    return old_w, old_h, new_w, new_h


def main():
    parser = argparse.ArgumentParser(description='立ち絵サイズ正規化')
    parser.add_argument('--dry-run',    action='store_true', help='ファイルを変更せず確認のみ')
    parser.add_argument('--scale-up',   type=float, default=DEFAULT_SCALE_UP,   metavar='F', help=f'carlmary 拡大倍率 (default: {DEFAULT_SCALE_UP})')
    parser.add_argument('--scale-down', type=float, default=DEFAULT_SCALE_DOWN, metavar='F', help=f'spr_ 縮小倍率 (default: {DEFAULT_SCALE_DOWN})')
    args = parser.parse_args()

    ROOT = Path(__file__).parent
    dry_run    = args.dry_run
    scale_up   = args.scale_up
    scale_down = args.scale_down

    print(f'[normalize_sprites]  dry_run={dry_run}')
    print(f'  carlmary 拡大: ×{scale_up:.2f}  /  spr_ 縮小: ×{scale_down:.2f}')
    print()

    total_up   = 0
    total_down = 0
    errors     = 0

    # ── carlmary: サブフォルダ内 PNG を拡大 ───────────────────────
    for folder in sorted(ROOT.iterdir()):
        if not folder.is_dir() or not folder.name.startswith('carlmary'):
            continue
        for png in sorted(folder.glob('*.png')):
            try:
                ow, oh, nw, nh = normalize(png, scale_up, dry_run)
                tag = '[DRY]' if dry_run else '[UP] '
                print(f'{tag} {folder.name}/{png.name}  {ow}×{oh} → {nw}×{nh}')
                total_up += 1
            except Exception as e:
                print(f'[ERR]  {png}: {e}')
                errors += 1

    # ── spr_: ルート直下の spr_*.png を縮小 ──────────────────────
    for png in sorted(ROOT.glob('spr_*.png')):
        try:
            ow, oh, nw, nh = normalize(png, scale_down, dry_run)
            tag = '[DRY]' if dry_run else '[DN] '
            print(f'{tag} {png.name}  {ow}×{oh} → {nw}×{nh}')
            total_down += 1
        except Exception as e:
            print(f'[ERR]  {png}: {e}')
            errors += 1

    print()
    print(f'─── 完了 ────────────────────────────────')
    print(f'  carlmary 拡大: {total_up} ファイル')
    print(f'  spr_     縮小: {total_down} ファイル')
    if errors:
        print(f'  エラー:        {errors} ファイル')
    if dry_run:
        print()
        print('  ※ --dry-run のため変更は行われていません。')
        print('     実際に変換するには --dry-run を外して実行してください。')


if __name__ == '__main__':
    main()
