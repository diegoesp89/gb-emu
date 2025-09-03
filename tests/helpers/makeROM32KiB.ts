// tests/helpers/makeROM32KiB.ts
import { calculateHeaderChecksum } from '../../src/core/cart/header';

export function makeROM32KiB(fill = 0x00): ArrayBuffer {
  const rom = new Uint8Array(0x8000).fill(fill);

  // Minimal valid header
  rom[0x143] = 0x00; // CGB flag
  rom[0x146] = 0x00; // SGB flag
  rom[0x147] = 0x00; // Cartridge type = ROM_ONLY
  rom[0x148] = 0x00; // ROM size code = 32 KiB (2 banks)
  rom[0x149] = 0x00; // RAM size code = no RAM

  // Title "test rom"
  rom.set(new TextEncoder().encode('test rom'), 0x134);
  // Recalcular checksum después de setear campos:
  rom[0x14d] = calculateHeaderChecksum(rom);

  return rom.buffer;
}
