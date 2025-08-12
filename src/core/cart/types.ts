// Code	Type
// $00	ROM ONLY
// $01	MBC1
// $02	MBC1+RAM
// $03	MBC1+RAM+BATTERY
// $05	MBC2
// $06	MBC2+BATTERY
// $08	ROM+RAM 9
// $09	ROM+RAM+BATTERY 9
// $0B	MMM01
// $0C	MMM01+RAM
// $0D	MMM01+RAM+BATTERY
// $0F	MBC3+TIMER+BATTERY
// $10	MBC3+TIMER+RAM+BATTERY 10
// $11	MBC3
// $12	MBC3+RAM 10
// $13	MBC3+RAM+BATTERY 10
// $19	MBC5
// $1A	MBC5+RAM
// $1B	MBC5+RAM+BATTERY
// $1C	MBC5+RUMBLE
// $1D	MBC5+RUMBLE+RAM
// $1E	MBC5+RUMBLE+RAM+BATTERY
// $20	MBC6
// $22	MBC7+SENSOR+RUMBLE+RAM+BATTERY
// $FC	POCKET CAMERA
// $FD	BANDAI TAMA5
// $FE	HuC3
// $FF	HuC1+RAM+BATTERY

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
  cbgFlags: number;
  sgbFlags: number;
  headerChecksumOK: boolean;
  romSizeCode: number;
  ramSizeCode: number;
}
