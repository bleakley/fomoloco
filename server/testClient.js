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
  console.log(`${data.username} says "${data.message}"`);
});

socket.on("order-result", (data) => {
  if (data.status === "success") {
    console.log(`Gained ${data.shares} ${data.symbol} and \$${data.cash}"`);
  } else {
    console.log(
      "Due to highly volatile market conditions, we are unable to process your transaction at this time."
    );
  }
});

socket.emit("buy-asset", "BVR");
socket.emit("shill-asset", "BVR");
socket.emit("sell-asset", "BVR");
socket.emit("buy-upgrade", "botnet");
