const { strict } = require("assert");
//const cors = require("cors");
const express = require("express");
const app = express();
//app.use(cors());
app.use(express.json());

// start example
const k8s = require('@kubernetes/client-node');

const kc = new k8s.KubeConfig();
kc.loadFromDefault();

const k8sApi = kc.makeApiClient(k8s.CoreV1Api);

k8sApi.listNamespacedPod('default').then((res) => {
    console.log(res.body);
});
// end example

const http = require("http").createServer(app);

const port = process.env.PORT || 80;

const game_client_root = require("path").join(
  __dirname,
  "..",
  "client",
  "build"
);
app.use(express.static(game_client_root));

let serverCreatedAt = new Date();

app.get("/test", async (req, res) => {
  let data = await k8sApi.listNamespacedPod('default');
  res.send({
    data
  });
});

app.get("/market/:marketId", (req, res) => {
  let marketId = req.params.marketId;
  if (marketId === 'new') {

  } else if (marketId === 'next') {

  } else if (marketId)
  res.send({
    status: "online",
    serverHours: (new Date() - serverCreatedAt) / (60 * 60 * 1000),
    ...marketManager.getStats(),
  });
});

http.listen(port, () => {
  console.log(new Date().toString() + " listening on port " + port + "...");
});
