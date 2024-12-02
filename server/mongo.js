const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri =
  "mongodb+srv://melaniehernandez:Ng8bFseszAgwY16K@clusterlego.lbsz0.mongodb.net/?retryWrites=true&w=majority&appName=ClusterLego";
const MONGODB_DB_NAME = "lego";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

module.exports.run = async (deals, name) => {
  try {
    // Connect the client to the server
    await client.connect();

    const db = client.db(MONGODB_DB_NAME);

    const collection = db.collection(name);

    // delete les precedentes valeurs de la collection avant d'insérer les nouvelles
    await collection.deleteMany({});

    const result = await collection.insertMany(deals);

    console.log(
      "InsertMany result:",
      result.insertedCount,
      "documents insérés."
    );

    console.log("result", result);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
};

module.exports.mostCommented = async () => {
  try {
    await client.connect();
    const db = client.db(MONGODB_DB_NAME);

    const collection = db.collection("deals");

    const comments = await collection.find({ comments: { $gt: 15 } }).toArray();

    return comments;
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
};

module.exports.bestDiscounts = async () => {
  try {
    await client.connect();
    const db = client.db(MONGODB_DB_NAME);

    const collection = db.collection("deals");

    const discount = await collection.find({ discount: { $gt: 50 } }).toArray();

    return discount;
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
};

module.exports.hotDeals = async () => {
  try {
    await client.connect();
    const db = client.db(MONGODB_DB_NAME);

    const collection = db.collection("deals");

    const legos = await collection
      .find({ temperature: { $gt: 100 } })
      .toArray();

    return legos;
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
};

module.exports.sortByPrice = async () => {
  try {
    await client.connect();
    const db = client.db(MONGODB_DB_NAME);

    const collection = db.collection("deals");

    var sortAsc = { price: -1 };

    const sorted = await collection.find().sort(sortAsc).toArray();

    return sorted;
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
};

module.exports.sortByDate = async () => {
  try {
    await client.connect();
    const db = client.db(MONGODB_DB_NAME);

    const collection = db.collection("deals");

    var sortAsc = { published: -1 };

    const sorted = await collection.find().sort(sortAsc).toArray();

    console.log(sorted);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
};

module.exports.findDealById = async (id) => {
  try {
    await client.connect();
    const db = client.db(MONGODB_DB_NAME);

    const collection = db.collection("deals");

    var o_id = new ObjectId(id);

    const legos = await collection.find({ _id: o_id }).toArray();

    return legos;
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
};

module.exports.findSaleByLegoId = async (id) => {
  try {
    await client.connect();
    const db = client.db(MONGODB_DB_NAME);

    const collection = db.collection("sales");

    const legos = await collection.find({ legoId: id }).toArray();

    return legos;
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
};

//mostCommented().catch(console.dir);

module.exports.searchDeals = async ({
  filterBy,
  sortBy,
  order,
  limit,
  page,
}) => {
  try {
    await client.connect();
    const db = client.db(MONGODB_DB_NAME);
    const collection = db.collection("deals");

    // Étape 1 : Construire le pipeline
    const pipeline = [];

    // 1. Filtrage
    switch (filterBy) {
      case "most-commented":
        pipeline.push({ $match: { comments: { $gt: 15 } } });
        break;
      case "best-discount":
        pipeline.push({ $match: { discount: { $gt: 50 } } });
        break;
      case "hot-deals":
        pipeline.push({ $match: { temperature: { $gt: 100 } } });
        break;
    }

    // Étape 2 : Compter le total avant pagination
    const totalPipeline = [...pipeline, { $count: "total" }];
    const totalCountResult = await collection
      .aggregate(totalPipeline)
      .toArray();
    const total = totalCountResult[0]?.total || 0;

    // 2. Tri par prix ou date
    if (sortBy === "price") {
      pipeline.push({
        $sort: { price: order },
      });
    } else if (sortBy === "date") {
      pipeline.push({
        $sort: { published: order },
      });
    }

    // 3. Pagination (skip et limit)
    const skip = (page - 1) * limit;
    pipeline.push({ $skip: skip }, { $limit: limit });

    // Étape 2 : Exécuter le pipeline
    const results = await collection.aggregate(pipeline).toArray();

    return { total, results };
  } finally {
    await client.close();
  }
};

module.exports.searchSales = async ({ legoId, limit, page }) => {
  try {
    await client.connect();
    const db = client.db(MONGODB_DB_NAME);
    const collection = db.collection("sales");

    const pipeline = [];

    pipeline.push({ $match: { legoId: legoId } });

    // Étape 2 : Compter le total avant pagination
    const totalPipeline = [...pipeline, { $count: "total" }];
    const totalCountResult = await collection
      .aggregate(totalPipeline)
      .toArray();
    const total = totalCountResult[0]?.total || 0;

    pipeline.push({
      $sort: { published: -1 },
    });

    const skip = (page - 1) * limit;
    pipeline.push({ $skip: skip }, { $limit: limit });

    const results = await collection.aggregate(pipeline).toArray();

    return { total, results };
  } finally {
    await client.close();
  }
};
