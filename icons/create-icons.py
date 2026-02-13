import base64
from io import BytesIO

# Simple PNG image data (1x1 blue pixel)
def create_simple_icon(size, filename):
    try:
        from PIL import Image, ImageDraw
        
        # Create image with blue background
        img = Image.new('RGB', (size, size), color=(79, 70, 229))
        draw = ImageDraw.Draw(img)
        
        # Draw a receipt icon
        margin = size // 8
        # Rectangle outline
        draw.rectangle([margin, margin, size-margin, size-margin], outline='white', width=max(2, size//64))
        
        # Draw lines
        line_margin = size // 5
        line_spacing = size // 8
        line_width = max(2, size//80)
        for i in range(5):
            y = margin + line_margin + (i * line_spacing)
            if y < size - margin - line_margin:
                draw.line([margin + line_spacing, y, size - margin - line_spacing, y], fill='white', width=line_width)
        
        # Draw circle at bottom (like a button/seal)
        circle_y = size - margin - size//8
        circle_r = size // 15
        draw.ellipse([size//2 - circle_r, circle_y - circle_r, size//2 + circle_r, circle_y + circle_r], fill='white')
        
        # Save
        img.save(filename, 'PNG')
        print(f'Created {filename}')
        return True
    except ImportError:
        print("PIL not available, creating minimal PNG")
        return False

# Try to create icons with PIL
if not create_simple_icon(192, 'icon-192.png'):
    # Fallback: create minimal valid PNG
    import struct
    
    def create_minimal_png(size, filename, color=(79, 70, 229)):
        # Create a minimal valid PNG file
        import zlib
        
        width = size
        height = size
        
        def png_pack(png_tag, data):
            chunk_head = png_tag
            return (struct.pack("!I", len(data)) +
                    chunk_head +
                    data +
                    struct.pack("!I", 0xFFFFFFFF & zlib.crc32(chunk_head + data)))
        
        # PNG signature
        png_signature = b'\x89PNG\r\n\x1a\n'
        
        # IHDR chunk
        ihdr_data = struct.pack("!2I5B", width, height, 8, 2, 0, 0, 0)
        ihdr = png_pack(b'IHDR', ihdr_data)
        
        # IDAT chunk - create simple blue image
        raw_data = b''
        for y in range(height):
            raw_data += b'\x00'  # filter type
            for x in range(width):
                raw_data += bytes(color)  # RGB
        
        compressed = zlib.compress(raw_data, 9)
        idat = png_pack(b'IDAT', compressed)
        
        # IEND chunk
        iend = png_pack(b'IEND', b'')
        
        # Write PNG file
        with open(filename, 'wb') as f:
            f.write(png_signature + ihdr + idat + iend)
        
        print(f'Created minimal {filename}')
    
    create_minimal_png(192, 'icon-192.png')
    create_minimal_png(512, 'icon-512.png')
else:
    create_simple_icon(512, 'icon-512.png')

print("Icon creation complete")
