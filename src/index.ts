import _H264Parser from './codec/common/h264/h264_parser';
import { download, write } from './download';
import { compareEs } from './test';
import { lts_ts_demux } from './ts';
import { TDemux } from './ts/TDemux/types';

const source = document.getElementById('source') as any;
if (source) {
  source.addEventListener('change', processFiles)
}

const parser = new _H264Parser();
parser.onReady = (track: any) => console.log('track', track);
parser.onUpdate = (sample: any) => console.log('sample', sample);

let num = 0;

export function tsParser (data: Uint8Array) {
  const tDemux = {} as TDemux;
  lts_ts_demux(tDemux, data, data.length);

  download('js解析后数据');
}

function processFiles () {
  const file = source.files[0];
  const reader = new FileReader();

  reader.onload = (e) => {
    const arrayBuffer = reader.result as ArrayBuffer;
    // console.log(new Uint8Array(arrayBuffer))
    tsParser(new Uint8Array(arrayBuffer));
  }

  reader.readAsArrayBuffer(file);
}

let cache = new Uint8Array();
let flag = true;
export function outputEs (data: Uint8Array, index: number, len: number, type: number, pts: number) {

  // console.log('num', num++);
  // console.log('type', type);
  // console.log('data', data);
  // console.log('index:', index);
  // console.log('pts', pts);
  // if (data[0] === 0 && data[1] === 0 && data[2] === 0 && data[3] === 1) {
  //   if (cache.length > 0) {
  //     parser.recvRTP(cache, pts);
  //   }
  //   cache = new Uint8Array();
  // } else {
  //   console.log(data.length)
  // }
  // if (flag) {
  //   console.log(data);
  //   write(data);
  //   download();
  //   flag = false;
  // }
  // write(data);
  // console.log('type', type);

  // console.log(cache);
  console.log('type:' + type);
  console.log('解析的数据：', data);
  if (type === 224) {
    // compareEs(data);
    write(data);
    // console.log('num', num++);
    // parser.recvRTP(data, pts);
    // console.log('data', data);
    // console.log('type:', type);
    // console.log('pts', pts);
  } else {
    // console.log('非视频----');
    // console.log('type', type);

  }
}