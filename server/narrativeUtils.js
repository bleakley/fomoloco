const _ = require("lodash");

function generatePlanet() {
  return _.sample([`Mars`, `Jupiter`, `Saturn`, `Uranus`, `Neptune`, `Pluto`]);
}

function generatePlanetPair() {
  let firstPlanet = generatePlanet();
  let secondPlanet = generatePlanet();
  while (firstPlanet === secondPlanet) {
    secondPlanet = generatePlanet();
  }
  return [firstPlanet, secondPlanet];
}

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
    : generatePlanet().toUpperCase();
  let text = "";
  if (definiteArticle) text += "the ";
  if (expletive)
    text +=
      _.sample(["fuckin", "fucking", "freakin", "freaking", "friggin"]) + " ";
  text += name;
  return text;
}

function generateAstrologicalEvent() {
  let planets = generatePlanetPair();
  return _.sample(
    [`${planets[0]} in retrograde`],
    [`${planets[0]}-${planets[1]} conjunction`]
  );
}

function generateHackerOrg() {
  return _.sample([
    _.sample([5, 6, 7, 9]).toString() + "chan",
    "Russian",
    "Chinese",
    "Ransomware",
    "Unidentified",
  ]);
}

function generateLyric(symbol) {
  if (symbol === 'BB') {
    return `🎵 Hit me $BB one more time! 🎵`;
  }
  if (symbol === 'BVR') {
    return `🎵 When you wish upon a star ⭐ 🎵 it's time to buy more $BVR 🎵`;
  }
  return `🎵 There once was a stock that put to sea 🌊⛵ 🎵 and the name of the stock was \$${symbol} 🎵`
}

function generateCcgCard() {
  let card = _.sample(["holofoil charizard", "alpha black lotus"]);
  if (Math.random() <= 0.3) {
    let grade = `${_.sample(["PSA", "BGS"])} ${_.sample(["9", "9.5", "10"])}`;
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
    "open-source",
  ])} ${_.sample([
    "quantum",
    "quantum-ready",
    "quantum-resistant",
    "enterprise",
    "SNP genotyping",
    "predictive",
  ])} ${_.sample([
    "mainnet",
    "augmented-reality platform",
    "AI platform",
    "smart-contract framework",
    "drug discovery pipeline",
    "biopharma accelerator",
    "CRISPR theraputic",
    "protein folding algorithm",
    "deep-learning model",
  ])}`;
}

function generateCelebrity() {
  return _.sample([
    "Bernie Sanders",
    "Hunter Biden",
    "Alexandria Ocasio-Cortez",
    "Andrew Yang",
    "Ivanka Trump",
    "Kim Kardashian",
    "Kanye West",
    "Tom Hanks",
    "Idris Elba",
    "Gene Simmons",
    "John McAfee",
    "Elon Musk",
    "Peter Thiel",
    "Chamath Palihapitiya",
    "Mark Cuban",
    "Vitalik Buterin",
    "Charles Hoskinson",
    "Michael Burry",
    "Ryan Cohen",
    "PewDiePie",
    "Mr. Beast",
    "Pokimane",
    "Paris Hilton",
    "Larry David",
    "J.K. Rowling",
    "George R.R. Martin",
    "Paul Hollywood",
    "Simon Cowell",
    "Joe Rogan",
    "Jack Ma",
    "Martin Shkreli",
    "Changpeng Zhao",
    "LeBron James",
    "Charli D'Amelio",
    "Autumn Rose",
    "Belle Delphine",
    "Snoop Dogg",
    "John Cena",
    "Gal Gadot",
    "Psy",
    "Hayden Christensen",
    "Maren Altman",
    "Tai Lopez",
    "Ludacris",
    "Dasha Nekrasova",
    "Anna Khachiyan",
    "Kim Dotcom",
    "Lil Nas X",
    _.sample([
      "Sporty Spice",
      "Baby Spice",
      "Ginger Spice",
      "Victoria Beckham",
    ]),
  ]);
}

module.exports = {
  generateAstronomicalBody,
  generateAstrologicalEvent,
  generateHackerOrg,
  generateTechnologyProduct,
  generateCcgCard,
  generateCelebrity,
  generateLyric,
};
