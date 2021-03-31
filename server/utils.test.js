const utils = require("./utils.js");

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
