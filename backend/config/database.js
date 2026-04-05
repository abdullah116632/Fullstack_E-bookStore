import mongoose from 'mongoose';

const migrateOrdersToPurchesIfNeeded = async (conn) => {
  try {
    const db = conn.connection.db;
    const collections = await db.listCollections({}, { nameOnly: true }).toArray();
    const collectionNames = new Set(collections.map((item) => item.name));

    if (!collectionNames.has('purches')) {
      await db.createCollection('purches');
      console.log('✓ Created purches collection');
    }

    const hasOrders = collectionNames.has('orders');
    if (!hasOrders) return;

    const ordersCollection = db.collection('orders');
    const purchesCollection = db.collection('purches');

    const [ordersCount, purchesCount] = await Promise.all([
      ordersCollection.countDocuments(),
      purchesCollection.countDocuments(),
    ]);

    if (!ordersCount) return;

    // If purches already has docs, only backfill missing IDs from orders.
    if (purchesCount > 0) {
      const existingIds = new Set(
        (await purchesCollection.find({}, { projection: { _id: 1 } }).toArray()).map((doc) => String(doc._id))
      );

      const missingDocs = await ordersCollection
        .find({ _id: { $nin: Array.from(existingIds).map((id) => new mongoose.Types.ObjectId(id)) } })
        .toArray();

      if (missingDocs.length) {
        await purchesCollection.insertMany(missingDocs, { ordered: false });
        console.log(`✓ Migrated ${missingDocs.length} missing documents from orders -> purches`);
      }
      return;
    }

    const docs = await ordersCollection.find({}).toArray();
    if (!docs.length) return;

    await purchesCollection.insertMany(docs, { ordered: false });
    console.log(`✓ Migrated ${docs.length} documents from orders -> purches`);
  } catch (error) {
    console.warn(`! orders -> purches migration skipped: ${error.message}`);
  }
};

const connectDB = async () => {
  try {
    const mongooseOptions = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    };

    // For MongoDB Atlas, disable SSL certificate verification for development
    if (process.env.MONGODB_URI.includes('mongodb+srv://')) {
      mongooseOptions.tls = true;
      mongooseOptions.tlsInsecure = true; // Allow self-signed certificates (dev only)
      mongooseOptions.retryWrites = true;
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, mongooseOptions);

    await migrateOrdersToPurchesIfNeeded(conn);

    console.log(`✓ MongoDB Connected: ${conn.connection.host}`);
    console.log(`✓ Database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`✗ MongoDB Connection Error: ${error.message}`);
    console.error(`  Hint: Check if your MongoDB Atlas IP whitelist includes your current IP`);
    console.error(`  Or use local MongoDB: MONGODB_URI=mongodb://localhost:27017/ebook-marketplace`);
    process.exit(1);
  }
};

export default connectDB;
