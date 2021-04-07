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
}

export default Algorithm;
