class PmtStreamArray {
  public stream_type: number;   // 指示特定PID的节目元素包的类型。该处PID由elementary PID指定 （8）
  public reserved_1: number;   // 0x07 (3)

  public elementary_PID: number;   // 该域指示TS包的PID值。这些TS包含有相关的节目元素 (13)
  public elementary_PID_high5: number;
  public elementary_PID_low8: number;

  public reserved_2: number;   // 0x0F (4)

  public ES_info_length: number;   // 前两位bit为00。该域指示跟随其后的描述相关节目元素的byte数 (12)
  public ES_info_length_high4: number;
  public ES_info_length_low8: number;

  static size = 4;

  public length: number;
  constructor(public data: Uint8Array) {
    this.stream_type = data[0];
    this.reserved_1 = data[1] >> 5 & 0x07;

    this.elementary_PID_high5 = data[1] & 0x1f;
    this.elementary_PID_low8 = data[2];
    this.elementary_PID = this.elementary_PID_high5 << 8 | this.elementary_PID_low8;

    this.reserved_2 = data[3] >> 4 & 0x0f;

    this.ES_info_length_high4 = data[3] & 0x0f;
    this.ES_info_length_low8 = data[4];

    this.ES_info_length = this.ES_info_length_high4 << 8 | this.ES_info_length_low8;

    this.length = data.length;
  }
}
export default PmtStreamArray;