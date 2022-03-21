class PmtSection {
  public table_id: number; 　　//固定为0x02 ，标志是该表是PMT表 (8)

  public section_syntax_indicator: number;　　 //段语法标志位，固定为1 (1) 0x01
  public zero: number; 　　//0 (1) 0x01
  public reserved_1: number;　　 // 保留位 (2) 0x03

  public section_length: number; 　  //  首先两位bit置为00，它指示段的byte数，由段长度域开始，包含CRC。 (12)
  public section_length_high4: number;
  public section_length_low8: number;

  public program_number: number; 　  // 指出该节目对应于可应用的Program map PID (16)
  public program_number_high8: number;
  public program_number_low8: number;

  public reserved_2: number;　　 // 保留位 (2) 0x03
  public version_number: number; 　　// 指出TS流中Program map section的版本号 (5)
  public current_next_indicator: number; 　   //(1) 当该位置1时，当前传送的Program map section可用;当该位置0时，指示当前传送的Program map section不可用，下一个TS流的Program map section有效

  public section_number: number; 　　// 固定为0x00(8)
  public last_section_number: number; 　　//固定为0x00 (8)

  public reserved_3: number;　　 // 保留位 (3) 0x07

  public PCR_PID: number;      //  (13) //指明TS包的PID值，该TS包含有PCR域，
  public PCR_PID_hight5: number;
  public PCR_PID_low8: number;
  //该PCR值对应于由节目号指定的对应节目。
  //如果对于私有数据流的节目定义与PCR无关，这个域的值将为0x1FFF。

  public reserved_4: number;　　 // 保留位 (4) 0x0F

  public program_info_length: number; // (12) 前两位bit为00。该域指出跟随其后对节目信息的描述的byte数
  public program_info_length_high4: number;
  public program_info_length_low8: number;
  // program info descriptor // 由上面的决定是占有字段的

  static size = 12;
  constructor(data: Uint8Array) {
    this.table_id = data[0];

    this.section_syntax_indicator = data[1] >> 7 & 0x01;
    this.zero = data[1] >> 6 & 0x01;
    this.reserved_1 = data[1] >> 4 & 0x03;

    this.section_length_high4 = data[1] & 0x0f;
    this.section_length_low8 = data[2];
    this.section_length = this.section_length_high4 << 8 | this.section_length_low8;

    this.program_number_high8 = data[3];
    this.program_number_low8 = data[4];
    this.program_number = this.program_number_high8 << 8 | this.program_number_low8;

    this.reserved_2 = data[5] >> 6 & 0x03;
    this.version_number = data[5] >> 1 & 0x1f;
    this.current_next_indicator = data[5] & 0x01;

    this.section_number = data[6];
    this.last_section_number = data[7];

    this.reserved_3 = data[8] >> 5 & 0x07;

    this.PCR_PID_hight5 = data[8] & 0x1f;
    this.PCR_PID_low8 = data[9];
    this.PCR_PID = this.PCR_PID_hight5 << 8 | this.PCR_PID_low8;

    this.reserved_4 = data[10] >> 4 & 0x0f;

    this.program_info_length_high4 = data[10] & 0x0f;
    this.program_info_length_low8 = data[11];
    this.program_info_length = this.program_info_length_high4 << 8 | this.program_info_length_low8;
  }
}

export default PmtSection;