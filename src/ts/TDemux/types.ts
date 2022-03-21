

// 每条流的详情
export interface TsStreamSpec {
  type: number;			// [I]媒体类型
  stream_id: Uint8Array;				// [O]实体流ID（与PES头部id相同）
  es_pid: number;			// [O]实体流的PID
  continuity_counter: number;			// [O] TS包头部的连续计数器, 外部需要维护这个计数值, 必须每次传入上次传出的计数值
}

// 每个节目的详情
export const MAX_STREAM_NUM = 4;
export interface TsProgramSpec {
  stream_num: number;			// [I]这个节目包含的流个数
  key_stream_id: number;		// {I]基准流编号
  pmt_pid: number;			// [O]这个节目对应的PMT表的PID（TS解码用）
  mux_rate: number;			// [O]这个节目的码率，单位为50字节每秒(PS编码用)
  stream: TsStreamSpec[]; // MAX_STREAM_NUM
}

// 节目信息（目前最多支持1个节目2条流）
export const MAX_PROGRAM_NUM = 1;
export interface TsProgramInfo {
  program_num: number;		// [I]这个TS流包含的节目个数，对于PS该值只能为1
  pat_pmt_counter: number;	// [O]PAT、PMT计数器
  prog: TsProgramSpec[]; // MAX_PROGRAM_NUM
}

/* 接口函数，组帧。                                                     */
/************************************************************************/
interface TDemux {
  info: TsProgramInfo;		// 节目信息
  is_pes: number;				// 属于数据，不是PSI
  pid: number;				// 当前包的PID
  program_no: number;			// 当前包所属的节目号
  stream_no: number;			// 当前包所属的流号
  pts: number;			// 当前包的时间戳
  pes_pts: number;		// 当前PES的时间戳
  pack_ptr: number | null;		// 解出一包的首地址
  pack_len: number;			// 解出一包的长度
  es_ptr: number | null;		// ES数据首地址
  es_len: number;				// ES数据长度
  pes_head_len: number;		// PES头部长度
  sync_only: number;			// 只同步包，不解析包
  ps_started: number;			// 已找到PS头部
};

export {
  TDemux
}