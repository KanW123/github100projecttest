#!/usr/bin/env python3
"""
Convert white/near-white background to transparent for game sprites.
Usage: python convert_to_transparent.py input.png output.png [threshold]
"""
import sys
from PIL import Image

def convert_white_to_transparent(input_path, output_path, threshold=240):
    """Convert white/near-white pixels to transparent."""
    img = Image.open(input_path).convert('RGBA')
    data = img.getdata()

    new_data = []
    for item in data:
        # If pixel is white or near-white (R, G, B all above threshold)
        if item[0] > threshold and item[1] > threshold and item[2] > threshold:
            new_data.append((255, 255, 255, 0))  # Transparent
        else:
            new_data.append(item)

    img.putdata(new_data)
    img.save(output_path, 'PNG')
    print(f"Converted: {input_path} -> {output_path}")

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage: python convert_to_transparent.py input.png output.png [threshold]")
        sys.exit(1)

    input_file = sys.argv[1]
    output_file = sys.argv[2]
    threshold = int(sys.argv[3]) if len(sys.argv) > 3 else 240

    convert_white_to_transparent(input_file, output_file, threshold)
