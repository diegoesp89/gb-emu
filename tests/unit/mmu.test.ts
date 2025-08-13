import MMU from '../../src/core/mmu/mmu';
import Cartridge from '../../src/core/cart/cartridge';
import { describe, it, expect } from 'vitest';

function makeROM32KiB(fill = 0x00): ArrayBuffer {
  const rom = new Uint8Array(0x8000); // 32 KiB
  rom.fill(fill);
  rom[0x0000] = 0x11;
  rom[0x7fff] = 0x22;
  return rom.buffer;
}

describe('MMU', () => {
  it('delegates ROM reads to cartridge (0x0000 and 0x7FFF)', () => {
    const cart = new Cartridge(makeROM32KiB());
    const mmu = new MMU(cart);
    expect(mmu.read8(0x0000)).toBe(0x11);
    expect(mmu.read8(0x7fff)).toBe(0x22);
  });

  it('writes to ROM range go through cartridge and should error (ROM is immutable for now)', () => {
    const cart = new Cartridge(makeROM32KiB());
    const mmu = new MMU(cart);
    expect(() => mmu.write8(0x0000, 0x33)).toThrow(); // the cartridge should throw
  });

  it('WRAM read/write at start and end of range (0xC000–0xDFFF inclusive)', () => {
    const cart = new Cartridge(makeROM32KiB());
    const mmu = new MMU(cart);

    mmu.write8(0xc000, 0x34);
    expect(mmu.read8(0xc000)).toBe(0x34);

    mmu.write8(0xdfff, 0xab);
    expect(mmu.read8(0xdfff)).toBe(0xab);
  });

  it('Echo RAM mirrors WRAM (0xE000–0xFDFF <-> 0xC000–0xDDFF)', () => {
    const cart = new Cartridge(makeROM32KiB());
    const mmu = new MMU(cart);

    // C000 <-> E000
    mmu.write8(0xc000, 0x77);
    expect(mmu.read8(0xe000)).toBe(0x77);

    mmu.write8(0xe000, 0x66);
    expect(mmu.read8(0xc000)).toBe(0x66);

    // DDFF <-> FDFF (upper cap of the mirror)
    mmu.write8(0xddff, 0x5a);
    expect(mmu.read8(0xfdff)).toBe(0x5a);

    mmu.write8(0xfdff, 0xa5);
    expect(mmu.read8(0xddff)).toBe(0xa5);
  });

  it('HRAM read/write (0xFF80–0xFFFE)', () => {
    const cart = new Cartridge(makeROM32KiB());
    const mmu = new MMU(cart);

    mmu.write8(0xff80, 0x56);
    expect(mmu.read8(0xff80)).toBe(0x56);

    mmu.write8(0xfffe, 0x9a);
    expect(mmu.read8(0xfffe)).toBe(0x9a);
  });

  it('IE register at 0xFFFF read/write', () => {
    const cart = new Cartridge(makeROM32KiB());
    const mmu = new MMU(cart);

    mmu.write8(0xffff, 0x1f);
    expect(mmu.read8(0xffff)).toBe(0x1f);
  });

  it('unimplemented regions return 0xFF (stub) for reads', () => {
    const cart = new Cartridge(makeROM32KiB());
    const mmu = new MMU(cart);

    // VRAM
    expect(mmu.read8(0x8000)).toBe(0xff);
    // OAM
    expect(mmu.read8(0xfe00)).toBe(0xff);
    // I/O
    expect(mmu.read8(0xff00)).toBe(0xff);
    // Not usable
    expect(mmu.read8(0xfea0)).toBe(0xff);
  });

  it('unimplemented region writes are no-ops (do not throw)', () => {
    const cart = new Cartridge(makeROM32KiB());
    const mmu = new MMU(cart);

    expect(() => mmu.write8(0x8000, 0x12)).not.toThrow(); // VRAM stub
    expect(() => mmu.write8(0xfe00, 0x34)).not.toThrow(); // OAM stub
    expect(() => mmu.write8(0xff00, 0x56)).not.toThrow(); // I/O stub
    expect(() => mmu.write8(0xfea0, 0x78)).not.toThrow(); // Not usable stub
  });

  it('rejects invalid addresses (out of 16-bit range or non-integer)', () => {
    const cart = new Cartridge(makeROM32KiB());
    const mmu = new MMU(cart);

    expect(() => mmu.read8(-1)).toThrow(RangeError);
    expect(() => mmu.read8(0x10000)).toThrow(RangeError);
    expect(() => mmu.read8(0.5 as unknown as number)).toThrow(RangeError);

    expect(() => mmu.write8(-1, 0)).toThrow(RangeError);
    expect(() => mmu.write8(0x10000, 0)).toThrow(RangeError);
    expect(() => mmu.write8(0.5 as unknown as number, 0)).toThrow(RangeError);
  });

  it('addresses that are multiples of 256 (e.g., 0x4000) are handled correctly', () => {
    const cart = new Cartridge(makeROM32KiB());
    const mmu = new MMU(cart);
    // must not throw and should read/write correctly
    expect(() => mmu.read8(0x4000)).not.toThrow();
  });
});
