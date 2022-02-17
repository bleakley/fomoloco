const utils = require("./utils.js");
const narrativeUtils = require("./narrativeUtils.js");

test("sample weighted", () => {
  let items = [{name: 'a', weight: 1}, {name: 'b', weight: 0}];
  let sampled = utils.sampleWeighted(items, w => w.weight);
  expect(sampled.name).toBe('a');
});

test("sample weighted NaN", () => {
  let items = [{name: 'a', weight: 1}, {name: 'b', weight: NaN}];
  let sampled = utils.sampleWeighted(items, w => w.weight);
  expect(sampled.name).toBeDefined();
});

test("sample weighted negative", () => {
  let items = [{name: 'a', weight: 1}, {name: 'b', weight: -1}];
  let sampled = utils.sampleWeighted(items, w => w.weight);
  expect(sampled.name).toBeDefined();
});

test("sample weighted zeroes", () => {
  let items = [{name: 'a', weight: 0}, {name: 'b', weight: 0}];
  let sampled = utils.sampleWeighted(items, w => w.weight);
  expect(sampled.name).toBeDefined();
});

test("generateLyric", () => {
  let bvr = narrativeUtils.generateLyric('BVR');
  let sdg = narrativeUtils.generateLyric('SDG');
  let bb = narrativeUtils.generateLyric('BB');
  let mnc = narrativeUtils.generateLyric('MNC');
  expect(bvr).toBe(`🎵 When you wish upon a star ⭐ 🎵 it's time to buy more $BVR 🎵`);
  expect(sdg).toBe(`🎵 There once was a stock that put to sea 🌊⛵ 🎵 and the name of the stock was $SDG 🎵`);
  expect(bb).toBe(`🎵 Hit me $BB one more time! 🎵`);
  expect(mnc).toBe(`🎵 There once was a stock that put to sea 🌊⛵ 🎵 and the name of the stock was $MNC 🎵`);
});