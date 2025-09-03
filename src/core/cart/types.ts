export type CartridgeType =
  | 'ROM_ONLY'
  | 'MBC1'
  | 'MBC1+RAM'
  | 'MBC1+RAM+BATTERY'
  | 'MBC2'
  | 'MBC2+BATTERY'
  | 'ROM+RAM'
  | 'ROM+RAM+BATTERY'
  | 'MMM01'
  | 'MMM01+RAM'
  | 'MMM01+RAM+BATTERY'
  | 'MBC3+TIMER+BATTERY'
  | 'MBC3+TIMER+RAM+BATTERY'
  | 'MBC3'
  | 'MBC3+RAM'
  | 'MBC3+RAM+BATTERY'
  | 'MBC5'
  | 'MBC5+RAM'
  | 'MBC5+RAM+BATTERY'
  | 'MBC5+RUMBLE'
  | 'MBC5+RUMBLE+RAM'
  | 'MBC5+RUMBLE+RAM+BATTERY'
  | 'MBC6'
  | 'MBC7+SENSOR+RUMBLE+RAM+BATTERY'
  | 'POCKET_CAMERA'
  | 'BANDAI_TAMA5'
  | 'HUC3'
  | 'HUC1+RAM+BATTERY';

export interface CartridgeInfo {
  title: string;
  type: CartridgeType;
  romBanks: number;
  ramBanks: number;
  cgbFlag: number;
  sgbFlag: number;
  headerChecksumOK: boolean;
  romSizeCode: number;
  ramSizeCode: number;
}
