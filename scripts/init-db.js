const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('Error: MONGODB_URI is not set. Run with: node --env-file=.env.local scripts/init-db.js');
  process.exit(1);
}

const COLLECTIONS = [
  'users',
  'students',
  'writers',
  'orders',
  'posts',
  'testimonials',
  'faqs',
  'contactinquiries',
  'payments',
  'reviews',
  'messages',
  'notifications',
];

async function main() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(uri);
    console.log('Connected successfully!');

    const db = mongoose.connection.db;
    const existingCollections = await db.listCollections().toArray();
    const existingNames = new Set(existingCollections.map((c) => c.name));

    console.log('\nCurrent collections in database:');
    existingNames.forEach((name) => console.log(` - ${name}`));

    console.log('\nChecking and creating collections:');
    for (const name of COLLECTIONS) {
      if (!existingNames.has(name)) {
        await db.createCollection(name);
        console.log(` ✓ Created collection: ${name}`);
      } else {
        console.log(` • Already exists:     ${name}`);
      }
    }

    // Ensure index on posts.slug
    const postsCollection = db.collection('posts');
    await postsCollection.createIndex({ slug: 1 }, { unique: true });
    console.log(' ✓ Ensured unique index on posts.slug');

    // Ensure index on users.email
    const usersCollection = db.collection('users');
    await usersCollection.createIndex({ email: 1 }, { unique: true });
    console.log(' ✓ Ensured unique index on users.email');

    console.log('\nAll collections and indexes are ready in MongoDB Atlas!');
  } catch (err) {
    console.error('Error initializing MongoDB collections:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

main();
