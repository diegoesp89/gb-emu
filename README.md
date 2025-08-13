# Game Boy Emulator (JS/TS · Web)

**Game Boy (DMG)** emulator built in **TypeScript**, rendered with **Canvas 2D**, and using **Chrome DevTools** as a debugger/terminal (exposing a `window.gb` object). The goal is to keep the stack minimal, modular, and easy to iterate on.

---

## ✨ Features (MVP)

- **CPU SM83** (fetch–decode–execute, flags, interrupts).
- **MMU** (memory map, DMA, MBC1 first).
- **PPU** (modes 0–3, LY/STAT, tiles/sprites, DMG palettes) → Canvas 160×144.
- **Timers** (DIV/TIMA/TMA/TAC).
- **Input** (joypad matrix).
- **Stable loop** ~59.7275 FPS (≈ **70,224** cycles/frame).
- **Console debugging**: `window.gb.*` (load ROM, step, pause, logs).
- **No sound** initially (APU later).

---

## 🧱 Stack

- **TypeScript + Vite** (fast dev server, HMR, ES modules).
- **Canvas 2D** (ImageData + `putImageData` to start).
- **Web Worker** for the core (avoid blocking UI).
- **Web Audio API** (when APU is implemented).
- **ESLint 9 (flat config) + Prettier**.
- **Husky + lint-staged** (`pre-commit` hook).
- **Vitest** (unit tests / TDD).

---

## ✅ Recommended TDD Workflow

Apply **TDD first** to deterministic parts: CPU, MMU, and Timers. PPU/APU can come later or with higher-level tests.

**First TDD steps**

- [ ] Configure `vitest` and `tests/helpers` (without implementing the emulator).
- [ ] Test factories: `makeCPU()`, `makeMMU()`, fake cartridge.
- [ ] Opcode vector table (inputs/expecteds) in JSON.
- [ ] Flag matchers (Z, N, H, C) and cycle counting.
- [ ] Timers: frequency/overflow tests → IRQ.
- [ ] PPU: start testing **modes** and **LY** (not pixel-perfect yet).
- [ ] Minimal E2E: boot without BIOS, advance N frames, compare **framebuffer hash**.

---

## 🧩 Module Contracts (concept)

- **Bus**: `read(addr): byte`, `write(addr, byte)`.
- **Clock**: `tick(cycles)`.
- **IRQ**: `raise(type)`, `ack(type)`.
- **PPU**: `step(cycles)` → writes to framebuffer.
- **Timers**: `step(cycles)` → triggers interrupts.
- **Scheduler**: orchestrates CPU/PPU/Timers by cycles.

---

## 🧵 Execution Architecture (2 threads)

### Main thread (UI)

- Canvas 2D (draw per **frame** or **scanline**).
- Input (keyboard → joypad state).
- Debug/terminal (`window.gb`).

### Web Worker (Core)

- CPU/MMU/PPU/Timers/IRQ.
- Cycle-based loop (≈ **70,224** cycles/frame).
- `postMessage` with framebuffer and state info.

---

## 🧪 Testing

- **Unit**: opcodes, timers, MMU (table-driven tests).
- **E2E**: load a ROM, simulate X frames, snapshot/framebuffer hash.

---

## 🛠️ `window.gb` Console Commands (API)

> Just the **surface**:

- `gb.loadROM(file | Uint8Array)`
- `gb.reset()`
- `gb.run()` / `gb.pause()`
- `gb.step(n = 1)` → advances N instructions
- `gb.peek(addr, len = 1)` / `gb.poke(addr, value)`
- `gb.setBreakpoint(pc)` / `gb.clearBreakpoints()`
- `gb.watch(addr)` / `gb.unwatch(addr)`
- `gb.logs(n = 50)` → trace ring buffer

---

## ⌨️ Controls (suggested initial mapping)

- **D-Pad**: Arrow keys
- **A**: Z
- **B**: X
- **Start**: Enter
- **Select**: Shift

---

## 📂 Project Structure

```
src/
  core/             # Emulation core
    cpu/            # SM83: opcodes, registers, interrupts
    mmu/            # Memory map, DMA, MBCs, I/O
    ppu/            # Graphics: tiles/sprites, modes, palettes
    apu/            # Audio (later)
    timers/         # DIV/TIMA/TMA/TAC and cycle advancement
    scheduler/      # Orchestrates execution per cycle/frame
    cart/           # Cartridge loading and MBCs
    input/          # Joypad state and MMU reads
  debug/            # Debugging tools
    trace/          # Instruction/cycle traces
    breakpoints/    # Breakpoints / watchpoints
    disassembler/   # Disassembler (optional)
    logger/         # Logger and ring buffers
  ui/               # UI layer
    canvas/         # Render to 160×144 (ImageData)
    overlay/        # HUD: FPS, LY, PPU mode, etc.
    input/          # Keyboard listeners and mapping
  worker/           # Web Worker code (core)
public/             # Public static files (index.html, icons)
roms/               # Local ROMs (do not version)
tests/
  unit/             # Unit tests (CPU, MMU, timers…)
  e2e/              # End-to-end (frames, framebuffer hashes)
scripts/            # Utility scripts (e.g., structure generation)
```

> Suggestion: keep `.gitkeep` in empty folders and **do not** version `roms/`.

---

## 🧭 Roadmap

- [ ] **TDD harness ready** (Vitest + helpers + fixtures).
- [ ] CPU + MMU + Timers (with TDD).
- [ ] PPU: background/tiles → sprites (mode/LY tests; then visuals).
- [ ] Boot without BIOS (patched initial registers).
- [ ] MBC1 (simple ROMs).
- [ ] Input + first “playable” game.
- [ ] Stable ~60 FPS loop.
- [ ] Quick save (snapshots in IndexedDB).
- [ ] APU (channels 1–4 with Web Audio API).
- [ ] Disassembler + selective trace.
- [ ] Document `window.gb` API and console examples.

---

## 🧰 Performance (golden rules)

- **TypedArrays** for RAM/VRAM/OAM.
- Opcode handler table (avoid deep `switch`).
- Start rendering with **ImageData**; optimize later.
- Measure with **Performance** in DevTools (stutter/leaks).

---

## 🧹 Code Quality

- **Pre-commit (Husky)**: `eslint --fix` and `prettier` (via lint-staged).
- **Commit-msg**: disabled (no commitlint for now).
- **Suggestion**: `engines` in `package.json` to enforce Node 20.

---

## 📝 License

No license xD

---

## 📚 Credits / Reading

- [Pan Docs (Game Boy)](https://gbdev.io/pandocs/)
- [ESLint 9: Flat Config](https://eslint.org/docs/latest/use/configure/configuration-files-new)
- [MDN: Canvas 2D](https://developer.mozilla.org/docs/Web/API/Canvas_API)
- [MDN: Web Workers](https://developer.mozilla.org/docs/Web/API/Web_Workers_API)
- [MDN: Web Audio](https://developer.mozilla.org/docs/Web/API/Web_Audio_API)
