import { outputEs } from "..";
import TsPacketHeader from "./head/ts_head";
import PatSection from "./pat";
import PatMapArray from "./pat/pat_map_array";
import { lts_pes_parse_header } from "./pes";
import PmtSection from "./pmt";
import PmtStreamArray from "./pmt/pmt_stream_array";
import { MAX_PROGRAM_NUM, MAX_STREAM_NUM, TDemux, TsProgramInfo, TsProgramSpec, TsStreamSpec } from "./TDemux/types";
import TsPacket from "./ts_packet";

export function handle_ts_pack (handle: TDemux, data: Uint8Array) {
  const tsPacket = new TsPacket(data);
  const pid = tsPacket.ts_header.head.pid;

  if (!handle.info) {
    handle.info = {} as TsProgramInfo;
  }
  // console.log('pid', pid);

  // 如果是PAT表，则更新handle
  // 不支持过长的PAT或PMT表
  if (pid == 0) {
    const payload_offset = get_ts_payload_offset(tsPacket.ts_header) + 1;
    const payload = data.subarray(payload_offset);
    const payload_len = 188 - payload_offset;
    if (payload_len >= PatSection.size) {
      const pat = new PatSection(payload);
      const section_len = pat.section_length;
      if (payload_len >= section_len + 3) {
        let pnum = (payload_len - 4 - PatSection.size) / PatMapArray.size;
        const maps = payload.subarray(PatSection.size);

        if (pnum > MAX_PROGRAM_NUM) {
          pnum = MAX_PROGRAM_NUM;
        }
        handle.info.program_num = pnum;
        if (!handle.info.prog) {
          handle.info.prog = [];
        }
        for (let i = 0; i < pnum; i++) {
          // 最多支持MAX_PROGRAM_NUM张PMT表
          if (i >= MAX_PROGRAM_NUM)
            break;

          if (!handle.info.prog[i]) {
            handle.info.prog[i] = {} as TsProgramSpec;
          }
          handle.info.prog[i].pmt_pid = (new PatMapArray(maps.subarray(PatMapArray.size * i, PatMapArray.size * (i + 1)))).program_map_PID;
        }
      }
    }

    return 0;
  }

  if (!handle.info.program_num) {
    return 0;
  }

  // 查找是否是某个节目的PMT表
  for (let i = 0; i < handle.info.program_num; i++) {
    if (pid == handle.info.prog[i].pmt_pid) {
      const payload_offset = get_ts_payload_offset(tsPacket.ts_header) + 1;
      const payload = data.subarray(payload_offset);
      const payload_len = 188 - payload_offset;
      if (payload_len >= PmtSection.size) {
        const pmt = new PmtSection(payload);
        const section_len = pmt.section_length;
        if (payload_len >= section_len + 3) {
          let program_info_length = pmt.program_info_length;
          let stm = new PmtStreamArray(payload.subarray(PmtSection.size + program_info_length));
          let sn;
          for (sn = 0; sn < MAX_STREAM_NUM; sn++) {
            if (stm.length + 4 >= payload.length + 3 + section_len) {
              break;
            }
            if (!handle.info.prog[i].stream) {
              handle.info.prog[i].stream = [];
            }
            if (!handle.info.prog[i].stream[sn]) {
              handle.info.prog[i].stream[sn] = {
                es_pid: stm.elementary_PID,
                type: stm.stream_type
              } as TsStreamSpec;
            } else {
              handle.info.prog[i].stream[sn].es_pid = stm.elementary_PID;
              handle.info.prog[i].stream[sn].type = stm.stream_type;
            }

            stm = new PmtStreamArray(stm.data.subarray(PmtStreamArray.size + stm.ES_info_length));
          }
          handle.info.prog[i].stream_num = sn;
        }
      }

      return 0;
    }
  }

  // 查找是否是某个节目的某条流
  for (let i = 0; i < handle.info.program_num; i++) {
    let sn;
    for (sn = 0; sn < handle.info.prog[i].stream_num; sn++) {
      if (pid == handle.info.prog[i].stream[sn].es_pid) {
        handle.program_no = i;
        handle.stream_no = sn;
        get_ts_pcr(tsPacket, handle);
        handle.is_pes = 1;
        get_ts_es(tsPacket, handle);
        return 0;
      }
    }
  }

  // 未找到
  return 0;
}

function get_ts_payload_offset (ts_header: TsPacketHeader) {
  const adaptation_field_control = ts_header.head.adaptation_field_control;
  let payload_offset;

  if (adaptation_field_control == 0)
    payload_offset = 188;
  else if (adaptation_field_control == 1)
    payload_offset = 4;
  else if (adaptation_field_control == 2)
    payload_offset = 188;
  else {
    payload_offset = 5 + ts_header.adaptation_field_length;
    if (payload_offset > 188)
      payload_offset = 188;
    else if (payload_offset < 5)
      payload_offset = 5;
  }

  return payload_offset;
}

function get_ts_pcr (tsPacket: TsPacket, handle: TDemux) {
  const header = tsPacket.ts_header;
  if (header.head.adaptation_field_control == 0 ||
    header.head.adaptation_field_control == 1)
    return;
  if (header.adaptation_field_length == 0)
    return;

  if (header.flags.PCR_flag) {
    const buf = tsPacket.data.subarray(6);
    handle.pts = (buf[0] << 25) |
      (buf[1] << 17) |
      (buf[2] << 9) |
      (buf[3] << 1) |
      (buf[4] >> 7);
    handle.pts /= 90;
  }
}

function get_ts_es (tsPacket: TsPacket, handle: TDemux) {
  let payload_offset;
  let payload_len;

  payload_offset = get_ts_payload_offset(tsPacket.ts_header);
  payload_len = 188 - payload_offset;


  // 计算PES包头长度
  if (!handle.pes_head_len || handle.pes_head_len <= 0) {
    handle.pes_head_len = lts_pes_parse_header(tsPacket.data.subarray(payload_offset), payload_len, handle);
  }

  // 去除PES包头
  if (handle.pes_head_len > 0) {
    if (handle.pes_head_len <= payload_len) {
      handle.es_ptr = payload_offset + handle.pes_head_len;
      handle.es_len = payload_len - handle.pes_head_len;
      outputEs(tsPacket.data.subarray(handle.es_ptr, handle.es_ptr + handle.es_len), handle.es_ptr, handle.es_len, handle.pes_stream_id, handle.pts);
      handle.pes_head_len = 0;
    }
    else {
      handle.pes_head_len -= payload_len;
      handle.es_ptr = null;
      handle.es_len = 0;
    }
  }
  else {
    handle.es_ptr = payload_offset;
    handle.es_len = payload_len;
    outputEs(tsPacket.data.subarray(handle.es_ptr, handle.es_ptr + handle.es_len), handle.es_ptr, handle.es_len, handle.pes_stream_id, handle.pts);
  }
}

let demuxIndex = 0;
export function lts_ts_demux (handle: TDemux, ts_buf: Uint8Array, len: number) {
  let ret = 0;
  let i;

  if (!handle || !ts_buf || len <= 0) {
    return -1;
  }

  handle.is_pes = 0;
  handle.pack_ptr = null;
  handle.pack_len = 0;

  // 只解出最开头一包
  for (i = 0; i < len; i += 188) {
    if (ts_buf[i] == 0x47) {
      if (len >= 188) {
        handle.pack_ptr = i;
        handle.pack_len = 188;
        if (!handle.sync_only) {
          demuxIndex++;
          // console.log('ret---------------', ret);
          handle_ts_pack(handle, ts_buf.subarray(i));
          if (demuxIndex === 268) {
            // if (demuxIndex > 250 && demuxIndex < 300) {
            console.log('demux前的分片index是：', demuxIndex);
            return;
          }
        }
        ret = i + 188;
        continue;
      }
    } else {
      console.log('err')
    }
  }

  return ret;
}
