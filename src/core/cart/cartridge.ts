const ROM_START = 0x0000;
const ROM_END = 0x7fff;
const BYTE_RANGE_END = 0xff;
const MAX_ADDR = 0xffff; // 16-bit address space
const MAX_ROM_SIZE = 0x8000; // 32KB for Game
const ERAM_START = 0xa000;
const ERAM_END = 0xbfff;

/**
 * Cartridge class to handle Game
 *  Handles reading and writing to the Game Boy ROM.
 *  Provides methods to access ROM data within the valid address range.
 */

class Cartridge {
  rom: Uint8Array;
  addressable: number;

  constructor(buffer: ArrayBuffer) {
    if (buffer.byteLength < 16) {
      throw new RangeError('ROM must be at least 16 bytes');
    }
    this.rom = new Uint8Array(buffer);
    this.addressable = Math.min(ROM_END, this.rom.length - 1);
  }

  readAbs(addr: number): number {
    if (!Number.isInteger(addr)) {
      throw new TypeError('Address must be an integer');
    }

    // rango de 16 bits del bus
    if (addr < 0 || addr > MAX_ADDR) {
      throw new RangeError('Address must be between 0x0000 and 0xFFFF');
    }

    // rango atendido por este cartucho (ROM visible)
    if (addr < ROM_START || addr > this.addressable) {
      throw new RangeError(`Address out of ROM bounds: 0x${addr.toString(16)}`);
    }
    return this.rom[addr];
  }

  writeAbs(addr: number, value: number): void {
    if (!Number.isInteger(addr) || addr < 0 || addr > MAX_ADDR) {
      throw new RangeError('Address must be between 0x0000 and 0xFFFF');
    }
    // ROM es inmutable en el Paso 1
    if (addr >= ROM_START && addr <= this.addressable) {
      throw new Error('Write to ROM is not allowed');
    }
    // fuera de rango del cartucho (ERAM/MBC aún no implementados)
    throw new RangeError('Address out of cartridge range');
  }

  getRomSize(): number {
    return this.rom.length;
  }

  dispose(): void {
    this.rom = new Uint8Array(0); // Clear the ROM data
    this.addressable = -1; // Reset addressable range
  }
}

export default Cartridge;
