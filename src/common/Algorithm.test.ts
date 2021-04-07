import Algorithm from "./Algorithm";

describe("swap", () => {
  test("swap the same index", () => {
    const arr = [0, 1, 2];
    Algorithm.swap(arr, 0, 0);
    expect(arr).toStrictEqual([0, 1, 2]);
  });

  test("swap different indices", () => {
    const arr = [0, 1, 2];
    Algorithm.swap(arr, 0, 1);
    expect(arr).toStrictEqual([1, 0, 2]);
  });
});

describe("shuffle", () => {
  // cannot seed Math.random()
});
