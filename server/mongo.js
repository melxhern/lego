const { MongoClient, ServerApiVersion } = require("mongodb");
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

async function mostCommented() {
  try {
    await client.connect();
    const db = client.db(MONGODB_DB_NAME);

    const collection = db.collection("deals");

    const comments = await collection.find({ comments: { $gt: 15 } }).toArray();

    console.log(comments);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

async function bestDiscounts() {
  try {
    await client.connect();
    const db = client.db(MONGODB_DB_NAME);

    const collection = db.collection("deals");

    const discount = await collection.find({ discount: { $gt: 50 } }).toArray();

    console.log(discount);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

async function hotDeals() {
  try {
    await client.connect();
    const db = client.db(MONGODB_DB_NAME);

    const collection = db.collection("deals");

    const legos = await collection
      .find({ temperature: { $gt: 100 } })
      .toArray();

    console.log(legos);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

async function sortByPrice() {
  try {
    await client.connect();
    const db = client.db(MONGODB_DB_NAME);

    const collection = db.collection("deals");

    var sortAsc = { price: -1 };

    const sorted = await collection.find().sort(sortAsc).toArray();

    console.log(sorted);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

async function sortByDate() {
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
}

async function findByLegoId(id) {
  try {
    await client.connect();
    const db = client.db(MONGODB_DB_NAME);

    const collection = db.collection("sales");

    const legos = await collection.find({ legoId: id }).toArray();

    console.log(legos);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

//mostCommented().catch(console.dir);

//bestDiscounts().catch(console.dir);

//hotDeals().catch(console.dir);

//sortByPrice().catch(console.dir);

//sortByDate().catch(console.dir);

//findByLegoId("75378").catch(console.dir);
