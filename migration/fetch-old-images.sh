#!/bin/bash
# One-off: download every image referenced by the downloaded page data
# (stored in Sanity's image CDN) into migration/raw/images/.
# Run after fetch-old-site.sh:  bash fetch-old-images.sh
set -euo pipefail
cd "$(dirname "$0")"
CDN="https://cdn.sanity.io/images/6u9g44zq/production"
OUT="raw/images"
mkdir -p "$OUT"

grep -rhoE 'image-[a-f0-9]+-[0-9]+x[0-9]+-[a-z]+' raw/pages | sort -u > raw/image-refs.txt
total=$(wc -l < raw/image-refs.txt | tr -d ' ')
echo "Images to download: $total"

ok=0; failed=0
while read -r ref; do
  ext="${ref##*-}"
  stem="${ref#image-}"; stem="${stem%-*}"
  file="$OUT/$stem.$ext"
  [ -s "$file" ] && { ok=$((ok+1)); continue; }
  if curl -fsSL "$CDN/$stem.$ext" -o "$file"; then ok=$((ok+1)); else failed=$((failed+1)); echo "FAILED: $ref"; fi
done < raw/image-refs.txt

echo "Done: $ok of $total images saved, $failed failed."
