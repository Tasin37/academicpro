const mongoose = require('mongoose');

const IMAGES = {
  'how-to-structure-a-literature-review': 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1200&q=80',
  'mastering-apa-7th-edition-citation-pitfalls': 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=1200&q=80',
  '5-time-management-habits-college-students': 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80',
  'database': 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=1200&q=80',
};

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const postsCollection = mongoose.connection.collection('posts');

  for (const [slug, coverImage] of Object.entries(IMAGES)) {
    const res = await postsCollection.updateOne({ slug }, { $set: { coverImage } });
    console.log(`Updated ${slug}: matched=${res.matchedCount}, modified=${res.modifiedCount}`);
  }

  process.exit(0);
}

run();
