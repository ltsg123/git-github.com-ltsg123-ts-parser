import { TDemux } from "../TDemux/types";

// 解析PES总长
function get_pes_head_len (pes: Uint8Array, len: number) {
  let pes_head_len = 0;

  if (len < 9) {
    return 0;
  }

  if (pes[0] == 0 && pes[1] == 0 && pes[2] == 1) {
    if ((pes[3] & 0xC0) || (pes[3] & 0xE0)) {
      pes_head_len = 9 + pes[8];
    }
  }

  return pes_head_len;
}

export function lts_pes_parse_header (pes: Uint8Array, len: number, stream_id: number | null, handle: TDemux) {
  let pes_head_len = get_pes_head_len(pes, len);
  if (pes_head_len <= 0) {
    return 0;
  }

  if (stream_id) {
    //
  }
  // 解析PTS
  if (handle) {
    let flags_2 = pes[7];
    if (flags_2 & 0x80) {
      let pts_buf = pes.subarray(9);
      handle.pts = pts_buf[0] & 0x0E << 30;
      handle.pts |= (pts_buf[1]) << 22;
      handle.pts |= (pts_buf[2] & 0xFE) << 15;
      handle.pts |= pts_buf[3] << 7;
      handle.pts |= (pts_buf[4] >> 1 & 0xFE);
      // handle.pts /= 90;
    } else if (flags_2 & 0xc0) {
      console.log('flags_2:', pes[7]);
    }
  }

  return pes_head_len;
}

function BUF2U16 (data: Uint8Array) {
  return data[0] << 8 | data[1];
}