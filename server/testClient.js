const io = require("socket.io-client");

socket = io("http://localhost:8080", { query: "username=dfv" });

socket.on("assets", (assets) => {
  for (asset of assets) {
    console.log(`${asset.symbol} ${asset.name} ${asset.price}`);
  }
});

socket.on("price", (data) => {
  console.log(`${data.symbol} now at ${data.price}`);
});

socket.on("shill", (data) => {
  console.log(`${data.username} says "${data.message}"`);
});

socket.emit("buy-asset", { symbol: "BVR", shares: 10 });
socket.emit("shill-asset", { symbol: "BVR" });
socket.emit("sell-asset", { symbol: "BVR", shares: 10 });
socket.emit("buy-upgrade", { name: "botnet" });
