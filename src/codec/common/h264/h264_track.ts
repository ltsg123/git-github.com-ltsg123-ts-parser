import { ISpsStruct } from './h264_parse_sps';
import _MediaTrack from '../media_track';

export interface IH264Sample {
  size: number;
  duration: number;
  cts: number;
  dts: number;
  flags: {
    isLeading: number;
    isDependedOn: number;
    hasRedundancy: number;
    degradationPriority: number;
    dependsOn: number;
    isNonSync: boolean;
    paddingValue: number;
  };
  unit: Uint8Array;
};

class _H264Track extends _MediaTrack<IH264Sample> {
  public format = 'avc1';

  public type = 'video' as 'video';

  public sps?: {
    units: Uint8Array[];
  } & ISpsStruct

  public pps?: {
    units: Uint8Array[];
  };

  public dt = 0;
}

export default _H264Track;