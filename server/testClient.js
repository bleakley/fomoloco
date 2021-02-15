const io = require("socket.io-client");

socket = io("http://localhost:8080", { query: "username=dfv" });

socket.on("assets", (assets) => {
  for (asset of assets) {
    console.log(`${asset.symbol} ${asset.name} ${asset.price}`);
  }
});

socket.on("prices", (assets) => {
  console.log();
  for (asset of assets) {
    console.log(`${asset.symbol} ${asset.price}`);
  }
  console.log();
});

socket.on("hype-message", (data) => {
  console.log(`${data.name} says "${data.text}"`);
});

socket.on("news", (message) => {
  console.log(message);
});

socket.on("transaction", (transaction) => {
  switch (transaction.type) {
    case "buy":
      console.log(
        `Bought ${transaction.shares} @ ${transaction.price}. Now have ${transaction.newShares} ${transaction.symbol} and \$${transaction.newCash}"`
      );
      break;
    case "sell":
      console.log(
        `Sold  ${transaction.shares} @ ${transaction.price}. Now have ${transaction.newShares} ${transaction.symbol} and \$${transaction.newCash}"`
      );
      break;
    case "starting-cash":
      console.log(
        `You borrow \$${transaction.cash} from your wife's boyfriend to begin trading`
      );
      break;
  }
});

socket.on("leaderboard", (leaderboard) => {
  console.log(leaderboard);
});

socket.emit("buy-asset", { symbol: "BVR", shares: 1 });
socket.emit("shill-asset", "BVR");
socket.emit("sell-asset", { symbol: "BVR", shares: 1 });
socket.emit("buy-upgrade", "botnet");
