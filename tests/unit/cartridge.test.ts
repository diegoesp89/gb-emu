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

  it('should throw on reading out of bounds', () => {
    const buffer = makeBuffer(0x8000);
    const cartridge = new Cartridge(buffer);
    expect(() => cartridge.readAbs(0x8000)).toThrow(RangeError);
    expect(() => cartridge.readAbs(-1)).toThrow(RangeError);
  });

  it('should throw an error for ROMS smaller than 16 bytes', () => {
    const buffer = makeBuffer(0x100);
    expect(() => new Cartridge(buffer)).toThrow(RangeError);
  });

  it('should throw an error then addr is not an integer', () => {
    const buffer = makeBuffer(0x8000);
    const cartridge = new Cartridge(buffer);
    expect(() => cartridge.readAbs(0.5)).toThrow(TypeError);
  });

  it('should throw an error when writing to ROM', () => {
    const buffer = makeBuffer(0x8000);
    const cartridge = new Cartridge(buffer);
    expect(() => cartridge.writeAbs(0x0000, 0xff)).toThrow(Error);
  });

  it('should retunr buffer.byteLength for getRomSize()', () => {
    const buffer = makeBuffer(0x8000);
    const cartridge = new Cartridge(buffer);
    expect(cartridge.getRomSize()).toBe(0x8000);
  });

  it('should clean up resources on dispose()', () => {
    const buffer = makeBuffer(0x8000);
    const cartridge = new Cartridge(buffer);
    expect(() => cartridge.dispose()).not.toThrow();
    expect(cartridge.rom).toBeDefined();
    expect(cartridge.addressable).toBeDefined();
    expect(() => cartridge.readAbs(0x0000)).toThrow(RangeError);
    expect(cartridge.getRomSize()).toBe(0);
  });
});
