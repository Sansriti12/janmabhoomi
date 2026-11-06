import os

try:
    import fitz # PyMuPDF
    doc = fitz.open('ALL LOGO.pdf')
    print("ALL LOGO.pdf opened. Total pages:", len(doc))
    page0 = doc[0]
    drawings = page0.get_drawings()
    colors = set()
    for d in drawings:
        fill = d.get('fill')
        if fill:
            colors.add(fill)
        color = d.get('color')
        if color:
            colors.add(color)
    print("Page 0 colors:", colors)
    for c in colors:
        if isinstance(c, (list, tuple)) and len(c) == 3:
            r, g, b = [int(round(x * 255)) for x in c]
            hex_val = f"#{r:02X}{g:02X}{b:02X}"
            print(f"RGB: ({r}, {g}, {b}) -> HEX: {hex_val}")
        elif isinstance(c, (list, tuple)) and len(c) == 4:
            # CMYK
            c_val, m, y, k = c
            print(f"CMYK: {c}")
except Exception as e:
    print("Error:", e)
