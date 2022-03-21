export function concatUint8 (...args: Uint8Array[]) {
  const length = args.reduce((len, cur) => (len += cur.byteLength), 0);
  const result = new Uint8Array(length);

  let offset = 0;
  args.forEach(uint8 => {
    result.set(uint8, offset);
    offset += uint8.byteLength;
  });

  return result;
}

export function byte2HexString (byte: number) {
  const hex = byte.toString(16);
  return hex.length < 2 ? `0${hex}` : hex;
}