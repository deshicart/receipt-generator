#!/bin/bash
# Create placeholder PNG icons using ImageMagick if available, otherwise create simple icons

if command -v convert &> /dev/null; then
    # Use ImageMagick to convert SVG to PNG
    convert -background none icon.svg -resize 192x192 icon-192.png
    convert -background none icon.svg -resize 512x512 icon-512.png
else
    # Create simple colored PNG files using Python PIL
    python3 << 'PYTHON'
from PIL import Image, ImageDraw, ImageFont
import os

def create_icon(size, filename):
    # Create image with blue background
    img = Image.new('RGB', (size, size), color='#4F46E5')
    draw = ImageDraw.Draw(img)
    
    # Draw a simple receipt icon
    # White rectangle
    margin = size // 8
    draw.rectangle([margin, margin, size-margin, size-margin], outline='white', width=size//32)
    
    # Lines
    line_margin = size // 6
    line_spacing = size // 10
    for i in range(4):
        y = margin + line_margin + (i * line_spacing)
        draw.line([margin + line_spacing, y, size - margin - line_spacing, y], fill='white', width=size//64)
    
    # Save
    img.save(filename)
    print(f'Created {filename}')

create_icon(192, 'icon-192.png')
create_icon(512, 'icon-512.png')
PYTHON
fi

echo "Icons created successfully"
