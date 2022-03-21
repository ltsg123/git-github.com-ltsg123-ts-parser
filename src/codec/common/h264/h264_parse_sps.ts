import _NALU from '../../nalu-factory/nalu';
import { _ExpGolomb } from '../../utils/exp-golomb';

export interface ISpsStruct {
  profile_idc: number;
  profile_compatibility: number;
  level_idc: number;

  width: number;
  height: number;
  fps?: number;
}

function h264ParseSPS (data: _NALU): ISpsStruct {
  const decoder = new _ExpGolomb(data.payload);

  // 66 => baseline profile
  // 77 => main profile
  // 88 => extended profile
  const profile_idc = decoder.readUByte();

  // decoder.readBits(6);  // constraint_set[0-5]_flag  u(6)

  // decoder.skipBits(2);  // reserved_zero_2bits  u(2)

  const profile_compatibility = decoder.readUByte();

  const level_idc = decoder.readUByte();  // u(8)

  decoder.skipUEG();  // seq_parameter_set_id

  console.log('[h264ParseSPS]:profile_idc', profile_idc);

  console.log('[h264ParseSPS]:level_idc', level_idc);


  if ([100, 110, 122, 244, 44, 83, 86, 118, 128].includes(profile_idc)) {
    const chroma_format_idc = decoder.readUEG();
    if (chroma_format_idc === 3) {
      decoder.skipBits(1);  // separate_colour_plane_flag
    }
    decoder.skipUEG();  // bit_depth_luma_minus8
    decoder.skipUEG();  // bit_depth_chroma_minus8
    decoder.skipBits(1);  // qpprime_y_zero_transform_bypass_flag
    if (decoder.readBoolean()) {  // seq_scaling_matrix_present_flag
      for (let i = 0; i < (chroma_format_idc !== 3 ? 8 : 12); i++) {
        if (decoder.readBoolean()) { // seq_scaling_list_present_flag[i]
          if (i < 6) {
            scaling_list(decoder, 16);
          } else {
            scaling_list(decoder, 64);
          }
        }
      }
    }
  }
  decoder.skipUEG();  // log2_max_frame_num_minus4
  const pic_order_cnt_type = decoder.readUEG();
  if (pic_order_cnt_type === 0) {
    decoder.readUEG();  // log2_max_pic_order_cnt_lsb_minus4
  } else {
    decoder.skipBits(1); // delta_pic_order_always_zero_flag
    decoder.skipEG(); // offset_for_non_ref_pic
    decoder.skipEG(); // offset_for_top_to_bottom_field
    const num_ref_frames_in_pic_order_cnt_cycle = decoder.readUEG();
    for (let i = 0; i < num_ref_frames_in_pic_order_cnt_cycle; ++i) {
      decoder.skipEG(); // offset_for_ref_frame[i]
    }
  }
  decoder.skipUEG(); // max_num_ref_frames
  decoder.skipBits(1); // gaps_in_frame_num_value_allowed_flag
  const pic_width_in_mbs_minus1 = decoder.readUEG();
  const pic_height_in_map_units_minus1 = decoder.readUEG();
  const frame_mbs_only_flag = decoder.readBits(1);
  if (frame_mbs_only_flag === 0) {
    decoder.skipBits(1);  // mb_adaptive_frame_field_flag
  }
  decoder.skipBits(1); // direct_8x8_inference_flag

  const frame_cropping_flag = decoder.readBoolean();
  const frame_crop_left_offset = frame_cropping_flag ? decoder.readUEG() : 0;
  const frame_crop_right_offset = frame_cropping_flag ? decoder.readUEG() : 0;
  const frame_crop_top_offset = frame_cropping_flag ? decoder.readUEG() : 0;
  const frame_crop_bottom_offset = frame_cropping_flag ? decoder.readUEG() : 0;

  const vui_parameters_present_flag = decoder.readBoolean();
  const sar_scale = vui_parameters_present_flag ? vui_parameters(decoder) : 1;

  console.log('[h264ParseSPS]:pic_width_in_mbs_minus1', (pic_width_in_mbs_minus1 + 1) * 16);
  console.log('[h264ParseSPS]:pic_height_in_map_units_minus1', (pic_height_in_map_units_minus1 + 1) * 16);


  return {
    profile_idc,
    profile_compatibility,
    level_idc,
    width: Math.ceil((((pic_width_in_mbs_minus1 + 1) * 16) - frame_crop_left_offset * 2 - frame_crop_right_offset * 2) * sar_scale),
    height: ((2 - frame_mbs_only_flag) * (pic_height_in_map_units_minus1 + 1) * 16) - ((frame_mbs_only_flag ? 2 : 4) * (frame_crop_top_offset + frame_crop_bottom_offset))
  };
}

function scaling_list (scalingList: _ExpGolomb, size: number) {
  let lastScale = 8;
  let nextScale = 8;

  for (let i = 0; i < size; i++) {
    if (nextScale !== 0) {
      const delta_scale = scalingList.readEG();
      nextScale = (lastScale + delta_scale + 256) % 256;
    }
    scalingList.data[i] = (nextScale === 0) ? lastScale : nextScale;
    lastScale = scalingList.data[i];
  }
}

function vui_parameters (decoder: _ExpGolomb) {
  let sarScale = 1;
  if (decoder.readBoolean()) {
    // aspect_ratio_info_present_flag
    let sarRatio;
    const aspectRatioIdc = decoder.readUByte();
    switch (aspectRatioIdc) {
      case 1: sarRatio = [1, 1]; break;
      case 2: sarRatio = [12, 11]; break;
      case 3: sarRatio = [10, 11]; break;
      case 4: sarRatio = [16, 11]; break;
      case 5: sarRatio = [40, 33]; break;
      case 6: sarRatio = [24, 11]; break;
      case 7: sarRatio = [20, 11]; break;
      case 8: sarRatio = [32, 11]; break;
      case 9: sarRatio = [80, 33]; break;
      case 10: sarRatio = [18, 11]; break;
      case 11: sarRatio = [15, 11]; break;
      case 12: sarRatio = [64, 33]; break;
      case 13: sarRatio = [160, 99]; break;
      case 14: sarRatio = [4, 3]; break;
      case 15: sarRatio = [3, 2]; break;
      case 16: sarRatio = [2, 1]; break;
      case 255: {
        sarRatio = [decoder.readUByte() << 8 | decoder.readUByte(), decoder.readUByte() << 8 | decoder.readUByte()];
        break;
      }
    }
    if (sarRatio) {
      sarScale = sarRatio[0] / sarRatio[1];
    }
  }
  if (decoder.readBoolean()) { decoder.skipBits(1); }

  if (decoder.readBoolean()) {
    decoder.skipBits(4);
    if (decoder.readBoolean()) {
      decoder.skipBits(24);
    }
  }
  if (decoder.readBoolean()) {
    decoder.skipUEG();
    decoder.skipUEG();
  }
  if (decoder.readBoolean()) {
    let unitsInTick = decoder.readUInt();
    let timeScale = decoder.readUInt();
    let fixedFrameRate = decoder.readBoolean();
    let frameDuration = timeScale / (2 * unitsInTick);
    console.log(`timescale: ${timeScale}; unitsInTick: ${unitsInTick}; fixedFramerate: ${fixedFrameRate}; avgFrameDuration: ${frameDuration}`);
  }

  return sarScale;
}

export default h264ParseSPS;