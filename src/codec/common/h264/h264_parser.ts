import _H264Track, { IH264Sample } from './h264_track';
import _NALU, { NALU_TYPE } from '../../nalu-factory/nalu';
import { byte2HexString } from '../../utils/utils';
import h264ParseSPS from './h264_parse_sps';
import _NALUFactory from '../../nalu-factory';
import _RTP from '../../utils/rtp';

export default class _H264Parser {
  private _priv_pps?: _NALU;

  private _priv_sps?: _NALU;

  private _priv_track = new _H264Track();

  private _priv_getKeyFrame = false;

  private _priv_naluFactory: _NALUFactory;

  constructor() {
    const parseFunc = (nalus: _NALU[]) => {
      nalus.forEach((nalu: _NALU) => this._parseNALU(nalu));
    };
    this._priv_naluFactory = new _NALUFactory(parseFunc.bind(this));
  }

  public onReady?: (track: _H264Track) => void;

  public onUpdate?: (sample: IH264Sample) => void;

  public recvRTP (data: Uint8Array, pts: number) {
    this._priv_naluFactory.inputNalu(data, pts);
  }

  public destroy () {
    this._priv_naluFactory.destroy();
    this._priv_track.destroy();
    this.onReady = undefined;
    this.onUpdate = undefined;
  }

  private _parseNALU (unit: _NALU) {
    console.log('unit', unit)
    // console.log(unit.type);
    switch (unit.header.type) {
      case NALU_TYPE.NON_IDR:
      case NALU_TYPE.IDR:
        if (this._priv_track.samples.length === 0) {
          this._priv_track.dt = unit.dts;
        }
        this._priv_track.samples.push({
          size: unit.getSize(),
          duration: 3600,
          cts: 0,
          dts: unit.dts,
          flags: {
            isLeading: 0,
            isDependedOn: 0,
            hasRedundancy: 0,
            degradationPriority: 0,
            dependsOn: unit.isKeyframe() ? 2 : 1,
            isNonSync: unit.isKeyframe() ? false : true,
            paddingValue: 0
          },
          unit: unit.getData()
        });
        // this.track.duration = this.track.samples.length * 3600;

        if (this._checkStart()) {
          if (this._priv_track.samples.length > 0) {
            this.onUpdate && this.onUpdate(this._priv_track.samples.shift()!);
          }
        }
        break;
      case NALU_TYPE.SPS:
        if (!this._priv_sps) {
          console.log('sps-----');
          console.log(unit);
          this._priv_sps = unit;
          const sps = h264ParseSPS(unit);
          this._priv_track.sps = {
            ...sps,
            units: [unit.getData().subarray(4)]
          };
          this._priv_track.width = sps.width;
          this._priv_track.height = sps.height;
          this._priv_track.codec = `${this._priv_track.format}.${byte2HexString(sps.profile_idc)}${byte2HexString(sps.profile_compatibility)}${byte2HexString(sps.level_idc)}`;
        }
        break;
      case NALU_TYPE.PPS:
        if (!this._priv_pps) {
          this._priv_pps = unit;
          this._priv_track.pps = {
            units: [unit.getData().subarray(4)]
          }
        }
        break;
      case NALU_TYPE.SEI:
        break;
      default:
      // console.log('unknown', unit);
    }
  }

  private _checkStart () {
    if (this._priv_pps && this._priv_sps && !this._priv_getKeyFrame) {
      this._priv_getKeyFrame = true;
      this.onReady && this.onReady(this._priv_track);
      if (this._priv_track.samples.length > 0) {
        this.onUpdate && this.onUpdate(this._priv_track.samples.shift()!);
      }
    }

    return this._priv_getKeyFrame;
  }
}