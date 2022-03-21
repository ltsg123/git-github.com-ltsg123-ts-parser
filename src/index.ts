import _H264Parser from './codec/common/h264/h264_parser';
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

}

function processFiles () {
  const file = source.files[0];
  const reader = new FileReader();

  reader.onload = (e) => {
    const arrayBuffer = reader.result as ArrayBuffer;
    tsParser(new Uint8Array(arrayBuffer));
  }

  reader.readAsArrayBuffer(file);
}

export function outputEs (data: Uint8Array, index: number, len: number, type: number, pts: number) {

  // console.log('data', data);
  if (type === 224) {
    // console.log('num', num++);
    // parser.recvRTP(data, pts);
    console.log('data', data);
    // console.log('type:', type);
    // console.log('pts', pts);
  }
}