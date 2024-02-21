const SneaksAPI = require("sneaks-api");
const sneaks = new SneaksAPI();
const express = require("express");
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const session = require("express-session");
const app = express();
const url = require("url");
const { error } = require("console");

const sessionOptions = {
  secret: process.env.SECRET,
  resave: false,
  saveUnitialized: false,
  cookies: { max_age: 60_000 },
};
const portNum = process.env.PORT;
const hostNum = process.env.HOST;

app.use(session(sessionOptions));
app.use((req, res, next) => {
  req.session.commandCount ||= 0;
  req.session.commandCount++;

  next();
});
app.get("/", function (req, res) {});

app.get("/Products/Popular", function (req, res) {
  let limit = 0;
  const urlParts = url.parse(req.url, true);
  const query = urlParts.query;

  if (query.limit === undefined) {
    console.log("error");
    res.send({
      error:
        "missing limit its how much products you want to see ex: ?limit=10",
    });
  } else {
    valValidity = checkLimitValue(query.limit);
    if (valValidity) {
      console.log("true");
      getPopularProducts(query.limit, res, req);
    } else {
      console.log("false");
      res.send({
        error:
          "missing limit its how much products you want to see ex: ?limit=10",
      });
    }
  }
});

app.get("/Products/Search", function (req, res) {
  let isValid = false;
  const urlParts = url.parse(req.url, true);
  const query = urlParts.query;

  if (query.name === undefined || query.limit === undefined) {
    res.send({
      error:
        "missing limit its how much products you want to see ex: ?limit=10",
    });
  } else {
    validate(req, res, query.name, query.limit);
  }
});

app.get("/Products/Style", function (req, res) {
  const urlParts = url.parse(req.url, true);
  const query = urlParts.query;

  if (query.id === undefined && !!isNaN(parseInt(query.id))) {
    res.send({ error: "missing required parameter" });
  } else {
    findStyleId(query.id, res);
  }
});

function findStyleId(styleId, res) {
  sneaks.getProductPrices(styleId, function (err, products) {
    res.json(products);
  });
}

function validate(req, res, name, limit) {
  let valValidity = false;

  isValid = checkLimitValue(limit);

  if (isValid) {
    let returnedData = searchForSneaker(String(name), parseInt(limit), res);
  } else if (isValid === false) {
    res.send({
      error:
        "missing limit its how much products you want to see ex: ?limit=10",
    });
  }
}

function checkLimitValue(limitValue) {
  let valid = false;
  if (isNaN(limitValue)) {
    valid = false;
  } else if (!isNaN(limitValue)) {
    valid = true;
  }

  return valid;
}

function searchForSneaker(sneakerName, limit, res) {
  let data;
  sneaks.getProducts(sneakerName, limit, function (err, products) {
    if (err) {
      res.json({ error: "error missing proper parameter" });
    } else {
      res.json(products);
    }
  });
}

function getPopularProducts(limit, res, req) {
  sneaks.getMostPopular(limit, function (err, products) {
    res.send(products);
  });
}

function startListening() {
  console.log(`Listening at PORT: ${portNum} & HOST: ${hostNum}`);
}

app.listen(portNum, startListening);
