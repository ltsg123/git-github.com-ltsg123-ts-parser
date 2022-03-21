export default class _RTP {
  public version: number;             // 2 bits，RTP的版本

  public padding: number;             // 1 bit，如果置1，在packet的末尾被填充，填充有时是方便一些针对固定长度的算法的封装

  public extension: number;           // 1 bit，如果置1，在RTP Header会跟着一个扩展头部（header extension）

  public csrcCount: number;           // 4 bits，表示头部后contributing sources的个数

  public marker: number;              // 1 bit，具体这位的定义由配置文档（Profile）来承担，不同的有效载荷有不同的含义，一般而言，对于视频，标记一帧的结束；对于音频，标记会话的开始。

  public payloadType: number;         // 7 bits，表示所传输的多媒体的类型，如GSM音频、JPEM图像等,在流媒体中大部分是用来区分音频流和视频流的，这样便于客户端进行解析。

  public sequenceNumber: number;      // 16 bits，每个RTP packet的sequence number会自动加一，以便接收端检测丢包情况。音频包和视频包的sequence是分别记数的。

  public timestamp: number;           // 32 bits，时间戳

  public ssrc: number;                // 32 bits，同步源的id

  public csrcList: any[]              // 个数由CC指定，范围是0-15

  public headerExtension?: {          // 扩展头部
    identifier: number;
    length: number;
    data: Uint8Array;
  };

  public headerLength: number;

  public payload: Uint8Array;

  constructor(pkt: Uint8Array) {
    let bytes = new DataView(pkt.buffer, pkt.byteOffset, pkt.byteLength);

    this.version = bytes.getUint8(0) >>> 6;
    this.padding = (bytes.getUint8(0) & 0x20) >>> 5;
    this.extension = (bytes.getUint8(0) & 0x10) >>> 4;
    this.csrcCount = bytes.getUint8(0) & 0x0F;
    this.marker = bytes.getUint8(1) >>> 7;
    this.payloadType = bytes.getUint8(1) & 0x7F;
    this.sequenceNumber = bytes.getUint16(2);
    this.timestamp = bytes.getUint32(4);
    this.ssrc = bytes.getUint32(8);
    this.csrcList = [];

    let offset = 12;

    for (const max = offset + this.csrcCount * 4; offset < max; offset += 4) {
      this.csrcList.push(bytes.getUint32(offset));
    }

    // 扩展头解析
    if (this.extension === 1) {
      const identifier = bytes.getUint16(offset); offset += 2;
      // 单位字节，长度指扩展项中的32bit的个数，所以要*4
      const length = bytes.getUint16(offset) * 4; offset += 2;
      this.headerExtension = {
        identifier,
        length,
        data: pkt.slice(offset, offset + length)
      };
      offset += length;
    }

    this.headerLength = offset;

    this.payload = pkt.subarray(offset);
  }
}