import { describe, it, expect, beforeEach } from 'vitest';
import { calculateHeaderChecksum, parseHeader } from '../../src/core/cart/header';

describe('Cartridge Header', () => {
  const rom = new Uint8Array(0x150);

  beforeEach(() => {
    rom.fill(0);
    // Title placeholder (se sobreescribe en el test)
    rom[0x134] = 0x00;

    // Flags por defecto
    rom[0x143] = 0x00; // CGB flag
    rom[0x146] = 0x00; // SGB flag

    // Type/size por defecto
    rom[0x147] = 0x00; // Cartridge type
    rom[0x148] = 0x00; // ROM size code (32 KiB)
    rom[0x149] = 0x00; // RAM size code (sin RAM)

    // El checksum se setea al final del test
    rom[0x14d] = 0x00;
  });

  it('should parse a valid header correctly', () => {
    // Title "TEST GAME" + NULs
    const title = 'TEST GAME';
    for (let i = 0; i < title.length; i++) rom[0x134 + i] = title.charCodeAt(i);

    rom[0x147] = 0x01; // MBC1
    rom[0x148] = 0x00; // 32KB ROM
    rom[0x149] = 0x00; // No RAM

    rom[0x14d] = calculateHeaderChecksum(rom);

    const info = parseHeader(rom);
    expect(info.title).toBe('TEST GAME');
    expect(info.type).toBe('MBC1');
    expect(info.romSizeCode).toBe(0x00);
    expect(info.ramSizeCode).toBe(0x00);
    expect(info.headerChecksumOK).toBe(true);
  });
});
