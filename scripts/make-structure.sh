#!/usr/bin/env bash
set -euo pipefail

ROOT="${1:-.}"

DIRS=$(cat <<'EOF'
src
src/core
src/core/cpu
src/core/mmu
src/core/ppu
src/core/apu
src/core/timers
src/core/scheduler
src/core/cart
src/core/input
src/debug
src/debug/trace
src/debug/breakpoints
src/debug/disassembler
src/debug/logger
src/ui
src/ui/canvas
src/ui/overlay
src/ui/input
src/worker
public
roms
scripts
tests
tests/unit
tests/e2e
EOF
)

# Crea directorios y deja .gitkeep si están vacíos
while IFS= read -r d; do
  [ -z "$d" ] && continue
  mkdir -p "$ROOT/$d"
  if [ -z "$(ls -A "$ROOT/$d" 2>/dev/null)" ]; then
    : > "$ROOT/$d/.gitkeep"
  fi
done <<< "$DIRS"

echo "✅ Estructura creada bajo: $ROOT"
