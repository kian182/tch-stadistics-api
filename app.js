'use strict';
import _ from "lodash";
import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import path from "path";
import cors from "cors";

/*** Import Models ***/
import Task from "./api/models/todoListModel";
import User from "./api/models/userModel";
import TK from "./api/models/token.model";
import License from "./api/models/license.model";

/*** Import Controllers ***/
import tkHandlers from "./api/services/token.service";
import utils from "./api/utils/utils.service";

import routes from "./api/routes/todoListRoutes";
import config from "./api/config"

const app = express();
const port = process.env.PORT || 80;

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/SF-LicGenerator', {useMongoClient: true});

app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));
app.use("/", express.static(__dirname + 'public/index.html'))

/*** Set PATH  ***/

config.setPATH(__dirname);

/*** Interceptor ***/
app.use((req, res, next) => {
  if (req.headers && req.headers.authorization && req.headers.authorization.split(' ')[0] === 'SFT') {
    tkHandlers.getToken('tk', req.headers.authorization.split(' ')[1]).then((token) => {
      let tk = token[0];
      if (!tk) {
        req.userId = undefined;
        return next();
      } else if (utils.convISODateToTimestamp(tk.expirationDate) < Date.now()) {
        // tkHandlers.deleteOne('tk', tk.tk);
        req.userId = undefined;
      } else {
        req.userId = tk.userId;
      }
      return next();
    });
  } else {
    req.userId = undefined;
    next();
  }
});
routes(app);

app.use((req, res) => {
  res.status(404).send({url: req.originalUrl + ' not found'})
});

app.listen(port);
console.log('todo list RESTful API server started on: ' + port);
module.exports = app;
