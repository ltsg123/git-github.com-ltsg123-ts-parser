import { saveAs } from 'file-saver';

let cache: any = [];

const log: any = [];
export function download (name?: string) {
  const blob = new Blob(cache, { type: 'application/octet-stream' });
  saveAs(blob, name ? name + '.es' : 'test.es');
}

export function write (data: Uint8Array) {
  cache.push(data);
}