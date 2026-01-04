#!/usr/bin/env python3
"""
画像リサイズスクリプト

使い方:
    python resize.py <入力ファイル> <幅>x<高さ> [出力ファイル]

例:
    python resize.py ../generated/2025-01-04/img_001.png 512x512
    python resize.py ../generated/2025-01-04/img_001.png 256x256 thumbnail.png
"""

import sys
import os
import json
from datetime import datetime, timezone
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("エラー: Pillowがインストールされていません")
    print("インストール: pip install Pillow")
    sys.exit(1)


def resize_image(input_path: str, size: str, output_path: str = None) -> str:
    """画像をリサイズする"""

    # サイズをパース
    try:
        width, height = map(int, size.lower().split('x'))
    except ValueError:
        print(f"エラー: サイズの形式が不正です: {size}")
        print("正しい形式: 512x512")
        sys.exit(1)

    # 入力ファイルを開く
    img = Image.open(input_path)

    # リサイズ
    resized = img.resize((width, height), Image.Resampling.LANCZOS)

    # 出力パスを決定
    if output_path is None:
        input_file = Path(input_path)
        output_path = input_file.parent.parent.parent / "processed" / datetime.now().strftime("%Y-%m-%d")
        output_path.mkdir(parents=True, exist_ok=True)
        output_path = output_path / f"{input_file.stem}_{width}x{height}{input_file.suffix}"

    # 保存
    resized.save(str(output_path))
    print(f"リサイズ完了: {output_path}")

    return str(output_path)


def main():
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)

    input_path = sys.argv[1]
    size = sys.argv[2]
    output_path = sys.argv[3] if len(sys.argv) > 3 else None

    if not os.path.exists(input_path):
        print(f"エラー: ファイルが見つかりません: {input_path}")
        sys.exit(1)

    resize_image(input_path, size, output_path)


if __name__ == "__main__":
    main()
