const _ = require("lodash");

function sampleWeighted(items, weightFunction) {
  var i;
  let weights = items.map((item) => weightFunction(item));

  if (
    weights.reduce((a, b) => {
      return a + b;
    }) == 0
  )
    return _.sample(items);

  for (i = 0; i < weights.length; i++) weights[i] += weights[i - 1] || 0;

  var random = Math.random() * weights[weights.length - 1];

  for (i = 0; i < weights.length; i++) if (weights[i] > random) break;

  return items[i];
}

module.exports = { sampleWeighted };
