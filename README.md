# FOMO LOCO
FOMO LOCO is a multiplayer stock trading game made as a parody of/homage to the meme stock and crypto hysteria of early 2021. It uses a drop-in multiplayer model similar to slither.io and other io games. FOMO LOCO was originally developed for the 2021 Brackeys game jam (the theme was "stronger together") but was further developed quite a bit after its initial release in the jam.

## Running a local development build 
Running a local build for development is easy! First set up the server:
```
cd server
npm install
npm run dev
```
Then start the client:
```
cd ../client
npm install
npm start
```
The Create React App template that we are using includes hot reloading, however it is not always useful because when a hot reload is triggered it will reset your connection to the server. Changes that affect only CSS will take effect without reseting your connection. For changes to the server there is no hot reloading, you must always manually restart the server.

## Running a production build
```
cd client
npm install
npm run build
cd ../server
npm install forever -g
SECRET=mysecretcode forever start server.js
```
The SECRET env variable is used for sending messages to all connected clients and for boosting securities.

## Contributing
Feel free to contribute! If you are opening a PR, please thoroughly describe your changes. If you are opening an issue, please plan on fixing it yourself or else waiting a very long time.