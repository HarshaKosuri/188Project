#!/bin/bash

# Install required tools if not already installed
if ! command -v convert &> /dev/null; then
    echo "Installing ImageMagick..."
    brew install imagemagick
fi

# Generate PNG files from SVG
echo "Generating icon files..."
convert -background none -resize 16x16 images/icon.svg images/icon16.png
convert -background none -resize 48x48 images/icon.svg images/icon48.png
convert -background none -resize 128x128 images/icon.svg images/icon128.png

echo "Icons generated successfully!" 