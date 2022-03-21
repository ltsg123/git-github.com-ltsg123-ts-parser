import { concatUint8 } from '../utils/utils';
import _NALU, { NALUheader, NALU_TYPE } from './nalu';

/**
 * @description 组帧
 * @author xiaoshumin
 * @date 2022-03-10
 * @class _NALUFactory
 */
class _NALUFactory {
  private _priv_FU_data: Uint8Array | null = null;

  private _priv_subscirbe?: (nalus: _NALU[]) => void;

  constructor(subscirbe: (nalus: _NALU[]) => void) {
    this._priv_subscirbe = subscirbe;
  }

  public inputNalu (data: Uint8Array, pts: number) {
    const dv = new DataView(data.buffer, data.byteOffset, data.byteLength);

    const header = _NALU.parseHeader(dv.getUint8(0));

    let nalu: _NALU[] | undefined;

    if (header.type > 0 && header.type < 24) {
      nalu = [this._parseSingleNaluPacket(data.subarray(1), header, pts)];
    } else if (
      header.type === NALU_TYPE.STAP_A ||
      header.type === NALU_TYPE.STAP_B
    ) {
      this._parseAggregationPacket(data.subarray(1), header, pts, header.type === NALU_TYPE.STAP_B);
    } else if (
      header.type === NALU_TYPE.MTAP16 ||
      header.type === NALU_TYPE.MTAP24
    ) {

    } else if (
      header.type === NALU_TYPE.FU_A ||
      header.type === NALU_TYPE.FU_B
    ) {
      const res = this._parseFragmentationUnit(data.subarray(1), header, pts, header.type === NALU_TYPE.FU_B);
      res && (nalu = [res]);
    } else {

    }

    nalu && this._priv_subscirbe && this._priv_subscirbe(nalu);
  }

  public destroy () {
    this._priv_subscirbe = undefined;
  }

  // 单包解析
  private _parseSingleNaluPacket (data: Uint8Array, header: NALUheader, pts: number) {
    return new _NALU(header, data, pts);
  }

  // 聚合包解析
  private _parseAggregationPacket (data: Uint8Array, _: NALUheader, pts: number, hasDON: boolean) {
    const dv = new DataView(data.buffer, data.byteOffset, data.byteLength);
    let offset = 0;
    // let don = null;

    if (hasDON) {
      // don = dv.getUint16(offset);
      offset += 2;
    }

    let nalus: _NALU[] = [];
    while (offset < data.byteLength) {
      const size = dv.getUint16(offset); offset += 2;
      const header = _NALU.parseHeader(dv.getInt8(offset)); offset++;
      const nalu = this._parseSingleNaluPacket(data.subarray(offset, offset + size), header, pts);
      nalus.push(nalu);
    }
    return nalus;
  }

  private _parseFragmentationUnit (data: Uint8Array, header: NALUheader, pts: number, hasDON: boolean) {
    const dv = new DataView(data.buffer, data.byteOffset, data.byteLength);
    let offset = 0;
    // let don = null;

    // FU 头解析
    const fuHeader = dv.getUint8(offset); offset++;
    const isStart = (fuHeader & 0x80) >> 7;
    const isEnd = (fuHeader & 0x40) >> 6;
    const type = fuHeader & 0x1F;

    header.type = type;

    if (hasDON) {
      // don = dv.getUint16(offset);
      offset += 2;
    }

    if (isStart) {
      this._priv_FU_data = data.subarray(offset);
    }

    if (this._priv_FU_data) {
      if (!isStart) {
        this._priv_FU_data = concatUint8(this._priv_FU_data, data.subarray(offset));
      }

      if (isEnd) {
        const nalu = new _NALU(header, this._priv_FU_data, pts);
        this._priv_FU_data = null;
        return nalu;
      }
    }
    return;
  }
}

export default _NALUFactory;