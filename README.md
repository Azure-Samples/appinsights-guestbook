---
page_type: sample
languages:
- javascript
- html
products:
- azure
description: "This demo is to show how you can instrument the Node.js and Browser Application Insights SDKs into a single MERN app."
urlFragment: appinsights-guestbook
---

# Application Insights Guestbook Demo

This demo is to show how you can instrument the Node.js and Browser Application Insights SDKs into a single [MERN](https://en.wikipedia.org/wiki/Solution_stack#cite_ref-WilsonMERN18_18-0) app. The guestbook  interacts with a local `Express` API to add/retrieve guestbook entries from an extern `Mongo` database. The front-end is written in `React`. You must supply your own mongoDB url in `index.js` in order to run!

```
mongod
npm install
npm --prefix ./client/node_modules install ./client
npm run start-both
```

## How to get the SDKs for your own application

**Browser SDK**
```zsh
npm i --save @microsoft/applicationinsights-web
```

**Node.js SDK**
```zsh
npm i --save applicationinsights
```

**Extended Node.js Metrics (Optional)
```zsh
npm i --save applicationinsights-native-metrics
```
