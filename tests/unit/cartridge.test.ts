import { describe, it, expect } from 'vitest';
import Cartridge from '../../src/core/cart/cartridge';

function makeBuffer(length: number, fill: number = 0): ArrayBuffer {
  const arr = new Uint8Array(length);
  arr.fill(fill);
  return arr.buffer;
}

describe('Cartridge', () => {
  it('should read the first byte of ROM', () => {
    const buffer = makeBuffer(0x8000, 0xff);
    const cartridge = new Cartridge(buffer);
    expect(cartridge.readAbs(0x0000)).toBe(0xff);
  });

  it('reads last byte at 0x7FFF when ROM is 32KiB', () => {
    const buf = new Uint8Array(0x8000).fill(0);
    buf[0x7fff] = 0xaa;
    const cart = new Cartridge(buf.buffer);
    expect(cart.readAbs(0x7fff)).toBe(0xaa);
  });
});

// We recommend installing an extension to run vitest tests.
