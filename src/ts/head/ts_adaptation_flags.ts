// TS adaptation flags
class TsAdaptationFlags {
  public adaptation_field_extension_flag: number;
  public transport_private_data_flag: number;
  public splicing_point_flag: number;
  public OPCR_flag: number;
  public PCR_flag: number;
  public elementary_stream_priority_indicator: number;
  public random_access_indicator: number;
  public discontinuity_indicator: number;

  constructor(data: number) {
    this.adaptation_field_extension_flag = data >> 7 & 0x01;
    this.transport_private_data_flag = data >> 6 & 0x01;
    this.splicing_point_flag = data >> 5 & 0x01;
    this.OPCR_flag = data >> 4 & 0x01;
    this.PCR_flag = data >> 3 & 0x01;
    this.elementary_stream_priority_indicator = data >> 2 & 0x01;
    this.random_access_indicator = data >> 1 & 0x01;
    this.discontinuity_indicator = data & 0x01;
  }
}

export default TsAdaptationFlags;