class TsPacketPureHeader {
  private static SYNC_BYTE = 0x47;  // 同步字节0x47，用于标识是TS包。
  private static HEADER_LENGTH = 4;

  // 总共四个字节
  public sync_byte: number; // (8 bits)  同步字节，固定为 (71)

  public transport_error_indicator: number; // (1 bit) // 错误指示信息
  public payload_unit_start_indicator: number; // (1 bit)  // 负载单元开始标志（packet不满188字节时需要填充）
  public transport_priority: number; // (1 bit)  传输优先级 1：优先级高

  public pid_hight5: number; // pid高5位
  public pid_low8: number; // pid低8位
  public pid: number; // (13 bits) 每个包种类的标识

  public transport_scrambling_control: number; // (2 bits) 假面标志（00：未加密；其他表示已加密）
  public adaptation_field_control: number;  // (2 bits) 
  // 此字段标识是否有自适应区
  // 00：是保留值。
  // 01：负载中只有有效载荷。
  // 10：负载中只有自适应字段。
  // 11：先有自适应字段，再有有效载荷。
  public continuity_counter: number; // (4 bits) 包递增计数器

  // Uint8Array长度
  public length: number;
  constructor(data: Uint8Array) {
    if (data.byteLength < TsPacketPureHeader.HEADER_LENGTH) {
      throw Error("The pure header of TS packet has less 4 bytes");
    }

    if (data[0] !== TsPacketPureHeader.SYNC_BYTE) {
      throw Error("The SYNC_BYTE of TsPacketPureHeader is not 0x47");
    }
    this.sync_byte = data[0];
    this.transport_error_indicator = data[1] >> 7 & 0x01;
    this.payload_unit_start_indicator = data[1] >> 6 & 0x01;
    this.transport_priority = data[1] >> 5 & 0x01;

    this.pid_hight5 = data[1] & 0x1f;
    this.pid_low8 = data[2];
    this.pid = (this.pid_hight5 << 8 | data[2]);

    this.transport_scrambling_control = data[3] >> 6 & 0x03;
    this.adaptation_field_control = data[3] >> 4 & 0x03;
    this.continuity_counter = data[3] & 0x0f;

    this.length = data.length;
  }
}

export default TsPacketPureHeader;