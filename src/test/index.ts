let esResult: Uint8Array;

let esIndex = 0; // 比较第几块分片
let esSliceIndex = 0; // 比较分片的下标
let esFlag = false;
const resultEs = document.getElementById('result') as any;
if (resultEs) {
  resultEs.addEventListener('change', processResultFiles)
}

function processResultFiles () {
  const file = resultEs.files[0];
  const reader = new FileReader();

  reader.onload = (e) => {
    const arrayBuffer = reader.result as ArrayBuffer;
    esResult = new Uint8Array(arrayBuffer);
    console.log('result.es加载成功，length:', esResult.length)
  }

  reader.readAsArrayBuffer(file);
}
let test = true;

export function compareEs (data: Uint8Array) {
  if (esFlag) {
    return;
  }
  for (let i = 0; i < data.length; i++) {
    if (esIndex === 251 && test) {
      esResult = esResult.subarray(247);
      console.log('比较的esResult:', esResult.subarray(0, data.length));
      test = false;
    }
    if (esResult[0] === data[i]) {
      esResult = esResult.subarray(1);
    } else {
      esFlag = true;
      console.log('比较第几块分片:', esIndex);
      console.log('比较分片的下标:', i);
      console.log('data：', data);
      console.log('pureData:', esResult.subarray(0, 1000));

      // break;
    }
  }
  esIndex++;
  console.log('esFlag', esFlag)
}