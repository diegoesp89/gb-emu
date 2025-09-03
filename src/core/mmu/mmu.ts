import type Cartridge from '../cart/cartridge';

const WRAM_SIZE = 0x2000; // 8KB
const HRAM_SIZE = 0x7f; // 127 bytes
const ROM_START = 0x0000;
const ROM_END = 0xffff;

class MMU {
  cart: Cartridge;
  wram = new Uint8Array(WRAM_SIZE); // 8KB of WRAM
  hram = new Uint8Array(HRAM_SIZE); // 127 bytes of HRAM
  ie = 0; // Interrupt Enable Register

  constructor(cart: Cartridge) {
    this.cart = cart;
  }

  read8(addr: number): number {
    // Validate 16-bit address
    if (!Number.isInteger(addr) || addr < ROM_START || addr > ROM_END) {
      throw new RangeError(`Invalid address: 0x${addr.toString(16)}`);
    }

    // ROM (delegates to cartridge)
    if (addr <= 0x7fff) {
      return this.cart.readAbs(addr);
    }

    // WRAM 0xC000–0xDFFF (8 KiB)
    if (addr >= 0xc000 && addr <= 0xdfff) {
      return this.wram[addr - 0xc000];
    }

    // Echo of WRAM 0xE000–0xFDFF (mirror of 0xC000–0xDDFF)
    if (addr >= 0xe000 && addr <= 0xfdff) {
      return this.wram[addr - 0xe000];
    }

    // HRAM 0xFF80–0xFFFE (127 bytes)
    if (addr >= 0xff80 && addr <= 0xfffe) {
      return this.hram[addr - 0xff80];
    }

    // IE register 0xFFFF
    if (addr === ROM_END) {
      return this.ie & 0xff;
    }

    // Unimplemented regions (VRAM, ERAM, OAM, I/O, not-usable): stub read as 0xFF
    return 0xff;
  }

  write8(addr: number, value: number): void {
    // Validate 16-bit address
    if (!Number.isInteger(addr) || addr < 0 || addr > 0xffff) {
      throw new RangeError(`Invalid address: 0x${addr.toString(16)}`);
    }

    // Always store a byte
    value &= 0xff;

    // ROM writes go to cartridge (MBC control). Cartridge will decide (and may throw for now).
    if (addr <= 0x7fff) {
      this.cart.writeAbs(addr, value);
      return;
    }

    // WRAM 0xC000–0xDFFF
    if (addr >= 0xc000 && addr <= 0xdfff) {
      this.wram[addr - 0xc000] = value;
      return;
    }

    // Echo of WRAM 0xE000–0xFDFF (mirror)
    if (addr >= 0xe000 && addr <= 0xfdff) {
      this.wram[addr - 0xe000] = value;
      return;
    }

    // HRAM 0xFF80–0xFFFE
    if (addr >= 0xff80 && addr <= 0xfffe) {
      this.hram[addr - 0xff80] = value;
      return;
    }

    // IE register 0xFFFF
    if (addr === ROM_END) {
      this.ie = value;
      return;
    }

    // Unimplemented regions (VRAM, ERAM, OAM, I/O, not-usable): no-op
    return;
  }
}

export default MMU;
