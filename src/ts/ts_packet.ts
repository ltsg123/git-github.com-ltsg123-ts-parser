import TsPacketHeader from "./head/ts_head";

class TsPacket {
  public ts_header: TsPacketHeader;

  constructor(public data: Uint8Array) {
    this.ts_header = new TsPacketHeader(data.subarray(0, 6));
  }

  get_ts_payload_offset () {
    const adaptation_field_control = this.ts_header.head.adaptation_field_control;
    let payload_offset;

    if (adaptation_field_control == 0)
      payload_offset = 188;
    else if (adaptation_field_control == 1)
      payload_offset = 4;
    else if (adaptation_field_control == 2)
      payload_offset = 188;
    else {
      payload_offset = 5 + this.ts_header.adaptation_field_length;
      if (payload_offset > 188)
        payload_offset = 188;
      else if (payload_offset < 5)
        payload_offset = 5;
    }
  }
}

export default TsPacket;