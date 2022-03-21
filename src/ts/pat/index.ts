class PatSection {
  public table_id: number; 　　//固定为0x00 ，标志是该表是PAT表 (8)

  public section_syntax_indicator: number;　　 //段语法标志位，固定为1 (1)
  public zero: number; 　　//0 (1)
  public reserved_1: number;　　 // 保留位 (2)

  public section_length_high4: number; //表示从下一个字段开始到CRC32(含)之间有用的字节数 (12) 高4位
  public section_length_low8: number; //表示从下一个字段开始到CRC32(含)之间有用的字节数 (12) 低8位
  public section_length: number; 　  //表示从下一个字段开始到CRC32(含)之间有用的字节数 (12)

  public transport_stream_id_high8: number; 　  //该传输流的ID，区别于一个网络中其它多路复用的流 (16) 高8位 
  public transport_stream_id_low8: number; 　  //该传输流的ID，区别于一个网络中其它多路复用的流 (16) 低8位
  public transport_stream_id: number; 　  //该传输流的ID，区别于一个网络中其它多路复用的流 (16)

  public reserved_2: number;　　 // 保留位 (2)
  public version_number: number; 　　//范围0-31，表示PAT的版本号 (5)
  public current_next_indicator: number; 　   //发送的PAT是当前有效还是下一个PAT有效 (1)

  public section_number: number; 　　//分段的号码。PAT可能分为多段传输，第一段为00，以后每个分段加1，最多可能有256个分段 (8)
  public last_section_number: number; 　　//最后一个分段的号码 (8) 为0表示只有当前分段

  static size = 8;
  constructor(data: Uint8Array) {
    this.table_id = data[0];

    this.section_syntax_indicator = data[1] >> 7 & 0x01;
    this.zero = data[1] >> 6 & 0x01;
    this.reserved_1 = data[1] >> 4 & 0x03;

    this.section_length_high4 = data[1] & 0x0f;
    this.section_length_low8 = data[2];
    this.section_length = (this.section_length_high4 << 8 | this.section_length_low8);

    this.transport_stream_id_high8 = data[3];
    this.transport_stream_id_low8 = data[4];
    this.transport_stream_id = (data[3] << 8 | data[4]);

    this.reserved_2 = data[5] >> 6 & 0x03;
    this.version_number = (data[5] >> 1) & 0x3f;
    this.current_next_indicator = data[5] & 0x01;

    this.section_number = data[6];
    this.last_section_number = data[7];
  }
}

export default PatSection;