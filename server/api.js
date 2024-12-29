const cors = require("cors");
const express = require("express");
const helmet = require("helmet");
const mongo = require("./mongo");

const PORT = process.env.PORT || 8092;

const app = express();

module.exports = app;

const corsOptions = {
  origin: "*", // Remplacez par le domaine de votre client
  methods: ["GET", "POST", "PUT", "DELETE"], // Méthodes autorisées
  allowedHeaders: ["Content-Type", "Authorization"], // En-têtes autorisés
};

app.use(cors(corsOptions));

app.use(require("body-parser").json());
app.use(helmet());

app.options("*", cors(corsOptions));

app.get("/", (request, response) => {
  response.send({ ack: true });
});

app.get("/deals/search", async (request, response) => {
  try {
    const limit = parseInt(request.query.limit) || 20; // Limite par défaut : 20
    const page = parseInt(request.query.page) || 1;
    const sortBy = request.query.sortBy || null;
    const order = parseInt(request.query.order) || -1;
    const filterBy = request.query.filterBy || null;

    console.log("values : ", limit, page, sortBy, order, filterBy);

    const { total, results } = await mongo.searchDeals({
      filterBy,
      sortBy,
      order,
      limit,
      page,
    });

    console.log("results", results);

    response.send({
      total, // Nombre total de résultats correspondant aux filtres
      page, // Page actuelle
      limit, // Limite par page
      results, // Résultats de la page actuelle
    });
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
    const legoId = request.query.legoId || "";

    const { total, results } = await mongo.searchSales({ legoId, limit, page });

    response.send({
      total, // Nombre total de résultats correspondant aux filtres
      page, // Page actuelle
      limit, // Limite par page
      results, // Résultats de la page actuelle
    });
  } catch (error) {
    console.error(error);
    response.status(500).send({ error: "Internal Server Error" });
  }
});

app.listen(PORT, () => console.log(`📡 Running on port ${PORT}`));
