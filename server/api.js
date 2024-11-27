const cors = require("cors");
const express = require("express");
const helmet = require("helmet");
const mongo = require("./mongo");

const PORT = 8092;

const app = express();

module.exports = app;

app.use(require("body-parser").json());
app.use(cors());
app.use(helmet());

app.options("*", cors());

app.get("/", (request, response) => {
  response.send({ ack: true });
});

app.get("/deals/search", async (request, response) => {
  try {
    const limit = parseInt(request.query.limit) || 20; // Limite par défaut : 20
    const page = parseInt(request.query.page) || 1;
    const sortBy = request.query.price || null;
    const order = parseInt(request.query.order) || -1;
    const filterBy = request.query.filterBy || null;

    const deals = await mongo.searchDeals(filterBy, sortBy, order, limit, page);

    response.send({ result: deals });
  } catch (error) {
    console.error(error);
    response.status(500).send({ error: "Internal Server Error" });
  }
});

app.get("/deals/:id", async (request, response) => {
  try {
    const dealId = request.params.id;

    const mongoDeals = await mongo.findDealById(dealId);
    response.send({ value: mongoDeals });
  } catch (error) {
    console.error(error);
    response.status(500).send({ error: "Internal Server Error" });
  }
});

app.get("/sales/search", async (request, response) => {
  try {
    const limit = parseInt(request.query.limit) || 20; // Limite par défaut : 20
    const page = parseInt(request.query.page) || 1;
    const legoId = request.query.page || "";

    const deals = await mongo.searchSales(legoId, limit, page);

    response.send({ result: deals });
  } catch (error) {
    console.error(error);
    response.status(500).send({ error: "Internal Server Error" });
  }
});

app.listen(PORT);

console.log(`📡 Running on port ${PORT}`);
