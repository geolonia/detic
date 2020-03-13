import jp from "./jp";

test("should detect 日本経緯度原点", async () => {
  const lat = 35.65810422222222;
  const lng = 139.74135747222223;
  expect(await jp([lng, lat])).toBeTruthy();
});

test("should not detect Tokyo Bay", async () => {
  const lat = 35.546346;
  const lng = 139.925237;
  expect(await jp([lng, lat])).toBe(false);
});
