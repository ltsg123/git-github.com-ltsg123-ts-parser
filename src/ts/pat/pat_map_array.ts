class PatMapArray {
  public program_number: number;   // 节目号 (16)
  public program_number_high8: number;
  public program_number_low8: number;

  public reserved: number; // (3)
  public program_map_PID: number;  // 节目映射表的PID，节目号大于0时对应的PID，每个节目对应一个 (13)
  public program_map_PID_high5: number;
  public program_map_PID_low8: number;

  static size = 4;
  constructor(data: Uint8Array) {
    this.program_number_high8 = data[0];
    this.program_number_low8 = data[1];
    this.program_number = (this.program_number_high8 << 8) | this.program_number_low8;

    this.reserved = data[2] >> 5 & 0x07;
    this.program_map_PID_high5 = data[2] & 0x1f;
    this.program_map_PID_low8 = data[3];
    this.program_map_PID = this.program_map_PID_high5 << 8 | this.program_map_PID_low8;
  }
}

export default PatMapArray;