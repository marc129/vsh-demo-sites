#!/usr/bin/env bash
# Re-sync finished sites from /workspace/realtor-sites, regenerate the gallery, commit and push.
# Usage: ./publish.sh ["commit message"]
set -euo pipefail
cd "$(dirname "$0")"
python3 build_gallery.py
git add -A
if git diff --cached --quiet; then echo "Nothing changed."; exit 0; fi
git commit -m "${1:-Update demo sites $(date +%F)}"
gh auth status >/dev/null 2>&1 && gh auth setup-git >/dev/null 2>&1 || true
if git remote get-url origin >/dev/null 2>&1; then
  git push origin main
  echo "Pushed. Live in ~1 min at https://marc129.github.io/vsh-demo-sites/"
else
  echo "No 'origin' remote yet. Once marc129/vsh-demo-sites exists and push access is set up:"
  echo "  git remote add origin https://github.com/marc129/vsh-demo-sites.git && git push -u origin main"
fi
