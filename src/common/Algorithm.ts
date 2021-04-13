class Algorithm {
  public static swap<T>(arr: T[], i: number, j: number): void {
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }

  public static shuffle<T>(arr: T[]): void {
    for (let i = 0; i < arr.length - 1; i++) {
      const indexToSwap = i + Math.floor(Math.random() * (arr.length - i));
      Algorithm.swap(arr, i, indexToSwap);
    }
  }

  public static randomChar() {
    const candidates =
      "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
    const index = Math.floor(Math.random() * candidates.length);
    return candidates[index];
  }

  public static randomString(length: number) {
    let res = "";
    for (let i = 0; i < length; i++) {
      res += Algorithm.randomChar();
    }
    return res;
  }
}

export default Algorithm;
