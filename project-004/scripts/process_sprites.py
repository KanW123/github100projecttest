#!/usr/bin/env python3
"""
Process generated images: convert white background to transparent
and copy to character assets folder.

Usage:
    python3 process_sprites.py <image_path> <pose_name>

Example:
    python3 process_sprites.py ImageGenerator/generated/2026-01-21/img_xxx.png kick
"""

import sys
import os
from PIL import Image

def convert_to_transparent(input_path, output_path, threshold=240):
    """Convert white/near-white background to transparent."""
    img = Image.open(input_path).convert("RGBA")
    pixels = list(img.getdata())

    new_pixels = []
    for r, g, b, a in pixels:
        if r > threshold and g > threshold and b > threshold:
            new_pixels.append((255, 255, 255, 0))
        else:
            new_pixels.append((r, g, b, a))

    img.putdata(new_pixels)
    img.save(output_path, "PNG")
    return output_path

def main():
    if len(sys.argv) < 3:
        print("Usage: python3 process_sprites.py <image_path> <pose_name>")
        print("Pose names: idle, punch, kick, block, hurt, win")
        sys.exit(1)

    input_path = sys.argv[1]
    pose_name = sys.argv[2]

    if not os.path.exists(input_path):
        print(f"Error: File not found: {input_path}")
        sys.exit(1)

    # Output to character assets
    output_path = f"project-004/assets/characters/char1_{pose_name}.png"

    print(f"Processing: {input_path}")
    print(f"Pose: {pose_name}")
    print(f"Output: {output_path}")

    convert_to_transparent(input_path, output_path)

    size = os.path.getsize(output_path)
    print(f"Done! File size: {size} bytes")

if __name__ == "__main__":
    main()
