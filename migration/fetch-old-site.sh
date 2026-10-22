#!/bin/bash
# One-off: download every page's content data from the current econsul.io
# into migration/raw/. Run from Terminal: bash fetch-old-site.sh
set -euo pipefail
cd "$(dirname "$0")"
SITE="https://econsul.io"
OUT="raw"
mkdir -p "$OUT/pages"

BUILD_ID=$(curl -fsSL "$SITE/" | grep -o '"buildId":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Build: $BUILD_ID"

curl -fsSL "$SITE/sitemap.xml" \
  | grep -o '<loc>[^<]*</loc>' \
  | sed -e "s#<loc>$SITE##" -e 's#</loc>##' -e 's#/$##' \
  | sed -e 's#^$#/index#' > "$OUT/sitemap.txt"

total=$(wc -l < "$OUT/sitemap.txt" | tr -d ' ')
done_count=0; failed=0
while read -r path; do
  file="$OUT/pages${path}.json"
  mkdir -p "$(dirname "$file")"
  if curl -fsSL "$SITE/_next/data/$BUILD_ID${path}.json" -o "$file"; then
    done_count=$((done_count+1))
  else
    failed=$((failed+1)); echo "FAILED: $path"
  fi
done < "$OUT/sitemap.txt"

echo "Done: $done_count of $total pages saved, $failed failed."
