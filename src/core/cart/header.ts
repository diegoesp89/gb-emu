import type { CartridgeInfo } from './types';
import type { CartridgeType } from './types';

const TITLE_OFFSET_START = 0x134;
const TITLE_OFFSET_END = 0x143;
const CBG_FLAG_OFFSET = 0x146;
const SBG_FLAG_OFFSET = 0x147;
const CARTRIDGE_TYPE_OFFSET = 0x147;
const ROM_SIZE_OFFSET = 0x148;
const RAM_SIZE_OFFSET = 0x149;
const HEADER_CHECKSUM_OFFSET = 0x14d;
const HEADER_CHECKSUM_START = 0x134;
const HEADER_CHECKSUM_END = 0x14c;
const MAX_ADDR = 0xffff;
const MINIMUM_ROM_SIZE = 0x150; // 16 bytes minimum for a valid ROM

export function calculateHeaderChecksum(rom: Uint8Array): number {
  let checksum = 0;
  for (let i = HEADER_CHECKSUM_START; i < HEADER_CHECKSUM_END; i++) {
    checksum = (checksum - rom[i]) & MAX_ADDR;
  }
  return checksum;
}

function getCartridgeType(type: number): CartridgeType {
  switch (type) {
    case 0x00:
      return 'ROM_ONLY';
    case 0x01:
      return 'MBC1';
    case 0x02:
      return 'MBC1+RAM';
    case 0x03:
      return 'MBC1+RAM+BATTERY';
    case 0x05:
      return 'MBC2';
    case 0x06:
      return 'MBC2+BATTERY';
    case 0x08:
      return 'ROM+RAM';
    case 0x09:
      return 'ROM+RAM+BATTERY';
    case 0x0b:
      return 'MMM01';
    case 0x0c:
      return 'MMM01+RAM';
    case 0x0d:
      return 'MMM01+RAM+BATTERY';
    case 0x0f:
      return 'MBC3+TIMER+BATTERY';
    case 0x10:
      return 'MBC3+TIMER+RAM+BATTERY';
    case 0x11:
      return 'MBC3';
    case 0x12:
      return 'MBC3+RAM';
    case 0x13:
      return 'MBC3+RAM+BATTERY';
    case 0x19:
      return 'MBC5';
    case 0x1a:
      return 'MBC5+RAM';
    case 0x1b:
      return 'MBC5+RAM+BATTERY';
    case 0x1c:
      return 'MBC5+RUMBLE';
    case 0x1d:
      return 'MBC5+RUMBLE+RAM';
    case 0x1e:
      return 'MBC5+RUMBLE+RAM+BATTERY';
    case 0x20:
      return 'MBC6';
    case 0x22:
      return 'MBC7+SENSOR+RUMBLE+RAM+BATTERY';
    case 0xfc:
      return 'POCKET_CAMERA';
    case 0xfd:
      return 'BANDAI_TAMA5';
    case 0xfe:
      return 'HUC3';
    case 0xff:
      return 'HUC1+RAM+BATTERY';
    default:
      throw new Error(`Unknown cartridge type: ${type}`);
  }
}

function getRomBanks(romSizeCode: number): number {
  switch (romSizeCode) {
    case 0x00:
      return 2; // 32KB
    case 0x01:
      return 4; // 64KB
    case 0x02:
      return 8; // 128KB
    case 0x03:
      return 16; // 256KB
    case 0x04:
      return 32; // 512KB
    case 0x05:
      return 64; // 1MB
    case 0x06:
      return 128; // 2MB
    case 0x07:
      return 256; // 4MB
    case 0x52:
      return 72; // 1.1MB
    case 0x53:
      return 80; // 1.2MB
    case 0x54:
      return 96; // 1.5MB
    default:
      throw new Error(`Unknown ROM size code: ${romSizeCode}`);
  }
}

function getRamBanks(ramSizeCode: number): number {
  switch (ramSizeCode) {
    case 0x00:
      return 0; // No RAM
    case 0x01:
      return 1; // 2Kb UNUSED
    case 0x02:
      return 1; // 8KB
    case 0x03:
      return 4; // 32KB
    case 0x04:
      return 16; // 64KB
    case 0x05:
      return 8; // 128KB
    default:
      throw new Error(`Unknown RAM size code: ${ramSizeCode}`);
  }
}
export function parseHeader(rom: Uint8Array): CartridgeInfo {
  if (rom.length < MINIMUM_ROM_SIZE) {
    throw new RangeError('ROM must be at least 16 bytes');
  }

  const title = new TextDecoder().decode(rom.slice(TITLE_OFFSET_START, TITLE_OFFSET_END)).trim();
  const type = rom[CARTRIDGE_TYPE_OFFSET];
  const romSizeCode = rom[ROM_SIZE_OFFSET];
  const ramSizeCode = rom[RAM_SIZE_OFFSET];
  const cbgFlags = rom[CBG_FLAG_OFFSET];
  const sgbFlags = rom[SBG_FLAG_OFFSET];
  const headerChecksumOK = rom[HEADER_CHECKSUM_OFFSET] === calculateHeaderChecksum(rom);

  return {
    title,
    type: getCartridgeType(type),
    romBanks: getRomBanks(romSizeCode),
    ramBanks: getRamBanks(ramSizeCode),
    cbgFlags,
    sgbFlags,
    headerChecksumOK,
    romSizeCode,
    ramSizeCode,
  };
}
