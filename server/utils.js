const _ = require("lodash");

const forbiddenWords = ["nigger"];

function sampleWeighted(items, weightFunction) {
  var i;
  let weights = items.map((item) => weightFunction(item));

  if (weights.some((w) => isNaN(w) || w < 0)) {
    console.log("invalid sample weights", weights);
    return _.sample(items);
  }

  if (weights.every((w) => w === 0)) {
    return _.sample(items);
  }

  for (i = 0; i < weights.length; i++) weights[i] += weights[i - 1] || 0;

  var random = Math.random() * weights[weights.length - 1];

  for (i = 0; i < weights.length; i++) if (weights[i] > random) break;

  if (items[i] === undefined) {
    console.log("Warning: sampleWeighted encountered undefined result");
    console.log(`items: ${items}`);
    console.log(`weights: ${weights}`);
    console.log(`index: ${i}`);
    return _.sample(items);
  }

  return items[i];
}

function usernameIsForbidden(username) {
  for (let i = 0; i < forbiddenWords.length; i++) {
    if (username.toLowerCase().includes(forbiddenWords[i].toLowerCase())) {
      return true;
    }
  }
  return false;
}

module.exports = { sampleWeighted, usernameIsForbidden };
