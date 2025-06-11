# PWA Icons Guide

This folder should contain all the PWA icons for the Selamnew Workspace application.

## Required Icons

You need to generate the following icons from your app logo:

### Manifest Icons (PNG format)

- manifest-icon-48.png (48x48)
- manifest-icon-72.png (72x72)
- manifest-icon-96.png (96x96)
- manifest-icon-144.png (144x144)
- manifest-icon-168.png (168x168)
- manifest-icon-192.png (192x192)
- manifest-icon-256.png (256x256)
- manifest-icon-512.png (512x512)

### Apple Touch Icons (PNG format)

- apple-icon-57x57.png
- apple-icon-60x60.png
- apple-icon-72x72.png
- apple-icon-76x76.png
- apple-icon-114x114.png
- apple-icon-120x120.png
- apple-icon-144x144.png
- apple-icon-152x152.png
- apple-icon-180x180.png
- apple-icon-precomposed.png (180x180)

### Windows Tile Icons (PNG format)

- manifest-icon-70.png (70x70)
- manifest-icon-150.png (150x150)
- manifest-icon-310.png (310x310)
- manifest-icon-310-150.png (310x150)

### Shortcut Icons (PNG format)

- dashboard-96x96.png
- employees-96x96.png
- payroll-96x96.png
- recruitment-96x96.png

### Splash Screens (JPG format)

- apple-splash-2048-2732.jpg (iPad Pro 12.9")
- apple-splash-1668-2224.jpg (iPad Pro 11")
- apple-splash-1536-2048.jpg (iPad 9.7")
- apple-splash-1125-2436.jpg (iPhone X/XS)
- apple-splash-1242-2208.jpg (iPhone 6/7/8 Plus)
- apple-splash-750-1334.jpg (iPhone 6/7/8)
- apple-splash-828-1792.jpg (iPhone XR)

## How to Generate Icons

### Method 1: Using Online Tools

1. Go to https://www.pwabuilder.com/imageGenerator
2. Upload your app logo (preferably 512x512 PNG with transparent background)
3. Download the generated icon pack
4. Extract and place icons in this folder

### Method 2: Using PWA Asset Generator

```bash
npm install -g pwa-asset-generator
pwa-asset-generator your-logo.png public/icons --padding "10%" --background "#1890ff"
```

### Method 3: Manual Creation

Use design tools like:

- Figma
- Adobe Illustrator
- Canva
- GIMP

## Icon Guidelines

1. **Logo Design**: Use a simple, recognizable logo that works well at small sizes
2. **Background**: For maskable icons, ensure the logo works with different shaped masks
3. **Colors**: Use your brand colors consistently
4. **Padding**: Add appropriate padding to prevent clipping on rounded corners
5. **Format**: Use PNG for icons, JPG for splash screens
6. **Quality**: Ensure crisp, high-quality icons at all sizes

## Testing Icons

After generating icons:

1. Test on different devices (iOS, Android, Windows)
2. Check in different browsers (Chrome, Safari, Edge, Firefox)
3. Verify icons appear correctly in:
   - Installation prompts
   - Home screen
   - App switcher
   - Splash screens
   - Browser tabs

## Current Status

❌ Icons not yet generated - Please generate icons using one of the methods above.

Once icons are generated, remove this README and verify all icons are working correctly.
