# Game Boy Emulator (JS/TS · Web)

Emulador de **Game Boy (DMG)** hecho en **TypeScript**, renderizado en **Canvas 2D** y con **Chrome DevTools** como debugger/terminal (exponiendo un objeto `window.gb`). La idea es mantener un stack mínimo, modular y fácil de iterar.

---

## ✨ Características (MVP)

- **CPU SM83** (fetch–decode–execute, flags, interrupciones).
- **MMU** (mapa de memoria, DMA, MBC1 primero).
- **PPU** (modos 0–3, LY/STAT, tiles/sprites, paletas DMG) → Canvas 160×144.
- **Timers** (DIV/TIMA/TMA/TAC).
- **Input** (matriz de joypad).
- **Loop** estable ~59.7275 FPS (≈ **70 224** ciclos/frame).
- **Debug por consola**: `window.gb.*` (cargar ROM, step, pause, logs).
- **Sin sonido** al inicio (APU más adelante).

---

## 🧱 Stack

- **TypeScript + Vite** (dev server rápido, HMR, ES modules).
- **Canvas 2D** (ImageData + `putImageData` para empezar).
- **Web Worker** para el core (no bloquear la UI).
- **Web Audio API** (cuando haya soporte para APU).
- **ESLint 9 (flat config) + Prettier**.
- **Husky + lint-staged** (hook `pre-commit`).
- **Vitest** (tests unitarios / TDD).

---

## ✅ Flujo de trabajo con TDD (recomendado)

Aplicar **TDD primero** a lo determinístico: CPU, MMU y Timers. PPU/APU pueden ir después o con tests de mayor grano.

**Primeros pasos TDD**

- [ ] Configurar `vitest` y `tests/helpers` (sin implementar el emu).
- [ ] Factories de prueba: `makeCPU()`, `makeMMU()`, cartucho “fake”.
- [ ] Tabla de vectores de opcodes (inputs/expecteds) en JSON.
- [ ] Matchers de flags (Z, N, H, C) y conteo de ciclos.
- [ ] Timers: pruebas de frecuencia/overflow → IRQ.
- [ ] PPU: empezar testeando **modos** y **LY** (no píxel perfecto).
- [ ] E2E mínimo: boot sin BIOS, avanzar N frames y comparar **hash** de framebuffer.

---

## 🧩 Contratos entre módulos (idea)

- **Bus**: `read(addr): byte`, `write(addr, byte)`.
- **Clock**: `tick(cycles)`.
- **IRQ**: `raise(type)`, `ack(type)`.
- **PPU**: `step(cycles)` → escribe en framebuffer.
- **Timers**: `step(cycles)` → dispara interrupciones.
- **Scheduler**: orquesta CPU/PPU/Timers por ciclos.

---

## 🧵 Arquitectura de ejecución (2 hilos)

### Main thread (UI)

- Canvas 2D (pinta por **frame** o **scanline**).
- Input (teclado → estado de joypad).
- Debug/terminal (`window.gb`).

### Web Worker (Core)

- CPU/MMU/PPU/Timers/IRQ.
- Bucle por ciclos (≈ **70 224** ciclos/frame).
- `postMessage` con framebuffer e info de estado.

---

## 🧪 Testing

- **Unit**: opcodes, timers, MMU (table-driven tests).
- **E2E**: cargar una ROM, simular X frames, snapshot/hash del canvas.

---

## 🛠️ Comandos `window.gb` (API de consola)

> Solo la **superficie**:

- `gb.loadROM(file | Uint8Array)`
- `gb.reset()`
- `gb.run()` / `gb.pause()`
- `gb.step(n = 1)` → avanza N instrucciones
- `gb.peek(addr, len = 1)` / `gb.poke(addr, value)`
- `gb.setBreakpoint(pc)` / `gb.clearBreakpoints()`
- `gb.watch(addr)` / `gb.unwatch(addr)`
- `gb.logs(n = 50)` → ring buffer de trace

---

## ⌨️ Controles (sugeridos, mapeo inicial)

- **D-Pad**: Flechas
- **A**: Z
- **B**: X
- **Start**: Enter
- **Select**: Shift

---

## 📂 Estructura del proyecto

```
src/
  core/             # Núcleo de la emulación
    cpu/            # SM83: opcodes, registros, interrupciones
    mmu/            # Mapa de memoria, DMA, MBCs, I/O
    ppu/            # Gráficos: tiles/sprites, modos, paletas
    apu/            # Audio (llegará después)
    timers/         # DIV/TIMA/TMA/TAC y su avance por ciclos
    scheduler/      # Ordena la ejecución por ciclos/frame
    cart/           # Carga de cartuchos y MBCs
    input/          # Estado de joypad y lectura desde MMU
  debug/            # Herramientas de debugging
    trace/          # Trazas de instrucciones/ciclos
    breakpoints/    # Breakpoints / watchpoints
    disassembler/   # Desensamblador (opcional)
    logger/         # Logger y ring buffers
  ui/               # Capa de interfaz
    canvas/         # Render a 160×144 (ImageData)
    overlay/        # HUD: FPS, LY, modo PPU, etc.
    input/          # Listeners de teclado y mapping
  worker/           # Código del Web Worker (core)
public/             # Estáticos públicos (index.html, iconos)
roms/               # ROMs locales (no versionar)
tests/
  unit/             # Unit tests (CPU, MMU, timers…)
  e2e/              # End-to-end (frames, hashes de framebuffer)
scripts/            # Scripts utilitarios (p. ej., generación de estructura)
```

> Sugerencia: mantener `.gitkeep` en carpetas vacías y **no** versionar `roms/`.

---

## 🧭 Roadmap

- [ ] **TDD harness listo** (Vitest + helpers + fixtures).
- [ ] CPU + MMU + Timers (con TDD).
- [ ] PPU: background/tiles → sprites (tests de modo/LY; luego visuales).
- [ ] Boot sin BIOS (registro inicial parcheado).
- [ ] MBC1 (ROMs simples).
- [ ] Input + primer juego “jugable”.
- [ ] Loop ~60 FPS estable.
- [ ] Guardado rápido (snapshots en IndexedDB).
- [ ] APU (canales 1–4 con Web Audio API).
- [ ] Disassembler + trace selectivo.
- [ ] Documentar API `window.gb` y ejemplos en consola.

---

## 🧰 Rendimiento (reglas de oro)

- **TypedArrays** para RAM/VRAM/OAM.
- Tabla de handlers por opcode (evitar `switch` profundo).
- Pintar con **ImageData** al principio; optimizar luego.
- Medir con **Performance** en DevTools (stutter/leaks).

---

## 🧹 Calidad de código

- **Pre-commit (Husky)**: `eslint --fix` y `prettier` (vía lint-staged).
- **Commit-msg**: desactivado (sin commitlint por ahora).
- **Sugerencia**: `engines` en `package.json` para forzar Node 20.

---

## 📝 Licencia

No hay licencia xD

---

## 📚 Créditos / Lecturas

- [Pan Docs (Game Boy)](https://gbdev.io/pandocs/)
- [ESLint 9: Flat Config](https://eslint.org/docs/latest/use/configure/configuration-files-new)
- [MDN: Canvas 2D](https://developer.mozilla.org/docs/Web/API/Canvas_API)
- [MDN: Web Workers](https://developer.mozilla.org/docs/Web/API/Web_Workers_API)
- [MDN: Web Audio](https://developer.mozilla.org/docs/Web/API/Web_Audio_API)
