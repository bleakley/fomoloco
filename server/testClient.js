const io = require("socket.io-client");

socket = io("http://localhost:8080", { query: "username=dfv" });

socket.on("assets", (assets) => {
  for (asset of assets) {
    console.log(`${asset.symbol} ${asset.name} ${asset.price}`);
  }
});

socket.on("prices", (assets) => {
  for (asset of assets) {
    console.log(`${asset.symbol} ${asset.price}`);
  }
});

socket.on("hype-message", (data) => {
  console.log(`${data.username} says "${data.message}"`);
});

socket.emit("buy-asset", "BVR");
socket.emit("shill-asset", "BVR");
socket.emit("sell-asset", "BVR");
socket.emit("buy-upgrade", "botnet");
