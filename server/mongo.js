const { MongoClient, ServerApiVersion } = require("mongodb");
const uri =
  "mongodb+srv://melaniehernandez:Ng8bFseszAgwY16K@cluster0.lbsz0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
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
    // Connect the client to the server	(optional starting in v4.7)
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

//run().catch(console.dir);
