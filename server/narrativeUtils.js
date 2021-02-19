const _ = require("lodash");

function generateAstronomicalBody() {
  let expletive = Math.random() <= 0.3;
  let definiteArticle = Math.random() <= 0.7;
  let name = definiteArticle
    ? _.sample([
        `MOON`,
        `MOOON`,
        `MOOOON`,
        `MOOOOOOOON`,
        "SUN",
        "SUN",
        "ANDROMEDA GALAXY",
        "VOYAGER PROBE",
      ])
    : _.sample([`MARS`, `JUPITER`, `SATURN`, `URANUS`, `NEPTUNE`, `PLUTO`]);
  let text = "";
  if (definiteArticle) text += "the ";
  if (expletive)
    text += _.sample(["fuckin", "fucking", "freakin", "freaking"]) + " ";
  text += name;
  return text;
}

function generateHackerOrg() {
  return _.sample([
    _.sample([5, 6, 7, 9]).toString() + "chan",
    "Russian",
    "Chinese",
    "Ransomware"
  ]);
}

function generateCcgCard() {
  let card = _.sample(['holofoil charizard', 'alpha black lotus']);
  if (Math.random() <= 0.3) {
    let grade = `${_.sample(['PSA', 'BGS'])} ${_.sample(['9', '9.5', '10'])}`;
    card = `${grade} ${card}`;
  }
  return card;
}

function generateTechnologyProduct() {
  return `${_.sample([
    "cloud-first",
    "multi-cloud",
    "decentralized",
    "hybrid",
    "scalable",
    '"revolutionary"',
    "high-throughput",
  ])} ${_.sample([
    "quantum",
    "quantum-ready",
    "quantum-resistant",
    "enterprise",
    "SNP genotyping",
    "protein folding",
    "predictive modeling",
  ])} ${_.sample([
    "mainnet",
    "augmented-reality platform",
    "AI platform",
    "smart contract framework",
    "drug discovery pipeline",
    "biopharma accelerator",
    "CRISPR theraputic",
    "deep-learning model",
  ])}`;
}

module.exports = { generateAstronomicalBody, generateHackerOrg, generateTechnologyProduct, generateCcgCard };
