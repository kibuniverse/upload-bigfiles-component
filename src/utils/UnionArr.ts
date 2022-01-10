export default function unionArr(arr: Array<File>): Array<File> {
  let returnArr: Array<File> = [];
  for (let i = 0, len = arr.length; i < len; i++) {
    let flag: number = 0;
    for (let j = 0, lenj = returnArr.length; j < lenj; j++) {
      if (arr[i].name === returnArr[j].name) {
        flag = 1;
      }
    }
    if (flag === 0) {
      returnArr.push(arr[i]);
    }
  }
  return returnArr;
}
