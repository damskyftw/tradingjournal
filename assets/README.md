# App Icons

This directory contains the application icons for different platforms:

- `icon.icns` - macOS app icon (512x512 pixels)
- `icon.ico` - Windows app icon (256x256 pixels)
- `icon.png` - Linux app icon (512x512 pixels)
- `icon-128.png` - Web/small icon (128x128 pixels)

## Icon Design Guidelines

The Trading Journal app icon should:

1. **Represent Trading/Finance**: Use symbols like:
   - Candlestick charts
   - Trend lines (upward/downward)
   - Dollar sign or currency symbols
   - Graph/chart elements

2. **Color Scheme**: 
   - Primary: Blue (#3B82F6) - represents trust and professionalism
   - Secondary: Green (#10B981) - represents profit/growth
   - Accent: Dark Gray (#1F2937) - for contrast and sophistication

3. **Style**:
   - Modern, clean design
   - Good contrast for visibility
   - Scalable vector elements
   - Consistent with macOS/Windows design guidelines

## Creating Icons

To generate the icon files:

1. Create a high-resolution SVG or PNG (1024x1024)
2. Use tools like:
   - **macOS**: `iconutil` or Icon Composer
   - **Windows**: Online ICO converters or ImageMagick
   - **Cross-platform**: Electron Icon Maker

Example commands:
```bash
# Convert PNG to ICO (Windows)
convert icon-1024.png -resize 256x256 icon.ico

# Create ICNS (macOS)
iconutil -c icns icon.iconset/
```

## Placeholder Icons

Currently using placeholder icons. To replace:

1. Design the actual trading journal icon
2. Generate all required formats
3. Replace the files in this directory
4. Update package.json build configuration if needed