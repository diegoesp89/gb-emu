import { parseHeader } from './header';

// MBC1 v0: only low5 ROM banking (no hi2, no mode, no ERAM yet)
const ROM0_END = 0x3fff;
const ROMX_START = 0x4000;
const ROMX_END = 0x7fff;
const ERAM_START = 0xa000;
const ERAM_END = 0xbfff;
const MAX_ADDR = 0xffff;
const MINIMUM_ROM_SIZE = 0x150; // header area size

class Cartridge {
  rom: Uint8Array;

  // Header-derived metadata
  title: string;
  type: string;
  romBanks: number;
  ramBanks: number;
  cgbFlag: number;
  sgbFlag: number;
  headerChecksumOK: boolean;
  romSizeCode: number;
  ramSizeCode: number;
  addressable: boolean;

  // MBC1 v0 state
  private selectedLow5 = 1; // high window starts at bank 1

  constructor(buffer: ArrayBuffer) {
    if (buffer.byteLength < MINIMUM_ROM_SIZE) {
      throw new RangeError('ROM must be at least 0x150 bytes');
    }
    this.rom = new Uint8Array(buffer);

    const header = parseHeader(this.rom);
    this.title = header.title;
    this.type = header.type;
    this.romBanks = header.romBanks;
    this.ramBanks = header.ramBanks;
    this.cgbFlag = header.cgbFlag;
    this.sgbFlag = header.sgbFlag;
    this.headerChecksumOK = header.headerChecksumOK;
    this.romSizeCode = header.romSizeCode;
    this.ramSizeCode = header.ramSizeCode;
    this.addressable = true;
  }

  // --- Reads with simple MBC1 banking (low5 only)
  readAbs(addr: number): number {
    if (this.rom.length === 0) {
      throw new RangeError('Cartridge disposed');
    }
    // Keep TypeError for non-integer, as your test expects
    if (!Number.isInteger(addr)) {
      throw new TypeError('Address must be an integer');
    }
    if (addr < 0 || addr > 0xffff) {
      throw new RangeError('Address must be between 0x0000 and 0xFFFF');
    }

    // Validate 16-bit address
    if (!Number.isInteger(addr) || addr < 0 || addr > MAX_ADDR) {
      throw new RangeError('Address must be between 0x0000 and 0xFFFF');
    }

    // ROM bank 0 (fixed)
    if (addr <= ROM0_END) {
      const idx = addr; // bank 0
      return idx < this.rom.length ? this.rom[idx] : 0xff;
    }

    // Switchable ROM bank (high window)
    if (addr >= ROMX_START && addr <= ROMX_END) {
      // Choose bank: low5 with 0=>1 rule, then wrap to existing banks
      let bank = this.selectedLow5 & 0x1f;
      if (bank === 0) {
        bank = 1;
      }

      // Wrap to available banks; keep "no bank 0" for multi-bank ROMs
      let effective = bank % this.romBanks;
      if (this.romBanks > 1 && effective === 0) {
        effective = 1;
      }

      const offset = addr - ROMX_START;
      const idx = effective * 0x4000 + offset;
      return idx < this.rom.length ? this.rom[idx] : 0xff;
    }

    // External RAM (not implemented yet)
    if (addr >= ERAM_START && addr <= ERAM_END) {
      // TODO: implement ERAM + enable when you add RAM support
      return 0xff;
    }

    throw new RangeError(`Address out of cartridge range: 0x${addr.toString(16)}`);
  }

  // --- Control writes for MBC1 v0
  writeAbs(addr: number, value: number): void {
    if (!Number.isInteger(addr) || addr < 0 || addr > MAX_ADDR) {
      throw new RangeError('Address must be between 0x0000 and 0xFFFF');
    }
    value &= 0xff;

    // MBC1: select ROM bank low5 (0x2000–0x3FFF)
    if (addr >= 0x2000 && addr <= 0x3fff) {
      this.selectedLow5 = value & 0x1f;
      return;
    }

    // Other ROM writes are not allowed (v0); MMU will call here for ROM range
    if (addr <= ROMX_END) {
      throw new Error('Write to ROM is not allowed (except 0x2000–0x3FFF for MBC1 control)');
    }

    // ERAM (not implemented yet)
    if (addr >= ERAM_START && addr <= ERAM_END) {
      // TODO: once ERAM is implemented, honor RAM enable and write to external RAM
      return; // no-op for now
    }

    throw new RangeError(`Address out of cartridge range: 0x${addr.toString(16)}`);
  }

  getRomSize(): number {
    return this.rom.length;
  }

  dispose(): void {
    this.rom = new Uint8Array(0);
    // optional: reset selectedLow5 or other state if you want
    this.selectedLow5 = 1;
  }
}

export default Cartridge;
