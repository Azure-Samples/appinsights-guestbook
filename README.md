# Application Insights Guestbook Demo

This demo is to show how you can instrument the Node and Browser Application Insights SDKs into a single [MERN](https://en.wikipedia.org/wiki/Solution_stack#cite_ref-WilsonMERN18_18-0) app. The guestbook  interacts with a local `Express` API to add/retrieve guestbook entries from an extern `Mongo` database. The front-end is written in `React`. You must supply your own mongoDB url in `index.js` in order to run!

```
npm install
npm run start-test
```

![Application Insights Guestbook page](https://i.imgur.com/HrcwhNV.png)

- http://appinsights-guestbook.azurewebsites.net/


## How to get the SDKs

**Browser SDK**
```zsh
npm i --save @microsoft/applicationinsights-web
```

**Node SDK**
```zsh
npm i --save applicationinsights
```
