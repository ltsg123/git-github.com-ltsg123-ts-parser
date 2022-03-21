import TsAdaptationFlags from "./ts_adaptation_flags";
import TsPacketPureHeader from "./ts_pure_header";

class TsPacketHeader {
  public head: TsPacketPureHeader;

  public adaptation_field_length: number; // (8 bits) 这个字节指明了自适应区的长度，不包含此字节 如果为0后续不管

  public flags: TsAdaptationFlags;

  public length: number;

  constructor(data: Uint8Array) {
    this.head = new TsPacketPureHeader(data.subarray(0, 4));

    this.adaptation_field_length = data[4];

    this.flags = new TsAdaptationFlags(data[5]);

    this.length = data.length;
  }
}

export default TsPacketHeader;