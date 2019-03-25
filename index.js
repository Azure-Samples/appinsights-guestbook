const url = process.env.MONGOLAB_URI || "mongodb://127.0.0.1:27017/guestbook";
let appInsights = require("applicationinsights");
appInsights.setup("5d2830ed-8910-4f41-9e77-d534dea79127")
    .setInternalLogging(true, true)
    .setUseDiskRetryCaching(false)
    .setSendLiveMetrics(true)
    .start();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const expressValidator = require('express-validator');
const mustacheExpress = require('mustache-express');
const mongoose = require('mongodb').MongoClient;
// const Signature = require('./models/signature.js')
const cors = require('cors')
var app = express();
const DB_NAME = 'appinsights-demo';
const COLLECTION_NAME = 'guestbook';
let collection = null;
var dbo = null;

//=========================//

//====SET APP ENGINE===//

app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', './views');
app.use(cors())
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(expressValidator());
app.use(express.static(path.join(__dirname, 'client/build')));

//====MONGOOSE PROMISE===//

mongoose.connect(url, function (err, db) {
  if (err) {
    console.log('Unable to connect to the mongoDB server. Error:', err);
  } else {
    dbo = db.db(DB_NAME);
    collection = db.db(DB_NAME).collection(COLLECTION_NAME);
    console.log('Connection established to', url);
  }
});


//====GET ALL SIGNATURES===//
app.get('/api/signatures', cors(), function(req, res) {
  dbo.collection(COLLECTION_NAME).find({}).toArray((err, result) => {
    if (err) throw err;
    res.json(result);
  })

});

//====POST NEW SIGNATURE===//
app.post('/api/signatures', cors(), function(req, res) {
  const entry = {
    email: req.body.email,
    guestSignature: req.body.guestSignature,
    message: req.body.message,
    team: req.body.team
  };

  collection.insertOne(entry, (err, result) => {
    if (err) throw err;
    console.log('Inserted 1 entry', entry);
    res.json(entry);
  });
});


//====SERVE STATIC REACT===//
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname+'/client/build/index.html'));
  });
//==========================//

//====APP LISTEN ON ENVIRONMENT PORT===//
app.listen(process.env.PORT || 3001);
//==========================//


// setInterval(() => appInsights.defaultClient.trackEvent({name: "my event", properties: {foo: 'event'}}), 100);
// setInterval(() => appInsights.defaultClient.trackTrace({message: "my event", properties: {foo: 'message'}}), 60000);
setInterval(() => appInsights.defaultClient.trackException({exception: new Error('my custom error2'), measurements: {meas1: 123.456}}), 60000);

//====EXPORT APP===//

module.exports = app;
