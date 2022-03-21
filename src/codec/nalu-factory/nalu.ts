export enum NALU_TYPE {
  NON_IDR = 1,
  SLICE_PART_A,
  SLICE_PART_B,
  SLICE_PART_C,
  IDR,
  SEI,                // Supplemental enhancement information (SEI)
  SPS,                // Sequence parameter set
  PPS,                // Picture parameter set
  DELIMITER,          // Access unit delimiter
  EOSEQ,              // End of sequence
  EOSTR,              // End of stream
  FILTER,             // Filler data
  STAP_A = 24,
  STAP_B,
  MTAP16,
  MTAP24,
  FU_A,
  FU_B
}

export interface NALUheader {
  F: number;
  NRI: number;
  type: number;
}

export default class _NALU {
  public type: string;

  // _NALU 头解析
  // +---------------+
  // |0|1|2|3|4|5|6|7|
  // +-+-+-+-+-+-+-+-+
  // |F|NRI|  Type   |
  // +---------------+
  static parseHeader (hdr: number) {
    return {
      F: (hdr & 0x80) >> 7,
      NRI: (hdr & 0x60) >> 5,
      type: hdr & 0x1F
    };
  }

  constructor(public header: NALUheader, public payload: Uint8Array, public dts: number, public pts = dts) {
    this.type = NALU_TYPE[this.header.type];
  }

  public getData () {
    const unit = new Uint8Array(this.getSize());
    const dv = new DataView(unit.buffer);

    // nalu size
    dv.setUint32(0, 1 + this.payload.byteLength);
    // nalu hdr
    dv.setUint8(4, (this.header.F << 7) + (this.header.NRI << 5) + this.header.type);

    unit.set(this.payload, 5);

    return unit;
  }

  public getSize () {
    return 4 + 1 + this.payload.byteLength;
  }

  public isKeyframe () {
    return this.header.type === NALU_TYPE.IDR;
  }
}